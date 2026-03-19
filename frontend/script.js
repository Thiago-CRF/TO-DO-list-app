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

            // 2. Criamos o Título (Tag <h3> significa Cabeçalho nível 3)
            const titleElement = document.createElement('h3');
            titleElement.textContent = task.title;

            // 3. Criamos a Descrição (Tag <p> significa Parágrafo)
            const descElement = document.createElement('p');
            // Se a tarefa não tiver descrição, colocamos um texto padrão
            descElement.textContent = task.description ? task.description : "Sem descrição detalhada."; 

            // 4. Criamos uma "gaveta" (div) para os detalhes menores
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'task-details';

            // O Python manda a data assim: "2026-03-19T14:30:00"
            // Nós usamos o "new Date()" do JavaScript para transformar isso em "19/03/2026"
            const dataCriacao = task.creation_date 
                ? new Date(task.creation_date).toLocaleDateString('pt-BR') 
                : 'Data desconhecida';
            
            // Nota: Estou assumindo que a coluna no seu banco se chama 'due_date'. 
            // Se for outro nome, mude aqui!
            const dataEntrega = task.due_date 
                ? new Date(task.due_date).toLocaleDateString('pt-BR') 
                : 'Sem prazo';

            // O Status (Verdadeiro ou Falso) vira texto e emoji
            const statusTexto = task.completed ? "✅ Concluída" : "Pendente";

            // Preenchemos a "gaveta" usando innerHTML (injeta código HTML direto)
            // A tag <span> serve para agrupar pequenos pedaços de texto na mesma linha
            detailsDiv.innerHTML = `
                <span>Status: <strong>${statusTexto}</strong></span>
                <span>Criada em: ${dataCriacao}</span>
                <span>Para: ${dataEntrega}</span>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.className = 'delete-btn';

            deleteBtn.onclick = () => deleteTask(task.id);

            // 5. Montamos o Lego: Colocamos o título, descrição e detalhes DENTRO da caixa
            li.appendChild(titleElement);
            li.appendChild(descElement);
            li.appendChild(detailsDiv);
            li.appendChild(deleteBtn);

            // 6. Por fim, colocamos a caixa pronta na tela (dentro da tag <ul> do HTML)
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