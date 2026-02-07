function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'view-step5' || viewId === 'view-step6') {
        loadTasks();
    }
}

function saveTaskData() {
    const bigTask = document.getElementById('big-task-input').value;
    
    const smallTaskInputs = document.querySelectorAll('.small-task-input');
    const smallTasks = Array.from(smallTaskInputs)
                            .map(input => input.value)
                            .filter(val => val.trim() !== "");

    const taskFlowData = {
        id: Date.now(),
        bigTask: bigTask,
        smallTasks: smallTasks,
        deadline: document.querySelector('input[type="date"]').value,
        duration: document.getElementById('time-select').value
    };

    let allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    allTasks.push(taskFlowData);
    localStorage.setItem('focusFlowTasks', JSON.stringify(allTasks));

    document.getElementById('big-task-input').value = "";
    document.getElementById('small-tasks-list').innerHTML = `
        <div class="task-input-container">
            <input class="small-task-input" type="text" placeholder="write small task" />
        </div>`;

    navigateTo('view-step5');
}

function loadTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    container.innerHTML = "";

    allTasks.forEach(task => {
        const firstSmallTask = task.smallTasks.length > 0 ? task.smallTasks[0] : "No sub-tasks";
        
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-info">
                <span class="label-big-task">${task.bigTask}</span>
                <h2 class="main-small-task">${firstSmallTask}</h2>
            </div>
            <button class="play-btn" onclick="startSpecificTask(${task.id})">
                <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </button>
        `;
        container.appendChild(taskCard);
    });

    const activeData = JSON.parse(localStorage.getItem('currentActiveTask'));
    if (activeData && document.getElementById('display-big-task')) {
        document.getElementById('display-big-task').innerText = activeData.bigTask;
        document.getElementById('display-small-tasks').innerText = activeData.smallTasks[0] || "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start');
    const storeBtn = document.getElementById('btn-store');

    if (startBtn) startBtn.addEventListener('click', saveTaskData);
    if (storeBtn) storeBtn.addEventListener('click', saveTaskData);
    
    loadTasks();
});

function addTaskField() {
    const list = document.getElementById('small-tasks-list');
    const newField = document.createElement('div');
    newField.className = 'task-input-container';
    newField.innerHTML = `
        <input class="small-task-input" type="text" placeholder="write small task" />
        <button class="delete-btn" onclick="removeTaskField(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    `;
    list.appendChild(newField);
}

function removeTaskField(button) {
    const list = document.getElementById('small-tasks-list');
    if (list.children.length > 1) {
        button.closest('.task-input-container').remove();
    } else {
        button.previousElementSibling.value = '';
    }
}

function startSpecificTask(taskId) {
    const allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    const selected = allTasks.find(t => t.id === taskId);
    localStorage.setItem('currentActiveTask', JSON.stringify(selected));
    navigateTo('view-step6');
}