import { getHistory, getBestScore } from "./storage.js";
import { drawWpmGraph } from "./graph.js";
import { renderHeatmap } from "./keyboard.js";
import { downloadReport } from "./report.js";
import { clearToast, getModeLabel, showToast } from "./utils.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });
}

async function loadPdfLibs() {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  );
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  );
}

const result = JSON.parse(localStorage.getItem("latestResult"));

if (!result) {
  window.location.href = "index.html";
}

//RESULT DATA
document.getElementById("result-wpm").textContent = result.wpm;
document.getElementById("result-mode").textContent = getModeLabel(result.mode);
document.getElementById("result-accuracy").textContent = result.accuracy + "%";
document.getElementById("result-correct").textContent = result.correctChars;
document.getElementById("result-wrong").textContent = result.wrongChars;
document.getElementById("result-backspaces").textContent =
  result.backspaceCount;
document.getElementById("result-keystrokes").textContent =
  result.totalKeyStroke;
document.getElementById("result-time").textContent = result.duration + "s";

//WPM Graph
const graphSection = document.getElementById("graph-section");
const resizeObserver = new ResizeObserver(() => {
  drawWpmGraph(result.wpmHistory);
});
resizeObserver.observe(graphSection);

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
    container.innerHTML =
      '<p class="history-empty">Complete another test to see history.</p>';
    return;
  }

  const table = document.createElement("table");
  table.classList.add("history-table");

  table.innerHTML = `
    <thead>
      <tr>
        <th>WPM</th>
        <th>Mode</th>
        <th>Accuracy</th>
        <th>Backspaces</th>
        <th>When</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement("tbody");

  history.toReversed().forEach((entry, index) => {
    const tr = document.createElement("tr");
    if (index === 0) tr.classList.add("history-latest");

    tr.innerHTML = `
      <td>${entry.wpm}</td>
      <td>${getModeLabel(entry.mode)}</td>
      <td>${entry.accuracy}%</td>
      <td>${entry.backspaceCount}</td>
      <td>${timeAgo(entry.timestamp)}</td>
    `;

    tbody.append(tr);
  });

  table.append(tbody);
  container.append(table);
}
renderHistory();

const MIN_ACCURACY = 70;
const bestScore = getBestScore("testHistory", result.mode);
const currentScore = result.wpm * (result.accuracy / 100);

if (currentScore >= bestScore && result.accuracy >= MIN_ACCURACY) {
  document.getElementById("personal-best-badge").style.display = "block";
}

// Weak key detection
function getWeakKeys(keyErrorMap) {
  return Object.entries(keyErrorMap)
    .map(([key, data]) => {
      const errorRate = data.attempts > 0 ? data.errors / data.attempts : 0;

      return {
        key,
        attempts: data.attempts,
        errors: data.errors,
        errorRate,
      };
    })
    .filter((item) => item.attempts > 0 && item.errorRate > 0.25)
    .sort((a, b) => b.errorRate - a.errorRate); // descending (worst first)
}

// --- Actions ---
document.getElementById("btn-try-again").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("btn-drill").addEventListener("click", () => {
  const weakKeys = getWeakKeys(result.keyErrorMap);
  localStorage.setItem("drillWeakKeys", JSON.stringify(weakKeys));
  window.location.replace("index.html?mode=drill");
});

document.getElementById("btn-download").addEventListener("click", async () => {
  showToast("Generating Report ...", "info", true);
  try {
    await loadPdfLibs();
    await downloadReport(result);
    clearToast();
    showToast("Report Downloaded✓", "success");
  } catch (err) {
    clearToast();
    showToast("Download failed. Try again.", "warn", true);
  }
});
