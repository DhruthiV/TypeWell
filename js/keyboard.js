const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function getKeyColor(key, keyErrorMap) {
  const data = keyErrorMap[key];
  console.log(data);
  let color = "#ccc";

  if (!keyErrorMap[key]) {
    return color;
  }
  const errorRate = (data.errors / data.attempts) * 100;

  if (errorRate > 51) {
    color = "#ef5350";
  } else if (errorRate >= 26 && errorRate <= 50) {
    color = "#ffb74d";
  } else if (errorRate >= 1 && errorRate <= 25) {
    color = "#a5d6a7";
  } else if (errorRate === 0) {
    color = "#4caf50";
  } else {
    color = "#ccc";
  }

  return color;
}

export function renderHeatmap(keyErrorMap) {
  const container = document.getElementById("keyboard-heatmap");

  KEYBOARD_ROWS.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach((key) => {
      const keyDiv = document.createElement("div");
      keyDiv.classList.add("key");

      keyDiv.textContent = key.toUpperCase();

      keyDiv.style.backgroundColor = getKeyColor(key, keyErrorMap);
      rowDiv.append(keyDiv);
    });

    container.append(rowDiv);
  });

  const spaceDiv = document.createElement("div");
  spaceDiv.classList.add("space-row");
  spaceDiv.textContent = "Space";
  spaceDiv.style.backgroundColor = getKeyColor(" ", keyErrorMap[" "]);
  container.append(spaceDiv);
}
