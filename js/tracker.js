import { storeHistory } from "./storage.js";

let correctChar = 0;
let wrongChar = 0;
let backspaceCount = 0;
let keystrokeLog = []; // { expected, typed, correct, time }
let keyErrorMap = {}; //{ 'r': { attempts: 10, errors: 3 } }
let wpmHistory = [];
let testStartTime = null;

export function recordTestStart(time) {
  testStartTime = time;
}

const compareCharacter = (expected, typed) => {
  if (typed === expected) {
    correctChar++;
    return "correct";
  } else {
    wrongChar++;
    return "incorrect";
  }
};

export function recordKeystroke(expected, typed) {
  const result = compareCharacter(expected, typed);

  keyErrorMap[expected] = keyErrorMap[expected] || { attempts: 0, errors: 0 };

  keyErrorMap[expected].attempts++;
  if (result === "incorrect") keyErrorMap[expected].errors++;

  keystrokeLog.push({
    expected,
    typed,
    correct: result === "correct",
    time: Date.now(),
  });

  return result;
}

export function recordBackspace() {
  backspaceCount++;
}

export function sampleWpm() {
  const elapsedSeconds = (Date.now() - testStartTime) / 1000;
  const elapsedMinutes = elapsedSeconds / 60;
  const currentWpm =
    elapsedMinutes > 0 ? Math.round(correctChar / 5 / elapsedMinutes) : 0;
  wpmHistory.push({ second: Math.round(elapsedSeconds), wpm: currentWpm });
}

export function getSnapshot(mode) {
  const elapsedSeconds = (Date.now() - testStartTime) / 1000;
  const finalElapsedMinutes = elapsedSeconds / 60;
  const finalWpm =
    finalElapsedMinutes > 0
      ? Math.round(correctChar / 5 / finalElapsedMinutes)
      : 0;
  const accuracy = Math.round((correctChar / (correctChar + wrongChar)) * 100);

  const snapshot = {
    wpm: finalWpm,
    accuracy: accuracy,
    correctChars: correctChar,
    wrongChars: wrongChar,
    totalKeyStroke: correctChar + wrongChar + backspaceCount,
    backspaceCount: backspaceCount,
    duration: Math.round(elapsedSeconds),
    keyErrorMap: keyErrorMap,
    keystrokeLog: keystrokeLog,
    mode,
    timestamp: new Date().toISOString(),
    wpmHistory: wpmHistory,
  };

  return snapshot;
}

export function resetTracker() {
  correctChar = 0;
  wrongChar = 0;
  backspaceCount = 0;
  keystrokeLog = [];
  keyErrorMap = {};
  testStartTime = null;
}
