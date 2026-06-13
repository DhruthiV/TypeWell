export let currentMode = "25w";
export let activeToast = null;
export let toastTimeoutId = null;

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
export let currentSize = 32;

export function updateFontSize(delta, content) {
  let newSize = currentSize + delta;
  if (newSize < MIN_FONTSIZE || newSize > MAX_FONTSIZE) return;

  currentSize = newSize;
  content.style.fontSize = `${currentSize}px`;
}

export function getModeLabel(mode) {
  if (mode === "60s") return "60 Seconds";
  if (mode === "120s") return "120 Seconds";
  if (mode === "25w") return "25 Words";
  if (mode === "50w") return "50 Words";
  if (mode === "100w") return "100 Words";
  return mode;
}

const container = document.querySelector("#toast-container");

export function showToast(message, type = "info", persistent = false) {
  if (!container) return;
  //Clear the previous toast and its timer instantly if it exists
  if (activeToast) {
    activeToast.remove();
    clearTimeout(toastTimeoutId);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  activeToast = toast;

  if (!persistent) {
    toastTimeoutId = setTimeout(() => {
      toast.remove();
      // Only clear if this specific toast is still the active one
      if (activeToast === toast) {
        activeToast = null;
      }
    }, 3000);
  }
}

export function clearToast() {
  if (!container) return;
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
    clearTimeout(toastTimeoutId);
  }
}
