export let currentMode = "25w";

export const progressFill = document.querySelector(".progress-fill");
export const timerElement = document.getElementById("countdown-timer");
export const wordElement = document.getElementById("count-words");

// utils.js — shared utility functions
export function setCurrentMode(mode) {
  currentMode = mode;
}

export function updateModeDisplay(
  timerEl,
  wordEl,
  timerText,
  wordText,
  barWidth,
) {
  console.log(timerEl, wordEl, timerText, wordText, barWidth);
  timerEl.textContent = timerText;
  wordEl.textContent = wordText;
  progressFill.style.width = barWidth + "%";
}

export function updateProgressBar(current, total) {
  const percentage = (current / total) * 100;
  progressFill.style.width = percentage + "%";
}

export const MAX_FONTSIZE = 36;
export const MIN_FONTSIZE = 12;
export let currentSize = 16;

export function updateFontSize(delta, content) {
  let newSize = currentSize + delta;
  if (newSize < MIN_FONTSIZE || newSize > MAX_FONTSIZE) return;

  currentSize = newSize;
  content.style.fontSize = `${currentSize}px`;
}
