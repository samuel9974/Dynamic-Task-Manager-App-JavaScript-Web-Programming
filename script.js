/* ============================================================
   TASK MANAGER APPLICATION
   Organized into modules:
   1. TASKS MODULE - Data management and business logic
   2. DOM MODULE - All DOM manipulations and updates
   3. UI MODULE - User interactions and event coordination
   ============================================================ */


/* ============================================================
   TASKS MODULE
   Handles task data, validation, and business logic
   ============================================================ */

// Task Data Storage
let tasks = [];
const defaultCategories = ['Work', 'Personal', 'Shopping', 'Fitness'];

// Application State
let editingTaskId = null;
let countdownIntervalId = null;
let sortAscending = true; // true = Ascending (earliest first), false = Descending (latest first)

/**
 * Builds a unique, sorted list of categories from defaults and existing tasks.
 * @returns {string[]} Alphabetically sorted category names.
 */
function getAvailableCategories() {
    const taskCategories = new Set(tasks.map(task => task.category));
    const allCategories = new Set([...defaultCategories, ...taskCategories]);
    console.log('All Categories:', allCategories);
    return Array.from(allCategories).sort();
}

/**
 * Checks if a task name already exists (case-insensitive).
 * @param {string} taskName - The task name to check.
 * @param {number|null} excludeTaskId - Task ID to exclude (for editing).
 * @returns {boolean} True if duplicate exists.
 */
function isTaskNameDuplicate(taskName, excludeTaskId = null) {
    const normalizedName = taskName.toLowerCase();
    return tasks.some(task =>
        task.name.toLowerCase() === normalizedName && task.id !== excludeTaskId
    );
}

/**
 * Validates that a task name only includes letters, numbers, and spaces.
 * @param {string} taskName - The task name entered by the user.
 * @returns {boolean} True if the name matches the allowed pattern.
 */
function validateTaskName(taskName) {
    const validPattern = /^[a-zA-Z0-9\s]+$/;
    return validPattern.test(taskName);
}

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
 * Adds a new task to the tasks array.
 * @param {string} name - Task name.
 * @param {string} category - Task category.
 * @param {string} priority - Task priority (low|medium|high).
 * @param {string} dueDate - Task due date.
 * @param {string} description - Task description.
 */
function addTask(name, category, priority, dueDate, description) {
    tasks.push({
        id: Date.now(),
        name: name,
        category: category,
        priority: priority,
        dueDate: dueDate,
        description: description,
        completed: false
    });
}

/**
 * Updates an existing task in the tasks array.
 * @param {number} taskId - ID of task to update.
 * @param {string} name - New task name.
 * @param {string} category - New task category.
 * @param {string} priority - New task priority.
 * @param {string} dueDate - New task due date.
 * @param {string} description - New task description.
 */
function updateTask(taskId, name, category, priority, dueDate, description) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            name: name,
            category: category,
            priority: priority,
            dueDate: dueDate,
            description: description
        };
    }
}

/**
 * Removes a task from the tasks array.
 * @param {number} taskId - ID of task to remove.
 */
function removeTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
}

/**
 * Gets a task by its ID.
 * @param {number} taskId - ID of task to find.
 * @returns {Object|undefined} The task object or undefined.
 */
function getTaskById(taskId) {
    return tasks.find(task => task.id === taskId);
}

/**
 * Gets filtered and sorted tasks based on current settings.
 * @param {string} categoryFilter - Category to filter by ('all' for no filter).
 * @returns {Array} Filtered and sorted tasks array.
 */
function getFilteredTasks(categoryFilter) {
    let filteredTasks = categoryFilter === 'all'
        ? [...tasks]
        : tasks.filter(task => task.category === categoryFilter);

    // Sort tasks by due date based on current sort order
    filteredTasks.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return sortAscending ? dateA - dateB : dateB - dateA;
    });

    return filteredTasks;
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
 * Checks if a task is overdue.
 * @param {string} dueDate - The due date string.
 * @returns {boolean} True if overdue.
 */
function isTaskOverdue(dueDate) {
    return new Date(dueDate) < new Date();
}


/* ============================================================
   DOM MODULE
   Handles all DOM manipulations and updates
   ============================================================ */

// DOM Element References
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const categoryFilter = document.getElementById('categoryFilter');
const taskCategory = document.getElementById('taskCategory');
const cancelBtn = document.getElementById('cancelBtn');
const taskListView = document.getElementById('taskListView');
const taskFormView = document.getElementById('taskFormView');
const submitButton = taskForm.querySelector('button[type="submit"]');
const sortByDueDateBtn = document.getElementById('sortByDueDate');
const taskNameInput = document.getElementById('taskName');
const taskDescriptionInput = document.getElementById('taskDescription');

// Error Message Elements
const taskNameEmptyError = document.getElementById('taskNameEmptyError');
const taskNamePatternError = document.getElementById('taskNamePatternError');
const taskNameDuplicateError = document.getElementById('taskNameDuplicateError');
const taskDescriptionError = document.getElementById('taskDescriptionError');

/**
 * Shows the task form view and hides the task list view.
 */
function showTaskFormView() {
    taskFormView.style.display = 'block';
    taskListView.style.display = 'none';
}

/**
 * Shows the task list view and hides the task form view.
 */
function showTaskListView() {
    taskFormView.style.display = 'none';
    taskListView.style.display = 'block';
}

/**
 * Populates the category dropdown in the task form with all available categories.
 */
function updateCategorySelect() {
    const categories = getAvailableCategories();
    console.log('Available Categories:', categories);
    taskCategory.innerHTML = '<option value="">Select category</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        taskCategory.appendChild(option);
    });
}

/**
 * Refreshes the category filter dropdown with the latest category list.
 */
function updateCategoryFilter() {
    const categories = getAvailableCategories();
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = currentValue;
}

/**
 * Hides all task name error messages.
 */
function hideTaskNameErrors() {
    taskNameEmptyError.style.display = 'none';
    taskNamePatternError.style.display = 'none';
    taskNameDuplicateError.style.display = 'none';
    taskNameInput.classList.remove('is-invalid');
}

/**
 * Shows the empty task name error.
 */
function showEmptyNameError() {
    taskNameInput.classList.add('is-invalid');
    taskNameEmptyError.style.display = 'block';
    taskNamePatternError.style.display = 'none';
    taskNameDuplicateError.style.display = 'none';
}

/**
 * Shows the invalid pattern error for task name.
 */
function showPatternNameError() {
    taskNameInput.classList.add('is-invalid');
    taskNameEmptyError.style.display = 'none';
    taskNamePatternError.style.display = 'block';
    taskNameDuplicateError.style.display = 'none';
}

/**
 * Shows the duplicate name error.
 */
function showDuplicateNameError() {
    taskNameInput.classList.add('is-invalid');
    taskNameEmptyError.style.display = 'none';
    taskNamePatternError.style.display = 'none';
    taskNameDuplicateError.style.display = 'block';
}

/**
 * Shows description validation error.
 */
function showDescriptionError() {
    taskDescriptionInput.classList.add('is-invalid');
    taskDescriptionError.style.display = 'block';
}

/**
 * Hides description validation error.
 */
function hideDescriptionError() {
    taskDescriptionInput.classList.remove('is-invalid');
    taskDescriptionError.style.display = 'none';
}

/**
 * Clears all form validation states.
 */
function clearFormValidation() {
    taskNameInput.classList.remove('is-invalid');
    taskDescriptionInput.classList.remove('is-invalid');
    taskNameEmptyError.style.display = 'none';
    taskNamePatternError.style.display = 'none';
    taskNameDuplicateError.style.display = 'none';
    taskDescriptionError.style.display = 'none';
}

/**
 * Updates the submit button text.
 * @param {string} text - The button text to display.
 */
function setSubmitButtonText(text) {
    submitButton.textContent = text;
}

/**
 * Updates the sort button text based on current sort order.
 */
function updateSortButtonText() {
    sortByDueDateBtn.textContent = sortAscending
        ? 'Sort by Due Time: Ascending'
        : 'Sort by Due Time: Descending';
}

/**
 * Populates the form with task data for editing.
 * @param {Object} task - The task data to populate.
 */
function populateFormWithTask(task) {
    taskNameInput.value = task.name;
    taskCategory.value = task.category;
    const priorityInput = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
    if (priorityInput) {
        priorityInput.checked = true;
    }
    document.getElementById('taskDueDate').value = task.dueDate;
    taskDescriptionInput.value = task.description;
}

/**
 * Builds a DOM element representing a single task row.
 * @param {Object} task - Task data to render.
 * @returns {HTMLDivElement} The populated task DOM node.
 */
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'list-group-item task-item';
    taskDiv.setAttribute('data-category', task.category);
    taskDiv.setAttribute('data-task-id', task.id);
    taskDiv.classList.add(`priority-${task.priority}`);

    // Calculate time remaining
    const dueDate = new Date(task.dueDate);
    const timeRemaining = getTimeRemaining(dueDate);
    const isOverdue = isTaskOverdue(task.dueDate);
    const status = isOverdue ? 'Overdue' : timeRemaining;

    if (isOverdue) {
        taskDiv.classList.add('overdue-task');
    }

    taskDiv.innerHTML = `
    <div class="task-content d-flex justify-content-between align-items-center p-3 border rounded mb-2">
    
        <!-- Left side: task info -->
        <div class="task-info d-flex gap-2 align-items-center flex-wrap">

            <span class="fw-bold">${task.name}</span>
            <span class="text-muted">(${task.category})</span>

            <span class="text-primary">
                - ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>

            <span class="task-status ${isOverdue ? 'text-danger' : 'text-success'}">
                ${status}
            </span>
        </div>

        <!-- Right side: actions -->
        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-warning" onclick="editTask(${task.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
        </div>

    </div> `;
    return taskDiv;
}

/**
 * Renders the tasks list based on the current filter and due-date sorting.
 */
function displayTasks() {
    const taskListContainer = document.getElementById('taskList');
    taskListContainer.innerHTML = '';

    const selectedCategory = categoryFilter.value;
    console.log('selectedCategory:', selectedCategory);
    const filteredTasks = getFilteredTasks(selectedCategory);

    // Display each task
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskListContainer.appendChild(taskElement);
    });

    refreshTaskStatuses();
}

/**
 * Updates the status display for all visible tasks (countdown refresh).
 */
function refreshTaskStatuses() {
    const taskItems = document.querySelectorAll('#taskList .task-item');
    console.log('Refreshing task statuses for', taskItems.length, 'tasks.');

    taskItems.forEach(taskItem => {
        const taskId = Number(taskItem.getAttribute('data-task-id'));
        const taskData = getTaskById(taskId);
        if (!taskData) {
            return;
        }

        const isOverdue = isTaskOverdue(taskData.dueDate);
        const statusText = isOverdue ? 'Overdue' : getTimeRemaining(new Date(taskData.dueDate));

        const statusElement = taskItem.querySelector('.task-status');
        if (statusElement) {
            statusElement.textContent = statusText;
            statusElement.classList.toggle('text-danger', isOverdue);
            statusElement.classList.toggle('text-success', !isOverdue);
        }
        taskItem.classList.toggle('overdue-task', isOverdue);
    });
}


/* ============================================================
   UI MODULE
   Manages user interactions and coordinates between modules
   ============================================================ */

/**
 * Resets the editing state to default (adding mode).
 */
function resetEditState() {
    editingTaskId = null;
    setSubmitButtonText('Add Task');
}

/**
 * Handles the "Add Task" button click - opens form for new task.
 */
function handleAddTaskClick() {
    showTaskFormView();
    updateCategorySelect();
    resetEditState();
    taskForm.reset();
}

/**
 * Handles the cancel button click - returns to task list.
 */
function handleCancelClick() {
    showTaskListView();
    taskForm.reset();
    clearFormValidation();
    resetEditState();
}

/**
 * Validates task name on blur for immediate feedback.
 */
function handleTaskNameBlur() {
    const taskName = taskNameInput.value.trim();

    // Hide all error messages first
    hideTaskNameErrors();

    if (taskName === '') {
        // Empty - don't show error on initial blur with empty field
    } else if (!validateTaskName(taskName)) {
        // Has content but invalid pattern
        showPatternNameError();
    } else if (isTaskNameDuplicate(taskName, editingTaskId)) {
        // Check for duplicate name
        showDuplicateNameError();
    }
}

/**
 * Validates description on blur for immediate feedback.
 */
function handleDescriptionBlur() {
    const description = taskDescriptionInput.value.trim();

    if (description && !validateDescription(description)) {
        showDescriptionError();
    } else {
        hideDescriptionError();
    }
}

/**
 * Handles form submission - validates and creates/updates task.
 * @param {SubmitEvent} e - The submit event.
 */
function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const taskName = taskNameInput.value.trim();

    const taskCategoryValue = taskCategory.value;
    const taskPriority = document.querySelector('input[name="priority"]:checked').value;
    const taskDueDate = document.getElementById('taskDueDate').value;
    const taskDesc = taskDescriptionInput.value.trim();

    // Validate task name - check empty first
    if (taskName === '') {
        showEmptyNameError();
        return;
    }

    // Then check pattern
    if (!validateTaskName(taskName)) {
        showPatternNameError();
        return;
    }

    // Check for duplicate task name
    if (isTaskNameDuplicate(taskName, editingTaskId)) {
        showDuplicateNameError();
        return;
    }

    // Validate description if not empty
    if (taskDesc && !validateDescription(taskDesc)) {
        showDescriptionError();
        return;
    }

    // Create or update task
    if (editingTaskId) {
        updateTask(editingTaskId, taskName, taskCategoryValue, taskPriority, taskDueDate, taskDesc);
    } else {
        addTask(taskName, taskCategoryValue, taskPriority, taskDueDate, taskDesc);
    }

    // Reset form and return to task list view
    taskForm.reset();
    showTaskListView();
    displayTasks();
    updateCategoryFilter();
    resetEditState();
}

/**
 * Loads a task's data into the form so it can be edited.
 * @param {number} taskId - Identifier of the task to edit.
 */
function editTask(taskId) {
    const taskToEdit = getTaskById(taskId);
    if (!taskToEdit) {
        return;
    }

    editingTaskId = taskId;
    setSubmitButtonText('Save Changes');
    showTaskFormView();
    updateCategorySelect();
    populateFormWithTask(taskToEdit);
}

/**
 * Removes a task and refreshes the display.
 * @param {number} taskId - Identifier of the task to delete.
 */
function deleteTask(taskId) {
    removeTask(taskId);
    displayTasks();
}

/**
 * Toggles the sort order and refreshes the display.
 */
function toggleSortOrder() {
    sortAscending = !sortAscending;
    updateSortButtonText();
    displayTasks();
}

/**
 * Starts the countdown refresh interval.
 */
function startCountdownRefresh() {
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
    }

    countdownIntervalId = setInterval(function () {
        refreshTaskStatuses();
    }, 60000);

    refreshTaskStatuses();
}

/**
 * Initializes the application - sets up event listeners and initial display.
 */
function initializeApp() {
    // Display initial state
    displayTasks();
    startCountdownRefresh();

    // Set up event listeners
    addTaskBtn.addEventListener('click', handleAddTaskClick);
    cancelBtn.addEventListener('click', handleCancelClick);
    taskForm.addEventListener('submit', handleFormSubmit);
    taskNameInput.addEventListener('blur', handleTaskNameBlur);
    taskDescriptionInput.addEventListener('blur', handleDescriptionBlur);
    categoryFilter.addEventListener('change', displayTasks);
    sortByDueDateBtn.addEventListener('click', toggleSortOrder);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
