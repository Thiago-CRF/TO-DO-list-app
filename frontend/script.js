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
        taskList.innerHTML = ''; // Limpa a lousa para desenhar a lista atualizada

        tasks.forEach(task => {
            // 1. Criamos a caixa principal (O Cartão da Tarefa)
            const li = document.createElement('li');
            li.className = 'task-card'; // Damos um "nome" para o CSS poder pintar depois

            const headerDiv = document.createElement('div');
            headerDiv.className = 'task-header';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed; // Marca se já veio concluída do banco
            
            // Quando alguém clicar na caixa, chama a nossa função nova passando a tarefa inteira
            checkbox.onchange = () => toggleTaskStatus(task); 

            const titleElement = document.createElement('h3');
            titleElement.textContent = task.title;

            // Se a tarefa já está concluída, adicionamos os estilos visuais
            if (task.completed) {
                titleElement.classList.add('completed-title'); // Risca o título
                li.classList.add('completed-card'); // Deixa a borda verde
            }

            // Colocamos o checkbox e o título dentro da caixinha de cabeçalho
            headerDiv.appendChild(checkbox);
            headerDiv.appendChild(titleElement);

            // 3. Criamos a Descrição
            const descElement = document.createElement('p');
            descElement.textContent = task.description ? task.description : "Sem descrição detalhada."; 

            // 4. Criamos uma "gaveta" (div) para os detalhes menores
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'task-details';

            function formatarDataHora(dataString) {
                if (!dataString) return 'Sem prazo';
                const d = new Date(dataString);
                const data = d.toLocaleDateString('pt-BR'); // Ex: 20/03/2026
                const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); // Ex: 15:30
                
                // Retorna a data, quebra a linha (<br>) e coloca a hora um pouco menor (<small>)
                return `${data}<br><small class="hora-detalhe">🕒 ${hora}</small>`;
            }

            const dataCriacao = task.creation_date ? formatarDataHora(task.creation_date) : 'Desconhecida';
            const dataEntrega = task.due_date ? formatarDataHora(task.due_date) : 'Sem prazo';
            const statusTexto = task.completed ? "Concluída" : "Pendente";

            // Coloquei uns <br> nos títulos também para ficar tudo alinhado e bonito!
            detailsDiv.innerHTML = `
                <span>Status:<br><strong>${statusTexto}</strong></span>
                <span>Criada em:<br>${dataCriacao}</span>
                <span>Para:<br>${dataEntrega}</span>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Excluir';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteTask(task.id);

            // 5. Montamos o Lego:
            // Agora adicionamos o headerDiv em vez do titleElement solto!
            li.appendChild(headerDiv); 
            li.appendChild(descElement);
            li.appendChild(detailsDiv);
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });
        
    } else {
        logout(); // Se o token estiver vencido, expulsa o usuário
    }
}

async function createTask() {
    console.log("Iniciando a criação da tarefa...");

    // 1. CAPTURAR OS ELEMENTOS (As "caixas" do HTML)
    const campoTitulo = document.getElementById('new-task-title');
    const campoDesc = document.getElementById('new-task-desc');
    const campoData = document.getElementById('new-task-date');
    const campoHora = document.getElementById('new-task-time'); // Esse é o novo campo de hora

    // 2. CAPTURAR OS VALORES (O que está escrito dentro)
    const titulo = campoTitulo.value;
    const descricao = campoDesc.value;
    const dataApenas = campoData.value;
    const horaApenas = campoHora.value;

    // Validação básica: se não tem título, nem tenta continuar
    if (!titulo) {
        alert("Por favor, digite um título para a tarefa.");
        return;
    }

    // 3. MONTAR A DATA PARA O PYTHON
    // O Python espera algo como "2026-03-20T15:30"
    let dataFinal = null;
    if (dataApenas) {
        // Se o usuário escolheu data mas não hora, usamos "12:00" como padrão
        const horaFormatada = horaApenas || "12:00";
        dataFinal = `${dataApenas}T${horaFormatada}`;
    }

    console.log("Dados que serão enviados:", { titulo, descricao, dataFinal });

    // 4. ENVIAR PARA A API (PYTHON)
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: titulo,
                description: descricao || "",
                completed: false,
                due_date: dataFinal // Nome exato que está no seu schemas.py
            })
        });

        if (response.ok) {
            // 5. LIMPAR OS CAMPOS (Só se deu tudo certo)
            campoTitulo.value = '';
            campoDesc.value = '';
            campoData.value = '';
            campoHora.value = '';
            
            console.log("Tarefa criada com sucesso!");
            loadTasks(); // Atualiza a lista na tela
        } else {
            const erroApi = await response.json();
            console.error("Erro retornado pela API:", erroApi);
            alert("O servidor recusou a tarefa. Verifique os logs.");
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
        alert("Não foi possível conectar ao servidor.");
    }
}

async function deleteTask(taskId) {
    // 1. O NAVEGADOR PERGUNTA: A função confirm() pausa o código e mostra a janela
    const confirmacao = confirm("Quer mesmo apagar essa tarefa?");

    // 2. A DECISÃO: Se o usuário clicar em "Cancelar", confirmacao será 'false'
    if (confirmacao === true) {
        
        // Se ele clicou em "OK", mandamos o pedido DELETE para a API
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Se a API apagou com sucesso, chamamos loadTasks() de novo.
            // Isso vai limpar a tela e puxar a lista atualizada (agora sem a tarefa apagada!)
            loadTasks(); 
        } else {
            alert("Erro ao excluir a tarefa.");
        }
    }
}

async function toggleTaskStatus(task) {
    // 1. Invertemos o status atual (Se era false, vira true. Se era true, vira false)
    const novoStatus = !task.completed;

    // 2. Montamos o pacote para a sua rota PUT.
    // Como o seu schemas.CreateTask no Python exige o título, nós mandamos o 
    // título, descrição e data antigos, apenas mudando o campo "completed".
    const payload = {
        title: task.title,
        description: task.description,
        completed: novoStatus,
        due_date: task.due_date 
    };

    // 3. Enviamos o PUT para a rota de edição passando o ID da tarefa
    const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        // Se deu certo, recarregamos a lista para atualizar a cor e o riscado
        loadTasks();
    } else {
        alert("Erro ao atualizar o status da tarefa.");
        loadTasks(); // Recarrega para desmarcar o checkbox caso a API tenha falhado
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