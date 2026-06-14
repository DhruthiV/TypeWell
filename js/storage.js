export function storeItemToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function storeHistory(key, value) {
  const history = JSON.parse(localStorage.getItem(key)) || [];
  if (history.length === 5) {
    history.shift();
  }
  history.push(value);
  localStorage.setItem(key, JSON.stringify(history));
}

export function getHistory(key) {
  const history = JSON.parse(localStorage.getItem(key)) || [];
  return history;
}

export function removeItemFromStorage(key) {
  localStorage.removeItem(key);
}

export function getBestScore(key, mode) {
  const history = JSON.parse(localStorage.getItem(key)) || [];
  const modeHistory = history.filter((entry) => entry.mode === mode);

  if (modeHistory.length < 2) return Infinity;
  return Math.max(
    ...modeHistory.map((entry) => entry.wpm * (entry.accuracy / 100)),
  );
}
