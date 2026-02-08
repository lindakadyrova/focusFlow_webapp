function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');

    const header = document.getElementById('global-header');
    const hiddenViews = ['view-landing', 'view-step6', 'view-step7'];

    if (hiddenViews.includes(viewId)) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    
    if (viewId === 'view-step5' || viewId === 'view-step6') {
        loadTasks();
    }

    if (viewId === 'view-step7') {
        const summary = JSON.parse(localStorage.getItem('temp_last_summary'));
        
        if (summary) {
            const estimateMap = {
                "option1": "< 30", "option2": "30", "option3": "60", "option4": "90", "option5": "90+"
            };

            document.getElementById('actual-time-display').innerText = `${summary.actual} minutes`;
            document.getElementById('estimated-time-display').innerText = `${estimateMap[summary.estimate]} minutes`;
            
            localStorage.removeItem('temp_last_summary');
        }
    }
}

function saveTaskData(targetView) {
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
        duration: document.getElementById('time-select').value,
        totalTime: 0
    };

    let allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    allTasks.push(taskFlowData);
    localStorage.setItem('focusFlowTasks', JSON.stringify(allTasks));

    if (targetView === 'view-step6') {
        localStorage.setItem('currentActiveTask', JSON.stringify(taskFlowData));
        sessionStartTime = Date.now(); 
    }

    document.getElementById('big-task-input').value = "";
    document.getElementById('small-tasks-list').innerHTML = `
        <div class="task-input-container">
            <input class="small-task-input" type="text" placeholder="write small task" />
        </div>`;

    navigateTo(targetView);
}

function loadTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    const allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    container.innerHTML = "";

    allTasks.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

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
    const dateInput = document.getElementById('deadline-input');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
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

    list.scrollTo({
        top: list.scrollHeight,
        behavior: 'smooth'
    });

    newField.querySelector('input').focus();
}

function removeTaskField(button) {
    const list = document.getElementById('small-tasks-list');
    if (list.children.length > 1) {
        button.closest('.task-input-container').remove();
    } else {
        button.previousElementSibling.value = '';
    }
}

let sessionStartTime;

function startSpecificTask(taskId) {
    const allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    const selected = allTasks.find(t => t.id === taskId);
    
    if (selected) {
        localStorage.setItem('currentActiveTask', JSON.stringify(selected));
        if (selected.totalTime === undefined) selected.totalTime = 0;
        
        document.getElementById('display-big-task').innerText = selected.bigTask;
        document.getElementById('display-small-tasks').innerText = selected.smallTasks[0] || "No more sub-tasks";

        const sessionBtn = document.querySelector('#view-step6 .Button[onclick="completeSmallTask()"]');

        if (sessionBtn) {
            if (selected.smallTasks.length <= 1) {
                sessionBtn.innerText = "Finish Session";
            } else {
                sessionBtn.innerText = "Next Step";
            }
        }

        sessionStartTime = Date.now();
        
        navigateTo('view-step6');
    }
}

function completeSmallTask() {
    let activeTask = JSON.parse(localStorage.getItem('currentActiveTask'));
    const sessionBtn = document.querySelector('#view-step6 .Button[onclick="completeSmallTask()"]');
    
    if (!activeTask || !activeTask.smallTasks) {
        navigateTo('view-step7');
        return;
    }

    activeTask.smallTasks.shift();

    const timeSpentThisSession = Date.now() - sessionStartTime;
    activeTask.totalTime = (activeTask.totalTime || 0) + timeSpentThisSession;
    sessionStartTime = Date.now();

    if (activeTask.smallTasks.length > 0) {
        localStorage.setItem('currentActiveTask', JSON.stringify(activeTask));
        
        document.getElementById('display-big-task').innerText = activeTask.bigTask;
        document.getElementById('display-small-tasks').innerText = activeTask.smallTasks[0];

        if (sessionBtn) {
            if (activeTask.smallTasks.length === 1) {
                sessionBtn.innerText = "Finish Session";
            } else {
                sessionBtn.innerText = "Next Step";
            }
        }
        
        updateMasterTaskList(activeTask);
    } else {
        const totalMinutes = Math.round(activeTask.totalTime / 60000);
        const sessionSummary = {
            actual: totalMinutes,
            estimate: activeTask.duration
        };
        localStorage.setItem('temp_last_summary', JSON.stringify(sessionSummary));

        if (sessionBtn) sessionBtn.innerText = "Next Step";

        finishMasterTask(activeTask.id);
        localStorage.removeItem('currentActiveTask');
        navigateTo('view-step7');
    }
}

function updateMasterTaskList(updatedTask) {
    let allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    const index = allTasks.findIndex(t => t.id === updatedTask.id);
    
    if (index !== -1) {
        allTasks[index] = updatedTask;
        localStorage.setItem('focusFlowTasks', JSON.stringify(allTasks));
    }
}

function finishMasterTask(taskId) {
    let allTasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
    allTasks = allTasks.filter(t => t.id !== taskId);
    localStorage.setItem('focusFlowTasks', JSON.stringify(allTasks));
}

function stopSessionEarly() {
    const activeTask = JSON.parse(localStorage.getItem('currentActiveTask'));
    
    if (activeTask) {
        const timeSpentThisSession = Date.now() - sessionStartTime;
        activeTask.totalTime = (activeTask.totalTime || 0) + timeSpentThisSession;
        localStorage.setItem('currentActiveTask', JSON.stringify(activeTask));

        updateMasterTaskList(activeTask);
    }
    
    localStorage.removeItem('currentActiveTask');
    navigateTo('view-step5');
}

function isViewValid(viewId) {
    let isValid = true;

    if (viewId === 'view-step2') {
        const bigTaskInput = document.getElementById('big-task-input');
        const dateInput = document.querySelector('input[type="date"]');
        
        const isNameValid = validateInput(bigTaskInput);

        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let isDateValid = true;
        if (!dateInput.value || selectedDate < today) {
            dateInput.classList.add('error');
            isDateValid = false;
        } else {
            dateInput.classList.remove('error');
        }
        
        isValid = isNameValid && isDateValid;
    }

    if (viewId === 'view-step3') {
        const smallTaskInputs = document.querySelectorAll('.small-task-input');
        const hasContent = Array.from(smallTaskInputs).some(input => input.value.trim() !== "");
        
        if (!hasContent) {
            smallTaskInputs[0].classList.add('error');
            isValid = false;
        } else {
            smallTaskInputs.forEach(input => input.classList.remove('error'));
        }
    }

    if (viewId === 'view-step4') {
        const timeSelect = document.getElementById('time-select');
        isValid = validateInput(timeSelect);
    }

    return isValid;
}

function validateInput(inputElement) {
    if (!inputElement.value.trim()) {
        inputElement.classList.add('error');
        return false;
    } else {
        inputElement.classList.remove('error');
        return true;
    }
}

document.addEventListener('input', (e) => {
    if (e.target.classList.contains('error')) {
        if (e.target.value.trim() !== "") {
            e.target.classList.remove('error');
        }
    }
});

function openHelp() {
  document.getElementById('help-modal').classList.remove('hidden');
}

function closeHelp() {
  document.getElementById('help-modal').classList.add('hidden');
}
