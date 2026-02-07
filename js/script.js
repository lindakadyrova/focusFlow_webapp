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
        bigTask: bigTask,
        smallTasks: smallTasks,
        deadline: document.querySelector('input[type="date"]').value,
        duration: document.getElementById('time-select').value
    };

    localStorage.setItem('focusFlowTask', JSON.stringify(taskFlowData));
}

function loadTasks() {
    const savedData = localStorage.getItem('focusFlowTask');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        if(document.getElementById('display-big-task')) {
            document.getElementById('display-big-task').innerText = data.bigTask || "No Task Set";
            
            document.getElementById('display-small-tasks').innerText = data.smallTasks.join(', ');
        }
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