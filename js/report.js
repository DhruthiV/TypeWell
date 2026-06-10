export async function downloadReport(result) {
  const { jsPDF } = window.jspdf;

  const modeLabel = (mode) => {
    if (mode === "60s") return "60 Seconds";
    if (mode === "120s") return "120 Seconds";
    if (mode === "25w") return "25 Words";
    if (mode === "50w") return "50 Words";
    if (mode === "100w") return "100 Words";
    return mode;
  };

  const weakKeyMap = {};
  Object.entries(result.keyErrorMap).forEach(([key, data]) => {
    if (data.attempts > 0 && data.errors / data.attempts > 0.25) {
      weakKeyMap[key] = Math.round((data.errors / data.attempts) * 100);
    }
  });

  const KEYBOARD_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  function renderKeyboardRows() {
    return KEYBOARD_ROWS.map((row) => {
      const keys = row
        .map((key) => {
          const isWeak = weakKeyMap[key] !== undefined;
          return isWeak
            ? `<span class="key weak">${key.toUpperCase()}<br><small>${weakKeyMap[key]}%</small></span>`
            : `<span class="key">${key.toUpperCase()}</span>`;
        })
        .join("");
      return `<div class="kb-row">${keys}</div>`;
    }).join("");
  }

  const spaceWeak = weakKeyMap[" "] !== undefined;

  function renderWpmSvg() {
    if (!result.wpmHistory || result.wpmHistory.length < 2) {
      return `<div style="color:#888680;font-size:12px;padding:16px 0;">Not enough data to draw graph.</div>`;
    }
    const W = 560,
      H = 180;
    const pad = { top: 16, right: 16, bottom: 32, left: 40 };
    const maxWpm = Math.max(...result.wpmHistory.map((p) => p.wpm), 1);
    const maxSec = result.wpmHistory[result.wpmHistory.length - 1].second;
    const toX = (s) => pad.left + (s / maxSec) * (W - pad.left - pad.right);
    const toY = (w) => pad.top + (1 - w / maxWpm) * (H - pad.top - pad.bottom);
    const points = result.wpmHistory
      .map((p) => `${toX(p.second)},${toY(p.wpm)}`)
      .join(" ");
    const yLabels = [0, Math.round(maxWpm / 2), maxWpm].map((v) => ({
      y: toY(v),
      label: v,
    }));
    const xLabels = result.wpmHistory
      .filter(
        (_, i) =>
          i === 0 ||
          i === result.wpmHistory.length - 1 ||
          i === Math.floor(result.wpmHistory.length / 2),
      )
      .map((p) => ({ x: toX(p.second), label: p.second + "s" }));
    const dots = result.wpmHistory
      .map(
        (p) =>
          `<circle cx="${toX(p.second)}" cy="${toY(p.wpm)}" r="3" fill="#2563eb"/>`,
      )
      .join("");
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      ${yLabels
        .map(
          (
            l,
          ) => `<line x1="${pad.left}" y1="${l.y}" x2="${W - pad.right}" y2="${l.y}" stroke="#e0ded8"
 stroke-width="1" stroke-dasharray="4,3"/>`,
        )
        .join("")}
      <polyline points="${points}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/>
      ${dots}
      ${yLabels.map((l) => `<text x="${pad.left - 6}" y="${l.y + 4}" text-anchor="end" font-size="10" fill="#242320">${l.label}</text>`).join("")}
      ${xLabels.map((l) => `<text x="${l.x}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#242320">${l.label}</text>`).join("")}
      <text x="${pad.left - 30}" y="${H / 2}" text-anchor="middle" font-size="10" fill="#242320" transform="rotate(-90, ${pad.left - 30}, ${H / 2})">WPM</text>
      <text x="${W / 2}" y="${H}" text-anchor="middle" font-size="10" fill="#242320">Time (s)</text>
    </svg>`;
  }

  const totalTyped = result.correctChars + result.wrongChars;
  const summary = `The user typed ${result.correctChars} correct characters out of ${totalTyped} total in ${result.duration} seconds, making ${result.wrongChars} errors and ${result.backspaceCount} backspace corrections. Final accuracy was ${result.accuracy}% at ${result.wpm} WPM in ${modeLabel(result.mode)} mode.`;

  const sharedCss = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f5f0;
    --surface: #ffffff;
    --border: #e0ded8;
    --text: #1a1a18;
    --muted: #242320;
    --muted2: #242320;
    --accent: #2563eb;
    --error: #dc2626;
    --success: #16a34a;
    --selected: #4a80f5;
    --text2: #ffffff;
    --danger-bg: #fef2f2;
    --danger-border: #fca5a5;
    --divider-light: #f0f0ee;
}
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 32px;
      width: 680px;
    }
    .report {
      width: 680px;
      background: var(--surface);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .report-header {
        background: var(--text);
        color: var(--text2);
        padding: 24px 32px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    .report-header h1 { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }

    .report-header .meta { 
        font-size: 14px;
        color: var(--text2);
        margin-top: 4px; 
    }
    .mode-pill {
      background: var(--accent);
      color: var(--text2);
      border-radius: 6px; 
      padding: 5px;
      font-size: 14px; 
      font-weight: 600;
    }
    .section-title {
      font-size: 12px; text-transform: uppercase;
      letter-spacing: 0.1em; color: var(--muted);
      font-weight: 600; padding: 16px 32px 8px;
    }
  `;

  // PAGE 1 HTML — header + hero + summary + stats
  const page1Html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    ${sharedCss}
    .hero {
        padding: 24px 32px;  
        border-bottom: 1px solid var(--border);
        display: flex; 
        gap: 32px; 
        align-items: flex-end;
    }
    .hero-block { display: flex; flex-direction: column; }

    .hero-value { 
        font-size: 52px; 
        font-weight: 700; 
        line-height: 1;  
        color: var(--text);
        letter-spacing: -0.03em;
     }
    .hero-label { font-size: 14px
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-top: 10px;
        }
    .divider { 
        width: 1px; 
        background: var(--border);
        height: 48px;
      }
    .summary {
        padding: 16px 32px; 
        background: var(--bg);
        border-bottom: 1px solid var(--border);
        color: var(--muted);
        font-size: 16px; 
        line-height: 1.6;
    }
    .stats-table { width: 100%; border-collapse: collapse; }
    .stats-table tr { border-bottom: 1px solid var(--divider-light); }
    .stats-table td { padding: 11px 32px; font-size: 14px; }
    .stats-table td:first-child { 
        color: var(--muted);
        width: 55%;
      }
    .stats-table td:last-child { 
        font-weight: 600;
        color: var(--text);
     }
    .desc { 
        font-size: 12px; 
        color: var(--muted2);
        display: block;
        margin-top: 2px;
    }
    .report-footer {
        text-align: center; padding: 12px; font-size: 8px;
        color: var(--muted2);
        border-top: 1px solid var(--border);
        background: var(--bg);
    }
  </style></head><body>
  <div class="report">
    <div class="report-header">
      <div>
        <h1>TypeWell Report</h1>
        <div class="meta">${new Date(result.timestamp).toLocaleString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
      </div>
      <div class="mode-pill">${modeLabel(result.mode)}</div>
    </div>
    <div class="hero">
      <div class="hero-block">
        <span class="hero-value">${result.wpm}</span>
        <span class="hero-label">Words per minute</span>
      </div>
      <div class="divider"></div>
      <div class="hero-block">
        <span class="hero-value">${result.accuracy}%</span>
        <span class="hero-label">Accuracy</span>
      </div>
      <div class="divider"></div>
      <div class="hero-block">
        <span class="hero-value">${result.duration}s</span>
        <span class="hero-label">Duration</span>
      </div>
    </div>
    <div class="summary">${summary}</div>
    <div class="section-title">Performance Breakdown</div>
    <table class="stats-table">
      <tr><td>Correct Characters<span class="desc">Characters typed correctly on first attempt</span></td><td>${result.correctChars}</td></tr>
      <tr><td>Wrong Characters<span class="desc">Characters typed incorrectly</span></td><td>${result.wrongChars}</td></tr>
      <tr><td>Backspaces Used<span class="desc">Number of corrections made mid-test</span></td><td>${result.backspaceCount}</td></tr>
      <tr><td>Total Keystrokes<span class="desc">All keys pressed including backspaces</span></td><td>${result.totalKeyStroke}</td></tr>
      <tr><td>Error Rate<span class="desc">Wrong characters as percentage of total typed</span></td><td>${totalTyped > 0 ? Math.round((result.wrongChars / totalTyped) * 100) : 0}%</td></tr>
    </table>
    <div class="report-footer">TypeWell Report · Page 1 of 2</div>
  </div>
  </body></html>`;

  // PAGE 2 HTML — graph + keyboard
  const page2Html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    ${sharedCss}
    .graph-section { 
        padding: 24px 32px; 
        border-bottom: 1px solid var(--border);
     }
    .weak-section { padding: 24px 32px; }

    .kb-row { display: flex; justify-content: center; gap: 5px; margin-bottom: 5px; }

    .key {
        width: 51px;
        height: 51px;
        padding:5px;
        border-radius: 6px;
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--muted);
        display: inline-flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center;
        font-size: 12px; font-weight: 600; 
        text-align: center; line-height: 1.2;
    }
    .key.weak { 
        background: var(--danger-bg); 
        border-color: var(--danger-border); 
        color: var(--error); 
    }
    .key small { font-size: 12px; font-weight: 400; }
    .space-row { display: flex; justify-content: center; margin-top: 5px; }
    .space-key {
        width: 190px; 
        height: 34px; 
        border-radius: 6px;
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--muted);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px;
    }
    .space-key.weak { 
        background: var(--danger-bg); 
        border-color: var(--danger-border); 
        color: var(--error); 
        font-weight: 600; 
    }
    .clean-badge { 
        color: var(--success); 
        font-weight: 500; 
        font-size: 14px; 
    }
    .report-footer {
        text-align: center; 
        padding: 12px; 
        font-size: 8px;
        color: var(--muted2);
        border-top: 1px solid var(--border);
        background: var(--bg);
    }
  </style></head><body>
  <div class="report">
    <div class="report-header">
      <div>
        <h1>TypeWell Report</h1>
        <div class="meta">WPM Over Time &amp; Key Error Map</div>
      </div>
      <div class="mode-pill">${modeLabel(result.mode)}</div>
    </div>
    <div class="graph-section">
      <div class="section-title" style="padding: 0 0 12px;">WPM Over Time</div>
      ${renderWpmSvg()}
    </div>
    <div class="weak-section">
      <div class="section-title" style="padding: 0 0 12px;">Key Error Map</div>
      ${
        Object.keys(weakKeyMap).length === 0
          ? `<div class="clean-badge">No weak keys — clean test!</div>`
          : `${renderKeyboardRows()}
           <div class="space-row">
             <div class="space-key ${spaceWeak ? "weak" : ""}">
               ${spaceWeak ? `Space (${weakKeyMap[" "]}%)` : "Space"}
             </div>
           </div>`
      }
    </div>
    <div class="report-footer">TypeWell Report · Page 2 of 2</div>
  </div>
  </body></html>`;

  // --- render helper ---
  async function renderPageToCanvas(html) {
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;left:-9999px;top:0;width:720px;height:2000px;border:none;";
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    await new Promise((r) => setTimeout(r, 800));
    const body = iframe.contentDocument.body;
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim(),
      width: 720,
      height: body.scrollHeight,
    });
    document.body.removeChild(iframe);
    return canvas;
  }

  // --- render both pages ---
  const canvas1 = await renderPageToCanvas(page1Html);
  const canvas2 = await renderPageToCanvas(page2Html);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // page 1
  const img1 = canvas1.toDataURL("image/png");
  const h1 = (canvas1.height * pageWidth) / canvas1.width;
  pdf.addImage(img1, "PNG", 0, 0, pageWidth, h1);

  // page 2
  pdf.addPage();
  const img2 = canvas2.toDataURL("image/png");
  const h2 = (canvas2.height * pageWidth) / canvas2.width;
  pdf.addImage(img2, "PNG", 0, 0, pageWidth, h2);

  //if you think preview is required.
  // const blob = pdf.output("blob");
  // const url = URL.createObjectURL(blob);

  // window.open(url, "_blank");

  pdf.save(`typewell-report-${Date.now()}.pdf`);
}
