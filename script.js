// Array to store tasks
let tasks = [];
// Initial default categories
const defaultCategories = ['Work', 'Personal', 'Shopping', 'Fitness'];
let editingTaskId = null;

// DOM Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const categoryFilter = document.getElementById('categoryFilter');
const taskCategory = document.getElementById('taskCategory');
const cancelBtn = document.getElementById('cancelBtn');
//frist page view
const taskListView = document.getElementById('taskListView');
//second page view
const taskFormView = document.getElementById('taskFormView');
const submitButton = taskForm.querySelector('button[type="submit"]');

/**
 * Handles the "Add Task" button click by swapping views and resetting the form.
 * @returns {void}
 */
addTaskBtn.addEventListener('click', function() {
    taskFormView.style.display = 'block';
    taskListView.style.display = 'none';
    updateCategorySelect();
    resetEditState();
    taskForm.reset();
});

/**
 * Populates the category dropdown in the task form with all available categories.
 * @returns {void}
 */
const updateCategorySelect = () => {
    const categories = getAvailableCategories();
    taskCategory.innerHTML = '<option value="">Select category</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        taskCategory.appendChild(option);
    });
}


/**
 * Builds a unique, sorted list of categories from defaults and existing tasks.
 * @returns {string[]} Alphabetically sorted category names.
 */
const  getAvailableCategories = () =>  {
    const taskCategories = new Set(tasks.map(task => task.category));
    const allCategories = new Set([...defaultCategories, ...taskCategories]);
    return Array.from(allCategories).sort();
}



// Get task name input element
const taskNameInput = document.getElementById('taskName');
const taskNameError = document.getElementById('taskNameError');

/**
 * Validates the task name whenever the field loses focus to give instant feedback.
 * @returns {void}
 */
taskNameInput.addEventListener('blur', function() {
    const taskName = taskNameInput.value.trim();
    
    if (taskName && !validateTaskName(taskName)) {
        taskNameInput.classList.add('is-invalid');
        taskNameError.style.display = 'block';
    } else {
        taskNameInput.classList.remove('is-invalid');
        taskNameError.style.display = 'none';
    }
});

/**
 * Validates that a task name only includes letters, numbers, and spaces.
 * @param {string} taskName - The task name entered by the user.
 * @returns {boolean} True if the name matches the allowed pattern.
 */
function validateTaskName(taskName) {
    const validPattern = /^[a-zA-Z0-9\s]+$/;
    return validPattern.test(taskName);
}

// Get description input element
const taskDescriptionInput = document.getElementById('taskDescription');
const taskDescriptionError = document.getElementById('taskDescriptionError');

/**
 * Checks description input on blur so invalid characters are highlighted immediately.
 * @returns {void}
 */
taskDescriptionInput.addEventListener('blur', function() {
    const description = taskDescriptionInput.value.trim();
    
    if (description && !validateDescription(description)) {
        taskDescriptionInput.classList.add('is-invalid');
        taskDescriptionError.style.display = 'block';
    } else {
        taskDescriptionInput.classList.remove('is-invalid');
        taskDescriptionError.style.display = 'none';
    }
});

/**
 * Validates that a description contains only text, digits, spaces, and basic punctuation.
 * @param {string} description - The optional description value.
 * @returns {boolean} True when the description meets the allowed format.
 */
function validateDescription(description) {
    const validPattern = /^[a-zA-Z0-9\s\.,!?\-']+$/;
    return validPattern.test(description);
}


/**
 * Handles the cancel action by hiding the form and clearing validation states.
 * @returns {void}
 */
cancelBtn.addEventListener('click', function() {
    taskFormView.style.display = 'none';
    taskListView.style.display = 'block';
    taskForm.reset();
    taskNameInput.classList.remove('is-invalid');
    taskDescriptionInput.classList.remove('is-invalid');
    taskNameError.style.display = 'none';
    taskDescriptionError.style.display = 'none';
    resetEditState();
});

/**
 * Processes the task form submission, validating inputs and creating or updating tasks.
 * @param {SubmitEvent} e - The submit event triggered by the form.
 * @returns {void}
 */
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const taskName = document.getElementById('taskName').value.trim();
    console.log('Task Name:', taskName);
    const taskCategoryValue = document.getElementById('taskCategory').value;
    const taskPriority = document.querySelector('input[name="priority"]:checked').value;
    const taskDueDate = document.getElementById('taskDueDate').value;
    const taskDesc = document.getElementById('taskDescription').value.trim();
    
    // Validate task name
    if (!validateTaskName(taskName)) {
        taskNameInput.classList.add('is-invalid');
        taskNameError.style.display = 'block';
        return;
    }
    
    // Validate description if not empty
    if (taskDesc && !validateDescription(taskDesc)) {
        taskDescriptionInput.classList.add('is-invalid');
        taskDescriptionError.style.display = 'block';
        return;
    }
    
    if (editingTaskId) {
        const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                name: taskName,
                category: taskCategoryValue,
                priority: taskPriority,
                dueDate: taskDueDate,
                description: taskDesc
            };
        }
    } else {
        tasks.push({
            id: Date.now(),
            name: taskName,
            category: taskCategoryValue,
            priority: taskPriority,
            dueDate: taskDueDate,
            description: taskDesc,
            completed: false
        });
    }
    
    // Reset form and return to task list view
    taskForm.reset();
    taskFormView.style.display = 'none';
    taskListView.style.display = 'block';
    
    // Display tasks
    displayTasks();
    
    // Update category filter
    updateCategoryFilter();
    resetEditState();
});

/**
 * Renders the tasks list based on the current filter and due-date sorting.
 * @returns {void}
 */
function displayTasks() {
    const taskListContainer = document.getElementById('taskList');
    taskListContainer.innerHTML = '';
    
    // Filter tasks based on selected category
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredTasks = selectedCategory === 'all' 
        ? tasks 
        : tasks.filter(task => task.category === selectedCategory);
    
    // Sort tasks by due date (earliest first)
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Display each task
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskListContainer.appendChild(taskElement);
    });
}

/**
 * Builds a DOM element representing a single task row.
 * @param {Object} task - Task data to render.
 * @param {number} task.id - Unique identifier of the task.
 * @param {string} task.name - Task title.
 * @param {string} task.category - Category name.
 * @param {string} task.priority - Priority level (low|medium|high).
 * @param {string} task.dueDate - Due date string compatible with Date constructor.
 * @param {string} task.description - Optional description text.
 * @returns {HTMLDivElement} The populated task DOM node.
 */
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'list-group-item task-item';
    taskDiv.setAttribute('data-category', task.category);
    taskDiv.setAttribute('data-task-id', task.id);
    taskDiv.classList.add(`priority-${task.priority}`);
    
    // Calculate time remaining
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const timeRemaining = getTimeRemaining(dueDate);
    
    // Determine status (Overdue or time remaining)
    const isOverdue = dueDate < now;
    const status = isOverdue ? 'Overdue' : timeRemaining;
    
    taskDiv.innerHTML = `
        <div class="task-content">
            <div class="task-info">
                <span class="task-name">${task.name}</span>
                <span class="task-category">(${task.category})</span>
                <span class="task-priority">- ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                <span class="task-status ${isOverdue ? 'overdue' : ''}">${status}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-warning" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `;
    
    return taskDiv;
}

/**
 * Calculates the human-readable time remaining until a due date.
 * @param {Date} dueDate - The due date to compare with the current time.
 * @returns {string} Text describing remaining time or "Overdue" when past due.
 */
function getTimeRemaining(dueDate) {
    const now = new Date();
    const diff = dueDate - now;
    
    if (diff <= 0) {
        return 'Overdue';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

/**
 * Refreshes the category filter dropdown with the latest category list.
 * @returns {void}
 */
function updateCategoryFilter() {
    const categories = getAvailableCategories();
    const currentValue = document.getElementById('categoryFilter').value;
    document.getElementById('categoryFilter').innerHTML = '<option value="all">All</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        document.getElementById('categoryFilter').appendChild(option);
    });
    
    document.getElementById('categoryFilter').value = currentValue;
}

/**
 * Loads a task's data into the form so it can be edited.
 * @param {number} taskId - Identifier of the task to edit.
 * @returns {void}
 */
function editTask(taskId) {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (!taskToEdit) {
        return;
    }

    editingTaskId = taskId;
    submitButton.textContent = 'Save Changes';
    taskFormView.style.display = 'block';
    taskListView.style.display = 'none';
    updateCategorySelect();

    taskNameInput.value = taskToEdit.name;
    taskCategory.value = taskToEdit.category;
    const priorityInput = document.querySelector(`input[name="priority"][value="${taskToEdit.priority}"]`);
    if (priorityInput) {
        priorityInput.checked = true;
    }
    document.getElementById('taskDueDate').value = taskToEdit.dueDate;
    taskDescriptionInput.value = taskToEdit.description;
}

/**
 * Removes a task from the tasks collection and refreshes the UI.
 * @param {number} taskId - Identifier of the task to delete.
 * @returns {void}
 */
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    displayTasks();
}

/**
 * Clears the edit mode indicators and restores the default submit button text.
 * @returns {void}
 */
function resetEditState() {
    editingTaskId = null;
    submitButton.textContent = 'Add Task';
}



/**
 * Bootstraps initial UI bindings once the DOM is ready.
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filter dropdown
    // updateCategoryFilter();
    
    // Add category filter event listener
    document.getElementById('categoryFilter').addEventListener('change', displayTasks);
});


