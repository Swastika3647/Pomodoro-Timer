// --- 1. Variables & Configuration ---
let workTime = 25 * 60; // 25 minutes
let breakTime = 5 * 60; // 5 minutes
let currentTime = workTime;
let isRunning = false;
let isWorkSession = true;
let interval;

// DOM Elements
const timerDisplay = document.getElementById("timer");
const statusText = document.getElementById("status");
const audio = document.getElementById("ghibli-bgm");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");

// --- 2. Timer Logic ---

function updateDisplay() {
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  timerDisplay.textContent =
    String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    audio.play().catch(e => console.log("Audio play failed (browser policy):", e)); // Try to play music
    
    interval = setInterval(() => {
      if (currentTime > 0) {
        currentTime--;
        updateDisplay();
      } else {
        // --- Timer Finished! ---
        clearInterval(interval);
        isRunning = false;
        
        // If we just finished a Work Session, update stats
        if (isWorkSession) {
            incrementPomodoroCount();
            updateStreak();
            logSession();
            updateStatsUI(); // Update the HTML numbers
            alert("Great job! Take a short break.");
        } else {
            alert("Break over! Time to focus.");
        }

        // Switch Modes
        isWorkSession = !isWorkSession;
        currentTime = isWorkSession ? workTime : breakTime;
        statusText.textContent = isWorkSession ? "Work Time" : "Break Time";
        
        // Auto-start next session (optional, keeps flow going)
        startTimer(); 
      }
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(interval);
  isRunning = false;
  audio.pause(); // Pause music
}

function resetTimer() {
  stopTimer();
  isWorkSession = true;
  currentTime = workTime;
  statusText.textContent = "Work Time";
  updateDisplay();
  audio.currentTime = 0; // Rewind music
}

// --- 3. Event Listeners ---
startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);


// --- 4. Stats & LocalStorage Logic ---

function incrementPomodoroCount() {
  // Note: This tracks TOTAL pomodoros forever. 
  // To track "Today" specifically requires checking dates, but we'll use this for now.
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

    // If last session was yesterday, increment streak. Else if older, reset to 1.
    if (lastDate && new Date(lastDate).toDateString() === yesterday.toDateString()) {
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

function updateStatsUI() {
    // Update the HTML elements with new data
    document.getElementById("todayCount").innerText = localStorage.getItem('pomodoroCount') || 0;
    document.getElementById("streakCount").innerText = localStorage.getItem('pomodoroStreak') || 0;
    document.getElementById("weeklyMinutes").innerText = getWeeklyFocusMinutes();
}


// --- 5. Task List Logic ---

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    // Added styling for the list item to make it look nice
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.marginBottom = "5px";
    
    li.innerHTML = `
      <span>
        <input type="checkbox" onclick="toggleTask(${index})" ${task.done ? 'checked' : ''}>
        <span style="${task.done ? 'text-decoration: line-through; color: gray;' : ''} margin-left: 5px;">${task.text}</span>
      </span>
      <button onclick="deleteTask(${index})" style="background:none; border:none; cursor:pointer;">🗑️</button>
    `;
    taskList.appendChild(li);
  });
}

function addTask() { // Make this globally available
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.push({ text, done: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  input.value = '';
  loadTasks();
}
// Expose functions to window so HTML onclick="..." can find them
window.addTask = addTask; 

window.toggleTask = function(index) {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  tasks[index].done = !tasks[index].done;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

window.deleteTask = function(index) {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  tasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

// --- 6. Initialization ---
window.onload = function() {
    updateDisplay();
    loadTasks();
    updateStatsUI();
};





