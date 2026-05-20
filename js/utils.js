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
