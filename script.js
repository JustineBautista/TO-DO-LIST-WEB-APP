/* ===== ELEMENTS ===== */
const userInput = document.getElementById('UserInput');
const enterBtn = document.getElementById('EnterBtn');

const usernameSpan = document.getElementById('username');
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const stats = document.getElementById('stats');

const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const logoutBtn = document.getElementById('logoutBtn');

const sidenav = document.getElementById('sidenav');
const menuToggle = document.getElementById('menuToggle');

let currentUser = '';
let tasks = [];

/* ===== SIDEBAR TOGGLE ===== */
if (menuToggle && sidenav) {
    menuToggle.addEventListener('click', () => {
        sidenav.classList.toggle('open');
    });
}

/* ===== LOGIN / WELCOME PAGE ===== */
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        const name = userInput.value.trim();
        if (!name) return alert('Please enter your name');
        
        currentUser = name;
        localStorage.setItem('currentUser', currentUser);

        // Initialize empty tasks for new user
        if (!localStorage.getItem(`tasks_${currentUser}`)) {
            localStorage.setItem(`tasks_${currentUser}`, JSON.stringify([]));
        }

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

/* ===== LOAD USER ON DASHBOARD ===== */
document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser && usernameSpan) {
        currentUser = storedUser;
        usernameSpan.textContent = currentUser;
        tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        renderTasks();
    }
});

/* ===== RENDER TASKS ===== */
function renderTasks(filter = 'all') {
    if (!todoList) return;

    todoList.innerHTML = '';

    const filtered = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
    });

    if (filtered.length === 0) {
        todoList.innerHTML = `<li class="empty-state">No tasks here</li>`;
    }

    filtered.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (task.completed ? ' completed' : '');
        li.innerHTML = `
            <span>${task.text}</span>
            <div>
                <button class="complete-btn">${task.completed ? '✔️' : '✅'}</button>
                <button class="delete-btn">🗑️</button>
            </div>
        `;

        // Toggle complete
        li.querySelector('.complete-btn').addEventListener('click', () => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks(filter);
        });

        // Delete task
        li.querySelector('.delete-btn').addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks(filter);
        });

        todoList.appendChild(li);
    });

    if (stats) {
        stats.textContent = `${tasks.length} tasks`;
    }
}

/* ===== SAVE TASKS ===== */
function saveTasks() {
    if (!currentUser) return;
    localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
}

/* ===== ADD TASK ===== */
if (addBtn && todoInput) {
    addBtn.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (!text) return;
        tasks.push({ text, completed: false });
        todoInput.value = '';
        saveTasks();
        renderTasks();
    });
}

/* ===== FILTER BUTTONS ===== */
if (filterBtns.length) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });
}

/* ===== CLEAR ALL ===== */
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });
}

/* ===== LOGOUT ===== */
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}
