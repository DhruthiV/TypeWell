//Timer
let timerStarted = false; //for time based mode
let testStartTime = null;
let testComplete = false;

// PASSAGE CONTENT
function getRandomPassage() {
  const index = Math.floor(Math.random() * passages.length);
  return passages[index];
}
let currentPassage = "";
let characters = [];
let spans = [];

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

document.addEventListener("keydown", checks);

// Key Stroke insights variables
let currentIndex = 0;
let totalKeyStroke = 0;
let accuracy = 0;
let correctChar = 0;
let wrongChar = 0;
let backspaceCount = 0;

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

function checks(event) {
  // If the Test is completed - no need to listen to keyboard event
  if (testComplete) return;

  const currentSpan = spans[currentIndex];

  if (!currentSpan) return;

  if (blockedKeys.includes(event.key)) return;

  // Number of key presses for character
  totalKeyStroke++;

  //Start the timer when user starts typing first keypress
  if (!timerStarted) {
    console.log("startTimer called, currentMode:", currentMode);
    startTimer();
    timerStarted = true;
    testStartTime = Date.now();
  }

  // Backspace
  if (event.key == "Backspace" && currentIndex > 0) {
    backspaceCount++;
    currentSpan.classList.remove("active");
    currentIndex--;

    const previousSpan = spans[currentIndex];
    previousSpan.classList.remove("correct", "incorrect");
    previousSpan.classList.add("active");

    return;
  }

  // Normal typing
  if (event.key === characters[currentIndex]) {
    correctChar++;
    currentSpan.classList.add("correct");
  } else {
    wrongChar++;
    currentSpan.classList.add("incorrect");
  }

  if (totalKeyStroke != 0) {
    accuracy = Math.round((correctChar / totalKeyStroke) * 100);
  }

  currentSpan.classList.remove("active");

  currentIndex++;
  if (currentMode.endsWith("w")) {
    const percentage = (currentIndex / spans.length) * 100;
    progressFill.style.width = percentage + "%";
  }
  if (currentIndex === spans.length) {
    endTest();
  }

  const nextSpan = spans[currentIndex];
  if (nextSpan) {
    nextSpan.classList.add("active");
  }
}

// TEST COMPLETE
function endTest() {
  testComplete = true;
  //stop the timer - user types last char
  clearInterval(timerInterval);

  const elapsedSeconds = (Date.now() - testStartTime) / 1000;
  const finalElapsedMinutes = elapsedSeconds / 60;
  const finalWpm =
    finalElapsedMinutes > 0
      ? Math.round(correctChar / 5 / finalElapsedMinutes)
      : 0;

  const results = {
    wpm: finalWpm,
    accuracy: accuracy,
    correctChars: correctChar,
    wrongChars: wrongChar,
    totalKeyStroke: totalKeyStroke,
    backspaceCount: backspaceCount,
    mode: currentMode,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem("results", JSON.stringify(results));
  window.location.href = "results.html";
}

//Special Key SHORTCUTS
let tabPressed = false; //used for restarting the test

function resetTest(newPassage) {
  console.log("resetTest called, newPassage:", newPassage);
  clearInterval(timerInterval);
  //reset all vars
  timerStarted = false;
  testStartTime = null;
  testComplete = false;
  originalTime = 0;
  totalTime = 0;
  currentIndex = 0;
  totalKeyStroke = 0;
  correctChar = 0;
  wrongChar = 0;
  accuracy = 0;
  backspaceCount = 0;
  tabPressed = false;

  updateModeDisplay(currentMode);
  localStorage.removeItem("results");

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
