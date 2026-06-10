import { currentMode, timerElement, updateProgressBar } from "./utils.js";
import { sampleWpm } from "./tracker.js";
let originalTime = 0;
let totalTimeRemaining = 0;
let timerInterval = null;

export function startTimer(onComplete) {
  originalTime = Number(currentMode.slice(0, -1));
  totalTimeRemaining = originalTime;

  timerInterval = setInterval(() => {
    totalTimeRemaining -= 1;

    updateProgressBar(totalTimeRemaining, originalTime);

    timerElement.textContent = totalTimeRemaining + "s";

    if (
      (originalTime - totalTimeRemaining) % 5 == 0 &&
      originalTime - totalTimeRemaining != 0
    ) {
      sampleWpm(); //calculate the wpm every 5 seconds for graph history
    }

    if (totalTimeRemaining === 0) {
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
  totalTimeRemaining = 0;
}
