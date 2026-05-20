// utils.js — shared utility functions

function updateModeDisplay(mode) {
  if (mode.endsWith("s")) {
    timerElement.textContent = mode;
    wordElement.textContent = "";
    progressFill.style.width = "100%";
  } else {
    wordElement.textContent = mode;
    timerElement.textContent = "";
    progressFill.style.width = "0%";
  }
}

const MAX_FONTSIZE = 36;
const MIN_FONTSIZE = 12;
let currentSize = 16;
const increaseFontBtn = document.getElementById("increase-font");
const decreaseFontBtn = document.getElementById("decrease-font");
const displayFontSize = document.querySelector("span#font-size-display");

function updateFontSize(delta) {
  let newSize = currentSize + delta;
  if (newSize < MIN_FONTSIZE || newSize > MAX_FONTSIZE) return;

  currentSize = newSize;
  passageContent.style.fontSize = `${currentSize}px`;

  updateButtonStates(); //To change colors
}

function updateButtonStates() {
  displayFontSize.textContent = `${currentSize}px`;

  increaseFontBtn.disabled = currentSize >= MAX_FONTSIZE;
  decreaseFontBtn.disabled = currentSize <= MIN_FONTSIZE;
}

increaseFontBtn.addEventListener("click", () => {
  updateFontSize(1);
});
decreaseFontBtn.addEventListener("click", () => {
  updateFontSize(-1);
});

updateButtonStates();
