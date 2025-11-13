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
const themeToggle = document.getElementById('themeToggle');

const categorySelect = document.getElementById('categorySelect');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');

const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const reminderInput = document.getElementById('reminderInput');
const sortSelect = document.getElementById('sortSelect');

let currentUser = '';
let tasks = [];
let categories = ['Personal', 'Work', 'Shopping'];
let currentFilter = 'all';
let currentCategory = 'Personal';
let currentSort = 'custom';
let reminderIntervals = {};

/* ===== THEME TOGGLE ===== */
if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

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
        if (!localStorage.getItem(`categories_${currentUser}`)) {
            localStorage.setItem(`categories_${currentUser}`, JSON.stringify(categories));
        }

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });

    // Allow Enter key to submit
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                enterBtn.click();
            }
        });
    }
}

/* ===== LOAD USER ON DASHBOARD ===== */
document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser && usernameSpan) {
        currentUser = storedUser;
        usernameSpan.textContent = currentUser;
        tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        categories = JSON.parse(localStorage.getItem(`categories_${currentUser}`)) || ['Personal', 'Work', 'Shopping'];
        
        renderCategories();
        renderTasks();
        startReminderChecks();
    }
});

/* ===== CATEGORIES ===== */
function renderCategories() {
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === currentCategory) option.selected = true;
        categorySelect.appendChild(option);
    });
}

if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        renderTasks(currentFilter);
    });
}

if (addCategoryBtn && newCategoryInput) {
    addCategoryBtn.addEventListener('click', () => {
        const newCat = newCategoryInput.value.trim();
        if (!newCat) return alert('Please enter a category name');
        if (categories.includes(newCat)) return alert('Category already exists');
        
        categories.push(newCat);
        saveCategories();
        renderCategories();
        newCategoryInput.value = '';
        currentCategory = newCat;
        categorySelect.value = newCat;
    });
}

function saveCategories() {
    if (!currentUser) return;
    localStorage.setItem(`categories_${currentUser}`, JSON.stringify(categories));
}

/* ===== RENDER TASKS ===== */
function renderTasks(filter = currentFilter) {
    if (!todoList) return;

    currentFilter = filter;
    todoList.innerHTML = '';

    let filtered = tasks.filter(task => {
        const matchesCategory = task.category === currentCategory;
        const matchesFilter = 
            filter === 'all' ? true :
            filter === 'active' ? !task.completed :
            filter === 'completed' ? task.completed : true;
        return matchesCategory && matchesFilter;
    });

    // Sort tasks
    filtered = sortTasks(filtered);

    if (filtered.length === 0) {
        todoList.innerHTML = `<li class="empty-state">No tasks here yet. Add one to get started!</li>`;
    } else {
        filtered.forEach((task) => {
            const taskIndex = tasks.indexOf(task);
            const li = document.createElement('li');
            li.className = `todo-item priority-${task.priority}${task.completed ? ' completed' : ''}`;
            
            const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : '';
            const reminderInfo = task.reminder ? `⏰ ${task.reminder} min before` : '';
            
            li.innerHTML = `
                <div class="todo-item-content">
                    <div class="todo-item-text">${task.text}</div>
                    <div class="todo-item-meta">
                        <span>🎯 ${task.priority}</span>
                        ${dueInfo ? `<span>📅 ${dueInfo}</span>` : ''}
                        ${reminderInfo ? `<span>${reminderInfo}</span>` : ''}
                    </div>
                </div>
                <div class="todo-item-actions">
                    <button class="complete-btn" title="Toggle complete">${task.completed ? '✔️' : '✅'}</button>
                    <button class="delete-btn" title="Delete task">🗑️</button>
                </div>
            `;

            // Toggle complete
            li.querySelector('.complete-btn').addEventListener('click', () => {
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                saveTasks();
                renderTasks(filter);
            });

            // Delete task
            li.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('Delete this task?')) {
                    clearReminder(taskIndex);
                    tasks.splice(taskIndex, 1);
                    saveTasks();
                    renderTasks(filter);
                }
            });

            todoList.appendChild(li);
        });
    }

    updateStats();
}

function sortTasks(taskList) {
    const sorted = [...taskList];
    
    if (currentSort === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (currentSort === 'dueDate') {
        sorted.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    } else if (currentSort === 'recent') {
        sorted.reverse();
    }
    
    return sorted;
}

function formatDueDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return '⚠️ Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    
    return date.toLocaleDateString();
}

function updateStats() {
    if (!stats) return;
    
    const categoryTasks = tasks.filter(t => t.category === currentCategory);
    const activeTasks = categoryTasks.filter(t => !t.completed).length;
    const totalTasks = categoryTasks.length;
    
    stats.textContent = `${activeTasks} active / ${totalTasks} total in ${currentCategory}`;
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
        
        const newTask = {
            text,
            completed: false,
            category: currentCategory,
            priority: prioritySelect ? prioritySelect.value : 'medium',
            dueDate: dueDateInput ? dueDateInput.value : null,
            reminder: reminderInput && reminderInput.value ? parseInt(reminderInput.value) : null,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        todoInput.value = '';
        if (dueDateInput) dueDateInput.value = '';
        if (reminderInput) reminderInput.value = '';
        
        saveTasks();
        renderTasks(currentFilter);
        
        // Set reminder if applicable
        if (newTask.dueDate && newTask.reminder) {
            setReminder(tasks.length - 1);
        }
    });

    // Allow Enter key to add task
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });
}

/* ===== SORT SELECT ===== */
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks(currentFilter);
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
        if (confirm(`Clear all tasks in ${currentCategory}? This cannot be undone.`)) {
            tasks = tasks.filter(t => t.category !== currentCategory);
            Object.keys(reminderIntervals).forEach(key => clearReminder(parseInt(key)));
            saveTasks();
            renderTasks(currentFilter);
        }
    });
}

/* ===== LOGOUT ===== */
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Sign out? Your tasks will be saved.')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

/* ===== REMINDERS ===== */
function setReminder(taskIndex) {
    const task = tasks[taskIndex];
    if (!task.dueDate || !task.reminder) return;
    
    const dueTime = new Date(task.dueDate);
    const reminderTime = new Date(dueTime.getTime() - task.reminder * 60000);
    const now = new Date();
    const delay = reminderTime - now;
    
    if (delay > 0) {
        reminderIntervals[taskIndex] = setTimeout(() => {
            if (!tasks[taskIndex].completed) {
                alert(`⏰ Reminder: "${tasks[taskIndex].text}" is due in ${task.reminder} minutes!`);
            }
        }, delay);
    }
}

function clearReminder(taskIndex) {
    if (reminderIntervals[taskIndex]) {
        clearTimeout(reminderIntervals[taskIndex]);
        delete reminderIntervals[taskIndex];
    }
}

function startReminderChecks() {
    tasks.forEach((task, index) => {
        if (task.dueDate && task.reminder && !task.completed) {
            setReminder(index);
        }
    });
}