const API_URL = 'http://127.0.0.1:8000'; // http://127.0.0.1:8000 o local. e https://to-do-list-app-7q1n.onrender.com 

let token = localStorage.getItem('token'); // Tenta pegar o token salvo

// Se o usuário já tem um token, pula o login e mostra as tarefas
if (token) {
    showTodoSection();
    loadTasks();
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${email}&password=${password}`
    });

    const data = await response.json();

    if (response.ok) {
        token = data.access_token;
        localStorage.setItem('token', token); // Guarda o token no navegador!
        showTodoSection();
        loadTasks();
    } else {
        alert('Erro: E-mail ou senha incorretos.');
    }
}

async function loadTasks() {
    const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        const tasks = await response.json();
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = ''; // Limpa a lista antiga

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.title;
            taskList.appendChild(li);
        });
    } else {
        // Se o token venceu ou deu erro, desloga o usuário
        logout();
    }
}

async function createTask() {
    const titleInput = document.getElementById('new-task-title');
    const title = titleInput.value;

    if (!title) return alert('Digite um nome para a tarefa!');

    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: title, description: "", completed: false })
    });

    if (response.ok) {
        titleInput.value = ''; // Limpa o campo de texto
        loadTasks(); // Atualiza a lista na tela
    } else {
        alert('Erro ao criar a tarefa.');
    }
}

function logout() {
    token = null;
    localStorage.removeItem('token'); // Apaga a memória do navegador
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('todo-section').style.display = 'none';
}

function showTodoSection() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('todo-section').style.display = 'block';
}