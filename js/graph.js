export function drawWpmGraph(wpmHistory) {
  if (!wpmHistory || wpmHistory.length < 2) return;

  const canvas = document.getElementById("wpm-graph");
  const context = canvas.getContext("2d");
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = 200;

  const padding = 40;
  const maxWpm = Math.max(...wpmHistory.map((p) => p.wpm));
  const maxSecond = wpmHistory[wpmHistory.length - 1].second;

  //convert values to pixel positions
  const toX = (second) =>
    padding + (second / maxSecond) * (canvas.width - padding * 2);
  const toY = (wpm) =>
    canvas.height - padding - (wpm / maxWpm) * (canvas.height - padding * 2);

  context.beginPath();
  context.moveTo(toX(0), toY(0));

  wpmHistory.forEach((point) => {
    context.lineTo(toX(point.second), toY(point.wpm));
  });

  context.strokeStyle = "blue";
  context.lineWidth = 2;
  context.stroke();

  // Y axis label
  context.save();
  context.translate(12, canvas.height / 2);
  context.rotate(-Math.PI / 2);
  context.textAlign = "center";

  context.font = "12px MainFont";
  context.fillText("WPM", 0, 0);
  context.restore();

  // X axis label
  context.textAlign = "center";

  context.font = "12px MainFont";
  context.fillText("Time (s)", canvas.width / 2, canvas.height - 4);

  wpmHistory.forEach((point) => {
    context.beginPath();
    context.arc(toX(point.second), toY(point.wpm), 3, 0, Math.PI * 2);
    context.fillStyle = "blue";
    context.fill();
  });
}
