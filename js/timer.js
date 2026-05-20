let currentMode = "25w";
let originalTime = 0;
let totalTime = 0;
let timerInterval = null;

const progressFill = document.querySelector(".progress-fill");
const timerElement = document.getElementById("countdown-timer");
const wordElement = document.getElementById("count-words");

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
    currentMode = clickedButton.dataset.mode;
    //When user changes mode mid-test reset the timer
    if (timerStarted) {
      resetTest(true); // changes the passage content when the mode is changed.
    } else {
      updateModeDisplay(currentMode);
    }
    clickedButton.blur(); // remove button focus
  }),
);

function startTimer() {
  if (currentMode.endsWith("s")) {
    originalTime = Number(currentMode.slice(0, -1));
    totalTime = originalTime;

    timerInterval = setInterval(() => {
      totalTime -= 1;

      const percentage = (totalTime / originalTime) * 100;
      progressFill.style.width = percentage + "%";
      timerElement.textContent = totalTime + "s";

      if (totalTime === 0) {
        stopTimer();
        timerElement.textContent = "";
      }
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  endTest();
}
