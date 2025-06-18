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
function incrementPomodoroCount() {
  let count = localStorage.getItem('pomodoroCount') || 0;
  localStorage.setItem('pomodoroCount', parseInt(count) + 1);
}
function updateStreak() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('lastPomodoroDate');
  let streak = parseInt(localStorage.getItem('pomodoroStreak') || 0);

  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (new Date(lastDate).toDateString() === yesterday.toDateString()) {
      streak += 1;
    } else {
      streak = 1;
    }

    localStorage.setItem('pomodoroStreak', streak);
    localStorage.setItem('lastPomodoroDate', today);
  }
}
function logSession() {
  let sessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]');
  sessions.push(new Date().toISOString());
  localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
}

function getWeeklyFocusMinutes() {
  const sessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]');
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const weeklySessions = sessions.filter(date => new Date(date) >= oneWeekAgo);
  return weeklySessions.length * 25; // 25 min per session
}
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" onclick="toggleTask(${index})" ${task.done ? 'checked' : ''}>
      <span style="${task.done ? 'text-decoration: line-through;' : ''}">${task.text}</span>
      <button onclick="deleteTask(${index})">🗑️</button>
    `;
    taskList.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.push({ text, done: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  input.value = '';
  loadTasks();
}

function toggleTask(index) {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  tasks[index].done = !tasks[index].done;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

function deleteTask(index) {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  tasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

window.onload = loadTasks;





