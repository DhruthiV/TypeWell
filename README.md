# TypeWell

A deliberate typing practice app built with vanilla HTML, CSS, and JavaScript — no frameworks, no bundlers.

**Live:** https://type-well.vercel.app

---

## What it does

TypeWell measures your typing speed and accuracy, shows where you're making mistakes, and lets you drill the specific keys you struggle with most.

---

## Features

- **5 modes** — 60s, 120s, 25w, 50w, 100w
- **Live WPM + accuracy** — updates as you type
- **WPM graph** — Canvas API line chart, sharp on retina screens
- **Keyboard heatmap** — full QWERTY keyboard colored by per-key error rate
- **Drill mode** — detects weak keys and generates a weighted passage to practice them
- **Personal best detection** — tracks your best score per mode using WPM × accuracy
- **Last 5 results** — persistent history in localStorage shown as a table
- **Download report** — generates a 2-page PDF summary of your test
- **Font size toggle** — A/a buttons to adjust passage text size
- **Keyboard shortcuts** — Tab+Enter to restart, Esc to reset passage
- **Tab switch detection** — warns and freezes test if you leave the page mid-test
- **Desync detection** — detects gibberish typing patterns and alerts you to restart
- **Caps Lock warning** — notified instantly if Caps Lock is on while typing
- **Mobile support** — responsive layout with hidden input for mobile keyboard

---

## How to use

1. Pick a mode — time-based (60s, 120s) or word-based (25w, 50w, 100w)
2. Start typing — timer starts on your first keypress
3. View your results — WPM, accuracy, heatmap, and graph on the results page
4. Download your report or drill your weak keys

---

## Tech

| Concern | Approach |
|---|---|
| Architecture | ES modules, no bundler |
| Fonts | Self-hosted Inter + JetBrains Mono via `@font-face` |
| Graph | Canvas API with `devicePixelRatio` scaling + `ResizeObserver` |
| Persistence | `localStorage` with JSON parse/stringify |
| PDF export | `html2canvas` + `jsPDF`, lazy loaded on demand |
| Images | WebP with PNG fallback, sized for display dimensions |
| Deployment | Vercel |

---

## Run locally

```bash
git clone https://github.com/DhruthiV/TypeWell.git
cd TypeWell
```

Open `index.html` directly in your browser. No build step, no install required.

If you see module import errors, use a local server — the Live Server extension in VS Code works well.

---

## What I learned building this

- How browsers handle keyboard events, modifier states, and mobile input quirks
- Canvas API for data visualization without libraries
- ES module architecture and avoiding circular dependencies
- localStorage patterns for persistent state across pages
- Performance debugging with Lighthouse and Chrome DevTools
- Forced reflow, `requestAnimationFrame`, and `ResizeObserver`
- Lazy loading third-party scripts to avoid blocking render
