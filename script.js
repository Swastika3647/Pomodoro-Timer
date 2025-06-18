let workTime = 25 * 60;
let breakTime = 5 * 60;
let currentTime = workTime;
let isRunning = false;
let isWorkSession = true;
let interval;

const timerDisplay = document.getElementById("timer");
const statusText = document.getElementById("status");

function updateDisplay() {
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  timerDisplay.textContent =
    String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    interval = setInterval(() => {
      if (currentTime > 0) {
        currentTime--;
        updateDisplay();
      } else {
        clearInterval(interval);
        isRunning = false;
        isWorkSession = !isWorkSession;
        currentTime = isWorkSession ? workTime : breakTime;
        statusText.textContent = isWorkSession ? "Work Time" : "Break Time";
        startTimer(); // auto start next session
      }
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(interval);
  isRunning = false;
}

function resetTimer() {
  stopTimer();
  currentTime = isWorkSession ? workTime : breakTime;
  updateDisplay();
}

document.getElementById("start").onclick = startTimer;
document.getElementById("stop").onclick = stopTimer;
document.getElementById("reset").onclick = resetTimer;

updateDisplay(); // initialize

const startButton = document.getElementById("start");

startButton.addEventListener("click", () => {
  audio.play();
});


const audio = document.getElementById("ghibli-bgm");
const stopButton = document.getElementById("stop");

stopButton.addEventListener("click", () => {
  audio.pause();
});

