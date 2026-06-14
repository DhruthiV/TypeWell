export function drawWpmGraph(wpmHistory) {
  if (!wpmHistory || wpmHistory.length < 2) return;

  const canvas = document.getElementById("wpm-graph");
  const ctx = canvas.getContext("2d");

  const cssWidth = canvas.parentElement.offsetWidth;
  const cssHeight = 220;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  ctx.scale(dpr, dpr);

  const width = cssWidth;
  const height = cssHeight;

  const padding = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 45,
  };

  const accent = "#2563eb";
  const grid = "#e5e7eb";
  const text = "#6b7280";

  const maxWpm = Math.max(...wpmHistory.map((p) => p.wpm), 1);
  const maxSecond = wpmHistory[wpmHistory.length - 1].second;

  const toX = (second) =>
    padding.left +
    (second / maxSecond) * (width - padding.left - padding.right);

  const toY = (wpm) =>
    padding.top + (1 - wpm / maxWpm) * (height - padding.top - padding.bottom);

  ctx.clearRect(0, 0, width, height);

  // Horizontal grid lines
  const gridLines = 4;

  for (let i = 0; i <= gridLines; i++) {
    const value = (maxWpm / gridLines) * i;
    const y = toY(value);

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = text;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(value), padding.left - 8, y + 4);
  }

  // Line
  ctx.beginPath();

  wpmHistory.forEach((point, index) => {
    const x = toX(point.second);
    const y = toY(point.wpm);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // Dots
  wpmHistory.forEach((point) => {
    const x = toX(point.second);
    const y = toY(point.wpm);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  });

  // X labels
  const labels = [
    wpmHistory[0],
    wpmHistory[Math.floor(wpmHistory.length / 2)],
    wpmHistory[wpmHistory.length - 1],
  ];

  ctx.fillStyle = text;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";

  labels.forEach((point) => {
    ctx.fillText(`${point.second}s`, toX(point.second), height - 12);
  });

  // Y axis label
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("WPM", 0, 0);
  ctx.restore();

  // X axis label
  ctx.textAlign = "center";
  ctx.fillText("Time (s)", width / 2, height - 2);
}
