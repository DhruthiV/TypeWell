function getRandomPassage() {
  const index = Math.floor(Math.random() * passages.length);
  return passages[index];
}

const textToType = getRandomPassage();
const characters = textToType.split("");
let currentIndex = 0;

const passageContent = document.getElementById("passage-content");

characters.forEach((ch, index) => {
  let characterElement = document.createElement("span");
  characterElement.textContent = ch;
  passageContent.append(characterElement);
});

const spans = passageContent.querySelectorAll("span");
spans[0].classList.add("active");
document.addEventListener("keydown", checks);

const blockedKeys = [
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Tab",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Delete",
];
function checks(event) {
  const currentSpan = spans[currentIndex];

  if (!currentSpan) return;

  if (blockedKeys.includes(event.key)) return;

  // Backspace
  if (event.key == "Backspace" && currentIndex > 0) {
    currentSpan.classList.remove("active");
    currentIndex--;

    const previousSpan = spans[currentIndex];
    previousSpan.classList.remove("correct", "incorrect");
    previousSpan.classList.add("active");

    return;
  }

  // Normal typing
  if (event.key === characters[currentIndex]) {
    currentSpan.classList.add("correct");
  } else {
    currentSpan.classList.add("incorrect");
  }

  currentSpan.classList.remove("active");

  currentIndex++;

  const nextSpan = spans[currentIndex];
  if (nextSpan) {
    nextSpan.classList.add("active");
  }
}
