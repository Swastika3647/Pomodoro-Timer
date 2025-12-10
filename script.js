let workTime = 25 * 60; 
let breakTime = 5 * 60; 
let currentTime = workTime;
let isRunning = false;
let isWorkSession = true;
let interval;


const timerDisplay = document.getElementById("timer");
const statusText = document.getElementById("status");
const audio = document.getElementById("ghibli-bgm");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");



function updateDisplay() {
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  timerDisplay.textContent =
    String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    audio.play().catch(e => console.log("Audio play failed (browser policy):", e)); 
    
    interval = setInterval(() => {
      if (currentTime > 0) {
        currentTime--;
        updateDisplay();
      } else {
        
        clearInterval(interval);
        isRunning = false;
        
        
        if (isWorkSession) {
            incrementPomodoroCount();
            updateStreak();
            logSession();
            updateStatsUI(); 
            alert("Great job! Take a short break.");
        } else {
            alert("Break over! Time to focus.");
        }

     
        isWorkSession = !isWorkSession;
        currentTime = isWorkSession ? workTime : breakTime;
        statusText.textContent = isWorkSession ? "Work Time" : "Break Time";
        
        
        startTimer(); 
      }
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(interval);
  isRunning = false;
  audio.pause(); 
}

function resetTimer() {
  stopTimer();
  isWorkSession = true;
  currentTime = workTime;
  statusText.textContent = "Work Time";
  updateDisplay();
  audio.currentTime = 0; 
}

startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);



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
  return weeklySessions.length * 25; 
}

function updateStatsUI() {
    
    document.getElementById("todayCount").innerText = localStorage.getItem('pomodoroCount') || 0;
    document.getElementById("streakCount").innerText = localStorage.getItem('pomodoroStreak') || 0;
    document.getElementById("weeklyMinutes").innerText = getWeeklyFocusMinutes();
}




function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    
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


window.onload = function() {
    updateDisplay();
    loadTasks();
    updateStatsUI();
};
const API_KEY = "AIzaSyDhWgp6DtVnDZiI7Ea1RYG54lC5nnOn3a8"; // Keep your key safe!

async function generateAiTasks() {
    const input = document.getElementById('taskInput');
    const dropdown = document.getElementById('aiDropdown');
    const userTopic = input.value.trim() || "productivity";

    // 1. Show loading state inside the input
    const originalPlaceholder = input.placeholder;
    input.placeholder = "Summoning tasks...";
    input.value = ""; // Clear input so user sees placeholder

    try {
        const prompt = `Give me 3 short, clear to-do list tasks related to: ${userTopic}. 
        Return ONLY the task names separated by commas (no numbering).`;

       // notice the backtick ` at the start
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        const tasks = aiText.split(',').map(t => t.trim());

        // 2. Clear and Show Dropdown
        dropdown.innerHTML = '';
        dropdown.style.display = 'block';

        // 3. Create Dropdown Items
        tasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerText = task;

            // Click event: Select the task
            item.onclick = () => {
                input.value = task; // Fill input
                dropdown.style.display = 'none'; // Hide dropdown
                input.placeholder = originalPlaceholder; // Reset placeholder
                
                // Optional: Auto-add the task?
                // addTask(); 
            };
            
            dropdown.appendChild(item);
        });

    } catch (error) {
        console.error("AI Error:", error);
        input.placeholder = "Try again later...";
    }
}

// 4. Close dropdown if clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('aiDropdown');
    const inputWrapper = document.querySelector('.input-wrapper');
    const magicBtn = document.getElementById('aiSuggestBtn');

    // If click is NOT inside the wrapper or on the magic button, hide dropdown
    if (!inputWrapper.contains(e.target) && e.target !== magicBtn) {
        dropdown.style.display = 'none';
    }
});
// 1. A list of common tasks to suggest instantly
// You can add as many words as you want here!
const wordBank = [
  "Study", "Sleep", "Stretch", "Science", "Statistics", 
  "Social Media Detox", "Summarize Notes", "Sketching", "Solve LeetCode",
  "Code", "Chemistry", "Cleaning", "Call Mom", "Cooking",
  "Read Book", "Review Flashcards", "Relax", "Research",
  "Meditation", "Math Practice", "Meeting", "Music Practice",
  "Journaling", "Jogging", "Java Project",
  "Physics", "Plan Week", "Podcast", "Project Work"
];

const inputField = document.getElementById('taskInput');
const dropdown = document.getElementById('aiDropdown');

// 2. Listen for typing events
inputField.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    dropdown.innerHTML = ''; // Clear old suggestions

    // If input is empty, hide dropdown
    if (!value) {
        dropdown.style.display = 'none';
        return;
    }

    // 3. Filter the list: Find words that start with what you typed
    const matches = wordBank.filter(word => word.toLowerCase().startsWith(value));

    // 4. Show suggestions if matches are found
    if (matches.length > 0) {
        dropdown.style.display = 'block';
        
        matches.forEach(match => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.innerText = match;
            
            // When clicked, fill input
            item.onclick = () => {
                inputField.value = match;
                dropdown.style.display = 'none';
                // Optional: Automatically add the task?
                // addTask(); 
            };
            
            dropdown.appendChild(item);
        });
    } else {
        dropdown.style.display = 'none';
    }
});

// 5. Hide dropdown when clicking outside (Keep this from previous step)
document.addEventListener('click', (e) => {
    if (!inputField.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});
const taskInput = document.getElementById('taskInput');
const suggestionsList = document.getElementById('suggestionsList');

// Debounce function: Prevents API calls on every single keystroke (waits 300ms)
let debounceTimer;

taskInput.addEventListener('input', function() {
    const query = this.value;
    
    // Clear previous timer
    clearTimeout(debounceTimer);

    // If input is empty, hide list
    if (!query) {
        suggestionsList.style.display = 'none';
        return;
    }

    // Wait 300ms after user stops typing to call API
    debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
    }, 300);
});

async function fetchSuggestions(word) {
    try {
        // Calls Datamuse API (sug = suggest completion)
        const response = await fetch(`https://api.datamuse.com/sug?s=${word}&max=5`);
        const data = await response.json();
        
        showSuggestions(data);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

function showSuggestions(words) {
    // Clear old list
    suggestionsList.innerHTML = '';

    if (words.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    // Create a list item for each word
    words.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.word;
        
        // When clicked, fill the input and hide list
        li.onclick = () => {
            taskInput.value = item.word;
            suggestionsList.style.display = 'none';
        };
        
        suggestionsList.appendChild(li);
    });

    // Show the list
    suggestionsList.style.display = 'block';
}

// Close dropdown if user clicks outside
document.addEventListener('click', function(e) {
    if (!taskInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.style.display = 'none';
    }
});





