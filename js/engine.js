//Timer
import * as tracker from "./tracker.js";
import { startTimer, resetTimerMode, clearTimer } from "./timer.js";
import { getPassage } from "./passages.js";
import {
  currentMode,
  setCurrentMode,
  updateModeDisplay,
  updateProgressBar,
  timerElement,
  wordElement,
  currentSize,
  updateFontSize,
  MAX_FONTSIZE,
  MIN_FONTSIZE,
  showToast,
  clearToast,
} from "./utils.js";
import {
  storeItemToStorage,
  removeItemFromStorage,
  storeHistory,
} from "./storage.js";
import { generateDrillPassage } from "./drillbank.js";

const urlParams = new URLSearchParams(window.location.search);
const isDrillMode = urlParams.get("mode") === "drill";
const drillWeakKeys = isDrillMode
  ? JSON.parse(localStorage.getItem("drillWeakKeys") || "[]")
  : [];

let timerStarted = false; //for time based mode
let testComplete = false;

// TEST MODE
const modeButtons = document.querySelectorAll("button[data-mode]");

const defaultModeButton = document.querySelector(
  `button[data-mode = "${currentMode}"]`,
);
if (defaultModeButton) {
  defaultModeButton.classList.add("mode-selected");
  wordElement.textContent = currentMode;
  timerElement.textContent = "";
}

modeButtons.forEach((button) =>
  button.addEventListener("click", (event) => {
    const clickedButton = event.currentTarget;

    modeButtons.forEach((b) => b.classList.remove("mode-selected"));

    clickedButton.classList.add("mode-selected");
    setCurrentMode(clickedButton.dataset.mode);
    const newMode = clickedButton.dataset.mode;
    //When user changes mode mid-test reset the timer
    if (timerStarted) {
      resetTest(true); // changes the passage content when the mode is changed.
    } else {
      if (newMode.endsWith("s")) {
        updateModeDisplay(timerElement, wordElement, newMode, "", 100);
      } else {
        updateModeDisplay(timerElement, wordElement, "", newMode, 0);
      }
      currentPassage = getPassage(currentMode);
      renderPassage(currentPassage);
    }
    clickedButton.blur(); // remove button focus
  }),
);

// PASSAGE CONTENT
let currentPassage = "";
let characters = [];
let spans = [];
let currentIndex = 0;
let lastCapsLockState;
let isDesyncMode = false;

const passageContent = document.getElementById("passage-content");
const mobileInput = document.getElementById("mobile-input");

// tap on passage - focus hidden input - opens mobile keyboard
passageContent.addEventListener("click", () => {
  mobileInput.focus();
});

function renderPassage(textToType) {
  passageContent.innerHTML = "";
  characters = textToType.split("");

  characters.forEach((ch, index) => {
    const characterElement = document.createElement("span");
    characterElement.textContent = ch;
    passageContent.append(characterElement);
  });

  spans = passageContent.querySelectorAll("span");
  spans[0].classList.add("active");
}

if (isDrillMode) {
  currentPassage = generateDrillPassage(drillWeakKeys);
} else {
  currentPassage = getPassage(currentMode);
}

renderPassage(currentPassage);

if (isDrillMode) {
  document.querySelector(".mode-section").style.display = "none";
  const banner = document.getElementById("drill-banner");
  const label = document.getElementById("drill-keys-label");
  banner.style.display = "block";
  label.textContent =
    drillWeakKeys.length > 0
      ? `Drilling weak keys`
      : "Drill mode - no weak keys found, random practice";

  const weakKeysEl = document.getElementById("weak-keys");
  weakKeysEl.innerHTML = "";

  drillWeakKeys.forEach((item) => {
    const span = document.createElement("span");
    span.className = "key-box";

    span.textContent = item.key.toUpperCase();

    // pass error rate to CSS
    span.style.setProperty("--rate", item.errorRate);

    weakKeysEl.appendChild(span);
  });
}
function showDrillResults(snapshot) {
  document.getElementById("drill-results-modal").style.display = "flex";
  document.getElementById("drill-wpm").textContent = snapshot.wpm;
  document.getElementById("drill-accuracy").textContent =
    snapshot.accuracy + "%";
  document.getElementById("drill-keys-drilled").textContent =
    drillWeakKeys.length > 0 ? drillWeakKeys.join(", ") : "random practice";
}

const handleBackspace = (currentSpan) => {
  tracker.recordBackspace();
  currentSpan.classList.remove("active");
  currentIndex--;

  const previousSpan = spans[currentIndex];
  previousSpan.classList.remove("correct", "incorrect");
  previousSpan.classList.add("active");
};

const markSpan = (span, result) => {
  span.classList.add(result);
};

const updateCursor = () => {
  const nextSpan = spans[currentIndex];
  if (nextSpan) {
    nextSpan.classList.add("active");
  }
};
const checkCompletion = () => {
  if (currentIndex === spans.length) {
    endTest();
  }
};

function checks(event) {
  // If the Test is completed - no need to listen to keyboard event
  if (testComplete) return;

  const currentSpan = spans[currentIndex];

  if (!currentSpan) return;

  //Check if capslock is on (only if the event supports it)
  if (typeof event.getModifierState === "function") {
    const currentCapsLockState = event.getModifierState("CapsLock");
    if (currentCapsLockState !== lastCapsLockState) {
      if (currentCapsLockState === true) {
        showToast("Caps Lock is turned ON", "warn");
      } else if (currentCapsLockState === false && lastCapsLockState === true) {
        showToast("Caps Lock is turned OFF", "info");
      }

      lastCapsLockState = currentCapsLockState;
    }
  }

  //Block the system shortcut keys
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    event.preventDefault();
    return;
  }

  const isLetter = /^[a-zA-Z]$/.test(event.key);
  const isSpaceKey = event.key === " ";
  //Block all the other keys except lowercase alphabets, space key and backspace

  if (!isLetter && !isSpaceKey && event.key !== "Backspace") {
    event.preventDefault();
    return;
  }

  //Start the timer when user starts typing first keypress
  if (!timerStarted) {
    timerStarted = true;
    //TIME BASED MODE
    if (currentMode.endsWith("s")) {
      startTimer(endTest);
    }
    //WORD BASED MODE
    tracker.recordTestStart(Date.now());
  }

  // Backspace
  if (event.key === "Backspace") {
    if (currentIndex > 0) {
      handleBackspace(currentSpan);
    }
    // Prevent default browser backspace behaviors
    event.preventDefault();
    return;
  }

  // Normal typing
  const result = tracker.recordKeystroke(characters[currentIndex], event.key);

  //Warn if user gets desynced and is no longer following the passage.
  const isDesyncedCurrently = tracker.isDesynced();

  if (isDesyncedCurrently && !isDesyncMode) {
    isDesyncMode = true;
    showToast(
      "Results may be inaccurate. Re-align with the passage.",
      "warn",
      true,
    );
  }

  if (!isDesyncedCurrently && isDesyncMode) {
    isDesyncMode = false;
    clearToast();
  }

  markSpan(currentSpan, result);

  currentSpan.classList.remove("active");

  currentIndex++;
  // sample WPM every 10 characters for word modes
  if (currentMode.endsWith("w") && currentIndex % 10 === 0) {
    tracker.sampleWpm();
  }
  updateCursor();

  const activeSpan = spans[currentIndex];
  if (activeSpan) {
    activeSpan.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  if (currentMode.endsWith("w")) {
    updateProgressBar(currentIndex, spans.length);
  }

  checkCompletion();
}

document.addEventListener("keydown", (e) => {
  // if mobile input is focused, let the input event handle it
  if (document.activeElement === mobileInput) return;
  checks(e);
});

document.addEventListener("paste", (e) => e.preventDefault());

// mobile — listen to input event on the hidden input
mobileInput.addEventListener("input", (e) => {
  // only process if this was triggered by mobile input
  // on desktop, keydown already handled it
  if (e.inputType === "insertText" && !e.isTrusted) return;

  const typed = e.data;
  if (!typed) return;

  mobileInput.value = "";

  //Detect CapsLock mobile devices
  const isLetter = /^[a-zA-Z]$/.test(typed); //excludes space and backspace in mobile
  const isUpperCase =
    typed === typed.toUpperCase() && typed !== typed.toLowerCase();
  const simulatedMobileCapsLock = isLetter
    ? isUpperCase && !e.shiftKey
    : lastCapsLockState;

  checks({
    key: typed,
    preventDefault: () => {},
    getModifierState: (modifier) => {
      if (modifier === "CapsLock") {
        return simulatedMobileCapsLock;
      }
      return false;
    },
  });
});

mobileInput.addEventListener("paste", (e) => e.preventDefault());

// mobile backspace fires as input with inputType deleteContentBackward
mobileInput.addEventListener("beforeinput", (e) => {
  if (e.inputType === "deleteContentBackward") {
    checks({ key: "Backspace", preventDefault: () => {} });
  }
});

// TEST COMPLETE
function endTest() {
  testComplete = true;
  //stop the timer - user types last char
  clearTimer();
  const snapshot = tracker.getSnapshot(currentMode);
  storeItemToStorage("latestResult", snapshot);
  storeHistory("testHistory", snapshot);
  if (isDrillMode) {
    showDrillResults(snapshot);
  } else {
    window.location.replace("results.html");
  }
}

//Special Key SHORTCUTS
let tabPressed = false; //used for restarting the test

function resetTest(newPassage) {
  clearToast();
  isDesyncMode = false;
  clearTimer();
  //reset all vars
  timerStarted = false;
  testComplete = false;
  resetTimerMode();
  currentIndex = 0;
  tabPressed = false;
  tracker.resetTracker();

  // resetTest
  if (currentMode.endsWith("s")) {
    updateModeDisplay(timerElement, wordElement, currentMode, "", 100);
  } else {
    updateModeDisplay(timerElement, wordElement, "", currentMode, 0);
  }
  removeItemFromStorage("latestResult");

  if (newPassage) {
    currentPassage = getPassage(currentMode);
  }
  renderPassage(currentPassage);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    tabPressed = true;
    return;
  }
  // Restart the test
  if (tabPressed && event.key === "Enter") {
    resetTest(true);
  }
  //Reset the current test with same passage
  if (event.key === "Escape") {
    resetTest(false);
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Tab") tabPressed = false;
});

const restartBtn = document.getElementById("restart-button");
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    resetTest(true);
    restartBtn.blur();

    const passage = document.getElementById("passage");
    passage.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
}

//DRILL MODE
document.getElementById("btn-drill-again")?.addEventListener("click", () => {
  window.location.replace("index.html?mode=drill");
});

document.getElementById("btn-back-normal")?.addEventListener("click", () => {
  localStorage.removeItem("drillWeakKeys");
  window.location.replace("index.html");
});

//FONT
const increaseFontBtn = document.getElementById("increase-font");
const decreaseFontBtn = document.getElementById("decrease-font");
const displayFontSize = document.querySelector("span#font-size-display");

increaseFontBtn.addEventListener("click", () => {
  updateFontSize(1, passageContent);
  updateButtonStates();
  increaseFontBtn.blur();
});
decreaseFontBtn.addEventListener("click", () => {
  updateFontSize(-1, passageContent);
  updateButtonStates();
  decreaseFontBtn.blur();
});

function updateButtonStates() {
  displayFontSize.textContent = `${currentSize}px`;
  increaseFontBtn.disabled = currentSize >= MAX_FONTSIZE;
  decreaseFontBtn.disabled = currentSize <= MIN_FONTSIZE;
}

//TAB SWITCH DETECTION - RESTART TEST
document.addEventListener("visibilitychange", () => {
  if (document.hidden && timerStarted && !testComplete) {
    showToast(
      "Test invalidated because you left the page. Restart the Test",
      "warn",
      true,
    );

    testComplete = true;
    clearTimer();
  }
});
