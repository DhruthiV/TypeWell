# TypeWell

A deliberate typing practice app built with vanilla HTML, CSS, and JavaScript - no frameworks, no bundlers.

**Live:** https://type-well.vercel.app

---

## What it does

TypeWell measures your typing speed and accuracy, shows you where you're making mistakes, and lets you drill the specific keys you're weakest on.

---

## Features

- **5 modes** — 60s, 120s, 25w, 50w, 100w
- **Live WPM + accuracy** — updates as you type
- **WPM graph** — Canvas API line chart with DPR scaling for sharp rendering on retina screens
- **Keyboard error heatmap** — full QWERTY keyboard colored by per-key error rate
- **Drill mode** — detects your weak keys and generates a weighted passage to practice them
- **Last 5 results** — persistent history stored in localStorage, shown as a table
- **Download report** — generates and downloads a PDF summary of your test
- **Font size toggle** — A/a buttons to adjust passage font size
- **Keyboard shortcuts** — Tab+Enter to restart, Esc to reset
- **Mobile support** — responsive layout for mobile keyboard focus

---

## Tech

| Concern | Approach |
|---|---|
| Architecture | ES modules, no bundler |
| Fonts | Self-hosted Inter + JetBrains Mono via `@font-face` |
| Graph | Canvas API with `devicePixelRatio` scaling |
| Persistence | `localStorage` with JSON parse/stringify |
| PDF export | `html2canvas` + `jsPDF` |
| Deployment | Vercel, production branch only |

---

## Project structure

```
TypeWell/
├── index.html
├── results.html
├── css/
│   ├── reset.css
│   ├── main.css
│   └── results.css
├── js/
│   ├── engine.js       # Typing engine — keydown, span rendering, cursor
│   ├── timer.js        # Countdown + progress bar
│   ├── tracker.js      # Per-key error tracking
│   ├── passages.js     # Curated word/passage pool
│   ├── storage.js      # localStorage read/write
│   ├── results.js      # Results page orchestration
│   ├── graph.js        # Canvas WPM line graph
│   ├── keyboard.js     # Heatmap render
│   └── drillbank.js    # Drill word bank + passage generator
└── assets/
    ├── fonts/
    └── icons/
```

## Local development

```bash
git clone https://github.com/DhruthiV/TypeWell.git
cd TypeWell
# Open index.html in your browser
# Or use a local server (Live Server extension)
```
