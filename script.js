// ==========================
// 🟢 NAME PAGE (index.html)
// ==========================
if (document.getElementById('EnterBtn')) {
  document.getElementById('EnterBtn').addEventListener('click', () => {
    const name = document.getElementById('UserInput').value.trim();

    if (name === "") {
      alert("Please enter your name!");
    } else {
      sessionStorage.setItem("userName", name);
      window.location.href = "dashboard.html";
    }
  });
}

// ==========================
// 🔵 DASHBOARD PAGE
// ==========================
if (document.getElementById('todoList')) {
  const name = sessionStorage.getItem("userName");

  if (!name) {
    window.location.href = "index.html";
  } else {
    document.getElementById("title").textContent = `${name}'s Task List`;
    document.getElementById("userGreeting").textContent = `👋 Hello, ${name}`;
  }

  // NAV toggle
  const sidenav = document.getElementById('sidenav');
  const toggleBtn = document.getElementById('menuToggle');
  toggleBtn.addEventListener('click', () => {
    sidenav.classList.toggle('open');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem("userName");
    window.location.href = "index.html";
  });

  // Clear all tasks
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm("Clear all tasks?")) {
      todos = [];
      saveTodos();
      renderTodos();
    }
  });

  // To-do logic
  let todos = [];
  let currentFilter = 'all';

  function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) todos = JSON.parse(stored);
    renderTodos();
  }

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text) {
      todos.push({ id: Date.now(), text, completed: false });
      input.value = '';
      saveTodos();
      renderTodos();
    }
  }

  window.toggleTodo = function (id) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
  };

  window.deleteTodo = function (id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
  };

  function filterTodos() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function renderTodos() {
    const todoList = document.getElementById('todoList');
    const filtered = filterTodos();

    if (filtered.length === 0) {
      todoList.innerHTML = '<div class="empty-state">No tasks to show</div>';
    } else {
      todoList.innerHTML = filtered.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
          <span>${todo.text}</span>
          <button onclick="deleteTodo(${todo.id})">Delete</button>
        </li>
      `).join('');
    }

    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    document.getElementById('stats').textContent =
      `${activeCount} active, ${completedCount} completed`;
  }

  // Events
  document.getElementById('addBtn').addEventListener('click', addTodo);
  document.getElementById('todoInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') addTodo();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderTodos();
    });
  });

  loadTodos();
}
