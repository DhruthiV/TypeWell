import { getHistory } from "./storage.js";
import { drawWpmGraph } from "./graph.js";
import { renderHeatmap } from "./keyboard.js";
const result = JSON.parse(localStorage.getItem("latestResult"));

if (!result) {
  window.location.href = "index.html";
}

//RESULT DATA
document.getElementById("result-wpm").textContent = result.wpm;
document.getElementById("result-mode").textContent = result.mode;
document.getElementById("result-accuracy").textContent = result.accuracy + "%";
document.getElementById("result-correct").textContent = result.correctChars;
document.getElementById("result-wrong").textContent = result.wrongChars;
document.getElementById("result-backspaces").textContent =
  result.backspaceCount;
document.getElementById("result-keystrokes").textContent =
  result.totalKeyStroke;
document.getElementById("result-time").textContent = result.duration + "s";

//WPM Graph
drawWpmGraph(result.wpmHistory);

//Keyboard Heatmap
renderHeatmap(result.keyErrorMap);

// TEST HISTORIES

function timeAgo(timestamp) {
  const time = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  let timeString;
  if (time < 60) {
    timeString = "just now";
  } else if (time < 3600) {
    const mins = Math.floor(time / 60);
    timeString = `${mins} min(s) ago`;
  } else if (time < 86400) {
    const hours = Math.floor(time / 3600);
    timeString = `${hours} hour(s) ago`;
  } else {
    const days = Math.floor(time / 86400);
    timeString = `${days} day(s) ago`;
  }
  return timeString;
}

function renderHistory() {
  const history = getHistory("testHistory");
  const container = document.getElementById("history-list");

  if (!history || history.length < 2) {
    container.textContent = "Complete another test to see history.";
    return;
  }

  history.toReversed().forEach((element) => {
    const row = document.createElement("div");
    row.classList.add("history-row");
    const wpm = document.createElement("span");
    wpm.textContent = `${element.wpm} WPM`;

    const mode = document.createElement("span");
    mode.textContent = element.mode;

    const accuracy = document.createElement("span");
    accuracy.textContent = `${element.accuracy}% Accuracy`;

    const time = document.createElement("span");
    time.textContent = timeAgo(element.timestamp);

    row.append(wpm, mode, accuracy, time);

    container.append(row);
  });
}
renderHistory();

// --- Actions ---
document.getElementById("btn-try-again").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("btn-drill").addEventListener("click", () => {
  // TODO: drill mode
});

document.getElementById("btn-download").addEventListener("click", () => {
  // TODO: download report
});
