        let todos = [];
            let currentFilter = 'all';

            // Load todos from localStorage
            function loadTodos() {
                const stored = localStorage.getItem('todos');
                if (stored) {
                    todos = JSON.parse(stored);
                }
                renderTodos();
            }

            // Save todos to localStorage
            function saveTodos() {
                localStorage.setItem('todos', JSON.stringify(todos));
            }

            // Add new todo
            function addTodo() {
                const input = document.getElementById('todoInput');
                const text = input.value.trim();
                
                if (text) {
                    todos.push({
                        id: Date.now(),
                        text: text,
                        completed: false
                    });
                    input.value = '';
                    saveTodos();
                    renderTodos();
                }
            }

            // Toggle todo completion
            function toggleTodo(id) {
                todos = todos.map(function(todo) {
                    if (todo.id === id) {
                        return { id: todo.id, text: todo.text, completed: !todo.completed };
                    }
                    return todo;
                });
                saveTodos();
                renderTodos();
            }

            // Delete todo
            function deleteTodo(id) {
                todos = todos.filter(function(todo) {
                    return todo.id !== id;
                });
                saveTodos();
                renderTodos();
            }

            // Edit todo
            function editTodo(id) {
                var newText = prompt("Edit your task:", todos.find(function(t) { 
                    return t.id === id; }).text);
            
                if (newText && newText.trim()) {
                    todos = todos.map(function(todo) {
                        if (todo.id === id) {
                            return { id: todo.id, text: newText.trim(), completed: todo.completed };
                }
                return todo;
            });
                    saveTodos();
                    renderTodos();
                }
            }

            // Filter todos
            function filterTodos() {
                switch (currentFilter) {
                    case 'active':
                        return todos.filter(function(todo) { return !todo.completed; });
                    case 'completed':
                        return todos.filter(function(todo) { return todo.completed; });
                    default:
                        return todos;
                }
            }

            // Render todos
    function renderTodos() {
        var todoList = document.getElementById('todoList');
        var filtered = filterTodos();
        
        if (filtered.length === 0) {
            todoList.innerHTML = '<div class="empty-state">No tasks to show</div>';
        } else {
            todoList.innerHTML = filtered.map(function(todo) {
                if (todo.isEditing) {
                    // Show edit mode
                    return '<li class="todo-item editing">' +
                        '<input type="text" class="edit-input" id="edit-' + todo.id + '" value="' + todo.text + '">' +
                        '<button class="save-btn" onclick="saveEdit(' + todo.id + ')">Save</button>' +
                        '<button class="cancel-btn" onclick="cancelEdit(' + todo.id + ')">Cancel</button>' +
                    '</li>';
                } else {
                    // Show normal mode
                    return '<li class="todo-item ' + (todo.completed ? 'completed' : '') + '">' +
                        '<input type="checkbox" ' + (todo.completed ? 'checked' : '') + ' onchange="toggleTodo(' + todo.id + ')">' +
                        '<span>' + todo.text + '</span>' +
                        '<button class="edit-btn" ' + (todo.completed ? 'disabled' : '<button class="edit-btn" ' + (todo.completed ? 'disabled' : 'onclick="startEdit(' + todo.id + ')"') + '>Edit</button>') +
                        '<button class="delete-btn" onclick="deleteTodo(' + todo.id + ')">Delete</button>' +
                    '</li>';
                }
            }).join('');
        }

        var activeCount = todos.filter(function(t) { return !t.completed; }).length;
        var completedCount = todos.filter(function(t) { return t.completed; }).length;
        document.getElementById('stats').textContent = activeCount + ' active, ' + completedCount + ' completed';
    }
            // Start editing
    function startEdit(id) {
        todos = todos.map(function(todo) {
            if (todo.id === id) {
                return { id: todo.id, text: todo.text, completed: todo.completed, isEditing: true };
            }
            return todo;
        });
        renderTodos();
        // Focus the input
        document.getElementById('edit-' + id).focus();
    }

    // Save the edit
    function saveEdit(id) {
        var newText = document.getElementById('edit-' + id).value.trim();
        
        if (newText) {
            todos = todos.map(function(todo) {
                if (todo.id === id) {
                    return { id: todo.id, text: newText, completed: todo.completed, isEditing: false };
                }
                return todo;
            });
            saveTodos();
            renderTodos();
        }
    }

    // Cancel editing
    function cancelEdit(id) {
        todos = todos.map(function(todo) {
            if (todo.id === id) {
                return { id: todo.id, text: todo.text, completed: todo.completed, isEditing: false };
            }
            return todo;
        });
        renderTodos();
    }

                // Update stats
                var activeCount = todos.filter(function(t) { return !t.completed; }).length;
                var completedCount = todos.filter(function(t) { return t.completed; }).length;
                document.getElementById('stats').textContent = 
                    activeCount + ' active, ' + completedCount + ' completed';
            

            

            // Event listeners
            document.getElementById('addBtn').addEventListener('click', addTodo);
            document.getElementById('todoInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTodo();
            });

            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-btn').forEach(b => 
                        b.classList.remove('active')
                    );
                    e.target.classList.add('active');
                    currentFilter = e.target.dataset.filter;
                    renderTodos();
                });
            });
        
            // Initialize
            loadTodos();

            