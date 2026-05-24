//Timer
import * as tracker from "./tracker.js";
import { startTimer, resetTimerMode, clearTimer } from "./timer.js";
import { passages } from "./passages.js";
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
} from "./utils.js";
import {
  storeItemToStorage,
  removeItemFromStorage,
  storeHistory,
} from "./storage.js";

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
    }
    clickedButton.blur(); // remove button focus
  }),
);

// PASSAGE CONTENT
function getRandomPassage() {
  const index = Math.floor(Math.random() * passages.length);
  return passages[index];
}
let currentPassage = "";
let characters = [];
let spans = [];
let currentIndex = 0;

const passageContent = document.getElementById("passage-content");

function renderPassage(textToType) {
  console.trace("renderPassage called");
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

currentPassage = getRandomPassage();
renderPassage(currentPassage);

const blockedKeys = [
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Tab",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Delete",
];

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

  if (blockedKeys.includes(event.key)) return;

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
  if (event.key == "Backspace" && currentIndex > 0) {
    handleBackspace(currentSpan);
    return;
  }

  // Normal typing
  const result = tracker.recordKeystroke(characters[currentIndex], event.key);
  markSpan(currentSpan, result);

  currentSpan.classList.remove("active");

  currentIndex++;
  updateCursor();

  if (currentMode.endsWith("w")) {
    updateProgressBar(currentIndex, spans.length);
  }

  checkCompletion();
}

document.addEventListener("keydown", checks);

// TEST COMPLETE
function endTest() {
  testComplete = true;
  //stop the timer - user types last char
  clearTimer();
  const snapshot = tracker.getSnapshot(currentMode);
  storeItemToStorage("latestResult", snapshot);
  storeHistory("testHistory", snapshot);
  window.location.href = "results.html";
}

//Special Key SHORTCUTS
let tabPressed = false; //used for restarting the test

function resetTest(newPassage) {
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
    currentPassage = getRandomPassage();
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

const refreshBtn = document.getElementById("refresh-button");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => resetTest(true));
}

//FONT
const increaseFontBtn = document.getElementById("increase-font");
const decreaseFontBtn = document.getElementById("decrease-font");
const displayFontSize = document.querySelector("span#font-size-display");

increaseFontBtn.addEventListener("click", () => {
  updateFontSize(1, passageContent);
  updateButtonStates();
});
decreaseFontBtn.addEventListener("click", () => {
  updateFontSize(-1, passageContent);
  updateButtonStates();
});

function updateButtonStates() {
  displayFontSize.textContent = `${currentSize}px`;
  increaseFontBtn.disabled = currentSize >= MAX_FONTSIZE;
  decreaseFontBtn.disabled = currentSize <= MIN_FONTSIZE;
}
