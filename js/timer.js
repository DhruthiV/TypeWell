import { currentMode, timerElement, updateProgressBar } from "./utils.js";
let originalTime = 0;
let totalTime = 0;
let timerInterval = null;

export function startTimer(onComplete) {
  originalTime = Number(currentMode.slice(0, -1));
  totalTime = originalTime;

  timerInterval = setInterval(() => {
    totalTime -= 1;

    updateProgressBar(totalTime, originalTime);

    timerElement.textContent = totalTime + "s";

    if (totalTime === 0) {
      clearTimer();
      timerElement.textContent = "";
      onComplete();
    }
  }, 1000);
}

export function clearTimer() {
  clearInterval(timerInterval);
}

export function resetTimerMode() {
  originalTime = 0;
  totalTime = 0;
}
