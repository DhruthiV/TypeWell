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
