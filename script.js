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

const TasksModule = (() => {
  // Task Data Storage
  let tasks = [];
  const defaultCategories = ["Work", "Personal", "Shopping", "Fitness"];

  // Application State
  let editingTaskId = null;
  let sortAscending = true;

  /**
   * Gets the current editing task ID.
   */
  function getEditingTaskId() {
    return editingTaskId;
  }

  /**
   * Sets the editing task ID.
   */
  function setEditingTaskId(id) {
    editingTaskId = id;
  }

  /**
   * Gets the current sort order.
   */
  function getSortAscending() {
    return sortAscending;
  }

  /**
   * Toggles the sort order.
   */
  function toggleSortAscending() {
    sortAscending = !sortAscending;
    return sortAscending;
  }

  /**
   * Builds a unique, sorted list of categories from defaults and existing tasks.
   */
  function getAvailableCategories() {
    const normalizedDefaults = defaultCategories.map((cat) =>
      cat.toLowerCase()
    );
    const taskCategories = tasks.map((task) => task.category.toLowerCase());
    const allCategories = new Set([...normalizedDefaults, ...taskCategories]);
    console.log("All Categories:", allCategories);
    return Array.from(allCategories).sort();
  }

  /**
   * Checks if a task name already exists (case-insensitive).
   */
  function isTaskNameDuplicate(taskName, excludeTaskId = null) {
    const normalizedName = taskName.toLowerCase();
    return tasks.some(
      (task) =>
        task.name.toLowerCase() === normalizedName && task.id !== excludeTaskId
    );
  }

  /**
   * Validates that a task name only includes letters, numbers, and spaces.
   */
  function validateTaskName(taskName) {
    const validPattern = /^[a-zA-Z0-9\s]+$/;
    return validPattern.test(taskName);
  }

  /**
   * Validates that a description contains only text, digits, spaces, and basic punctuation.
   */
  function validateDescription(description) {
    const validPattern = /^[a-zA-Z0-9\s\.,!?\-']+$/;
    return validPattern.test(description);
  }

  /**
   * Adds a new task to the tasks array.
   */
  function addTask(name, category, priority, dueDate, description) {
    tasks.push({
      id: Date.now(),
      name: name,
      category: category,
      priority: priority,
      dueDate: dueDate,
      description: description,
      completed: false,
    });
  }

  /**
   * Updates an existing task in the tasks array.
   */
  function updateTask(taskId, name, category, priority, dueDate, description) {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        name: name,
        category: category,
        priority: priority,
        dueDate: dueDate,
        description: description,
      };
    }
  }

  /**
   * Removes a task from the tasks array.
   */
  function removeTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
  }

  /**
   * Gets a task by its ID.
   */
  function getTaskById(taskId) {
    return tasks.find((task) => task.id === taskId);
  }

  /**
   * Gets filtered and sorted tasks based on current settings.
   */
  function getFilteredTasks(categoryFilter) {
    let filteredTasks =
      categoryFilter === "all"
        ? [...tasks]
        : tasks.filter((task) => task.category === categoryFilter);

    filteredTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortAscending ? dateA - dateB : dateB - dateA;
    });

    return filteredTasks;
  }

  /**
   * Calculates the human-readable time remaining until a due date.
   */
  function getTimeRemaining(dueDate) {
    const now = new Date();
    const diff = dueDate - now;

    if (diff <= 0) {
      return "Overdue";
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
   */
  function isTaskOverdue(dueDate) {
    return new Date(dueDate) < new Date();
  }

  // Return public API
  return {
    getEditingTaskId,
    setEditingTaskId,
    getSortAscending,
    toggleSortAscending,
    getAvailableCategories,
    isTaskNameDuplicate,
    validateTaskName,
    validateDescription,
    addTask,
    updateTask,
    removeTask,
    getTaskById,
    getFilteredTasks,
    getTimeRemaining,
    isTaskOverdue,
  };
})();

/* ============================================================
   DOM MODULE
   Handles all DOM manipulations and updates
   ============================================================ */

const DomModule = (() => {
  // DOM Element References
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskForm = document.getElementById("taskForm");
  const categoryFilter = document.getElementById("categoryFilter");
  const taskCategory = document.getElementById("taskCategory");
  const cancelBtn = document.getElementById("cancelBtn");
  const taskListView = document.getElementById("taskListView");
  const taskFormView = document.getElementById("taskFormView");
  const submitButton = taskForm.querySelector('button[type="submit"]');
  const sortByDueDateBtn = document.getElementById("sortByDueDate");
  const taskNameInput = document.getElementById("taskName");
  const taskDescriptionInput = document.getElementById("taskDescription");

  // Error Message Elements
  const taskNameEmptyError = document.getElementById("taskNameEmptyError");
  const taskNamePatternError = document.getElementById("taskNamePatternError");
  const taskNameDuplicateError = document.getElementById(
    "taskNameDuplicateError"
  );
  const taskDescriptionError = document.getElementById("taskDescriptionError");

  /**
   * Capitalizes the first letter of a string.
   */
  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Shows the task form view and hides the task list view.
   */
  function showTaskFormView() {
    taskFormView.style.display = "block";
    taskListView.style.display = "none";
  }

  /**
   * Shows the task list view and hides the task form view.
   */
  function showTaskListView() {
    taskFormView.style.display = "none";
    taskListView.style.display = "block";
  }

  /**
   * Populates the category dropdown in the task form.
   */
  function updateCategorySelect() {
    const categories = TasksModule.getAvailableCategories();
    console.log("Available Categories:", categories);
    taskCategory.innerHTML = '<option value="">Select category</option>';

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = capitalizeFirst(category);
      taskCategory.appendChild(option);
    });
  }

  /**
   * Refreshes the category filter dropdown.
   */
  function updateCategoryFilter() {
    const categories = TasksModule.getAvailableCategories();
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All</option>';

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = capitalizeFirst(category);
      categoryFilter.appendChild(option);
    });

    categoryFilter.value = currentValue;
  }

  /**
   * Hides all task name error messages.
   */
  function hideTaskNameErrors() {
    taskNameEmptyError.style.display = "none";
    taskNamePatternError.style.display = "none";
    taskNameDuplicateError.style.display = "none";
    taskNameInput.classList.remove("is-invalid");
  }

  /**
   * Shows the empty task name error.
   */
  function showEmptyNameError() {
    taskNameInput.classList.add("is-invalid");
    taskNameEmptyError.style.display = "block";
    taskNamePatternError.style.display = "none";
    taskNameDuplicateError.style.display = "none";
  }

  /**
   * Shows the invalid pattern error for task name.
   */
  function showPatternNameError() {
    taskNameInput.classList.add("is-invalid");
    taskNameEmptyError.style.display = "none";
    taskNamePatternError.style.display = "block";
    taskNameDuplicateError.style.display = "none";
  }

  /**
   * Shows the duplicate name error.
   */
  function showDuplicateNameError() {
    taskNameInput.classList.add("is-invalid");
    taskNameEmptyError.style.display = "none";
    taskNamePatternError.style.display = "none";
    taskNameDuplicateError.style.display = "block";
  }

  /**
   * Shows description validation error.
   */
  function showDescriptionError() {
    taskDescriptionInput.classList.add("is-invalid");
    taskDescriptionError.style.display = "block";
  }

  /**
   * Hides description validation error.
   */
  function hideDescriptionError() {
    taskDescriptionInput.classList.remove("is-invalid");
    taskDescriptionError.style.display = "none";
  }

  /**
   * Clears all form validation states.
   */
  function clearFormValidation() {
    taskNameInput.classList.remove("is-invalid");
    taskDescriptionInput.classList.remove("is-invalid");
    taskNameEmptyError.style.display = "none";
    taskNamePatternError.style.display = "none";
    taskNameDuplicateError.style.display = "none";
    taskDescriptionError.style.display = "none";
  }

  /**
   * Updates the submit button text.
   */
  function setSubmitButtonText(text) {
    submitButton.textContent = text;
  }

  /**
   * Updates the sort button text based on current sort order.
   */
  function updateSortButtonText() {
    sortByDueDateBtn.textContent = TasksModule.getSortAscending()
      ? "Sort by Due Time: Ascending"
      : "Sort by Due Time: Descending";
  }

  /**
   * Populates the form with task data for editing.
   */
  function populateFormWithTask(task) {
    taskNameInput.value = task.name;
    taskCategory.value = task.category;
    const priorityInput = document.querySelector(
      `input[name="priority"][value="${task.priority}"]`
    );
    if (priorityInput) {
      priorityInput.checked = true;
    }
    document.getElementById("taskDueDate").value = task.dueDate;
    taskDescriptionInput.value = task.description;
  }

  /**
   * Builds a DOM element representing a single task row.
   */
  function createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = "list-group-item task-item";
    taskDiv.setAttribute("data-category", task.category);
    taskDiv.setAttribute("data-task-id", task.id);
    taskDiv.classList.add(`priority-${task.priority}`);

    const dueDate = new Date(task.dueDate);
    const timeRemaining = TasksModule.getTimeRemaining(dueDate);
    const isOverdue = TasksModule.isTaskOverdue(task.dueDate);
    const status = isOverdue ? "Overdue" : timeRemaining;

    if (isOverdue) {
      taskDiv.classList.add("overdue-task");
    }

    taskDiv.innerHTML = `
    <div class="task-content d-flex justify-content-between align-items-center p-3 border rounded mb-2">
        <div class="task-info d-flex gap-2 align-items-center flex-wrap">
            <span class="fw-bold">${task.name}</span>
            <span class="text-muted">(${capitalizeFirst(task.category)})</span>
            <span class="text-primary">- ${capitalizeFirst(
              task.priority
            )} Priority</span>
            <span class="task-status ${
              isOverdue ? "text-danger" : "text-success"
            }">${status}</span>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-warning" onclick="UiModule.editTask(${
              task.id
            })">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="UiModule.deleteTask(${
              task.id
            })">Delete</button>
        </div>
    </div>`;
    return taskDiv;
  }

  /**
   * Renders the tasks list based on the current filter and due-date sorting.
   */
  function displayTasks() {
    const taskListContainer = document.getElementById("taskList");
    taskListContainer.innerHTML = "";

    const selectedCategory = categoryFilter.value;
    console.log("selectedCategory:", selectedCategory);
    const filteredTasks = TasksModule.getFilteredTasks(selectedCategory);

    filteredTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskListContainer.appendChild(taskElement);
    });

    refreshTaskStatuses();
  }

  /**
   * Updates the status display for all visible tasks.
   */
  function refreshTaskStatuses() {
    const taskItems = document.querySelectorAll("#taskList .task-item");
    console.log("Refreshing task statuses for", taskItems.length, "tasks.");

    taskItems.forEach((taskItem) => {
      const taskId = Number(taskItem.getAttribute("data-task-id"));
      const taskData = TasksModule.getTaskById(taskId);
      if (!taskData) {
        return;
      }

      const isOverdue = TasksModule.isTaskOverdue(taskData.dueDate);
      const statusText = isOverdue
        ? "Overdue"
        : TasksModule.getTimeRemaining(new Date(taskData.dueDate));

      const statusElement = taskItem.querySelector(".task-status");
      if (statusElement) {
        statusElement.textContent = statusText;
        statusElement.classList.toggle("text-danger", isOverdue);
        statusElement.classList.toggle("text-success", !isOverdue);
      }
      taskItem.classList.toggle("overdue-task", isOverdue);
    });
  }

  /**
   * Gets form values.
   */
  function getFormValues() {
    return {
      taskName: taskNameInput.value.trim(),
      taskCategory: taskCategory.value,
      taskPriority: document.querySelector('input[name="priority"]:checked')
        .value,
      taskDueDate: document.getElementById("taskDueDate").value,
      taskDesc: taskDescriptionInput.value.trim(),
    };
  }

  /**
   * Resets the form.
   */
  function resetForm() {
    taskForm.reset();
  }

  // Return public API
  return {
    addTaskBtn,
    taskForm,
    categoryFilter,
    taskNameInput,
    taskDescriptionInput,
    sortByDueDateBtn,
    cancelBtn,
    showTaskFormView,
    showTaskListView,
    updateCategorySelect,
    updateCategoryFilter,
    hideTaskNameErrors,
    showEmptyNameError,
    showPatternNameError,
    showDuplicateNameError,
    showDescriptionError,
    hideDescriptionError,
    clearFormValidation,
    setSubmitButtonText,
    updateSortButtonText,
    populateFormWithTask,
    displayTasks,
    refreshTaskStatuses,
    getFormValues,
    resetForm,
  };
})();

/* ============================================================
   UI MODULE
   Manages user interactions and coordinates between modules
   ============================================================ */

const UiModule = (() => {
  let countdownIntervalId = null;

  /**
   * Resets the editing state to default (adding mode).
   */
  function resetEditState() {
    TasksModule.setEditingTaskId(null);
    DomModule.setSubmitButtonText("Add Task");
  }

  /**
   * Handles the "Add Task" button click.
   */
  function handleAddTaskClick() {
    DomModule.showTaskFormView();
    DomModule.updateCategorySelect();
    resetEditState();
    DomModule.resetForm();
  }

  /**
   * Handles the cancel button click.
   */
  function handleCancelClick() {
    DomModule.showTaskListView();
    DomModule.resetForm();
    DomModule.clearFormValidation();
    resetEditState();
  }

  /**
   * Validates task name on blur for immediate feedback.
   */
  function handleTaskNameBlur() {
    const taskName = DomModule.taskNameInput.value.trim();
    DomModule.hideTaskNameErrors();

    if (taskName === "") {
      // Empty - don't show error on initial blur
    } else if (!TasksModule.validateTaskName(taskName)) {
      DomModule.showPatternNameError();
    } else if (
      TasksModule.isTaskNameDuplicate(taskName, TasksModule.getEditingTaskId())
    ) {
      DomModule.showDuplicateNameError();
    }
  }

  /**
   * Validates description on blur for immediate feedback.
   */
  function handleDescriptionBlur() {
    const description = DomModule.taskDescriptionInput.value.trim();

    if (description && !TasksModule.validateDescription(description)) {
      DomModule.showDescriptionError();
    } else {
      DomModule.hideDescriptionError();
    }
  }

  /**
   * Handles form submission.
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    const { taskName, taskCategory, taskPriority, taskDueDate, taskDesc } =
      DomModule.getFormValues();
    const editingTaskId = TasksModule.getEditingTaskId();

    // Validate task name - check empty first
    if (taskName === "") {
      DomModule.showEmptyNameError();
      return;
    }

    // Then check pattern
    if (!TasksModule.validateTaskName(taskName)) {
      DomModule.showPatternNameError();
      return;
    }

    // Check for duplicate task name
    if (TasksModule.isTaskNameDuplicate(taskName, editingTaskId)) {
      DomModule.showDuplicateNameError();
      return;
    }

    // Validate description if not empty
    if (taskDesc && !TasksModule.validateDescription(taskDesc)) {
      DomModule.showDescriptionError();
      return;
    }

    // Create or update task
    if (editingTaskId) {
      TasksModule.updateTask(
        editingTaskId,
        taskName,
        taskCategory,
        taskPriority,
        taskDueDate,
        taskDesc
      );
    } else {
      TasksModule.addTask(
        taskName,
        taskCategory,
        taskPriority,
        taskDueDate,
        taskDesc
      );
    }

    // Reset form and return to task list view
    DomModule.resetForm();
    DomModule.showTaskListView();
    DomModule.displayTasks();
    DomModule.updateCategoryFilter();
    resetEditState();
  }

  /**
   * Loads a task's data into the form for editing.
   */
  function editTask(taskId) {
    const taskToEdit = TasksModule.getTaskById(taskId);
    if (!taskToEdit) {
      return;
    }

    TasksModule.setEditingTaskId(taskId);
    DomModule.setSubmitButtonText("Save Changes");
    DomModule.showTaskFormView();
    DomModule.updateCategorySelect();
    DomModule.populateFormWithTask(taskToEdit);
  }

  /**
   * Removes a task and refreshes the display.
   */
  function deleteTask(taskId) {
    TasksModule.removeTask(taskId);
    DomModule.displayTasks();
  }

  /**
   * Toggles the sort order and refreshes the display.
   */
  function toggleSortOrder() {
    TasksModule.toggleSortAscending();
    DomModule.updateSortButtonText();
    DomModule.displayTasks();
  }

  /**
   * Starts the countdown refresh interval.
   */
  function startCountdownRefresh() {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }

    countdownIntervalId = setInterval(function () {
      DomModule.refreshTaskStatuses();
    }, 60000);

    DomModule.refreshTaskStatuses();
  }

  /**
   * Initializes the application.
   */
  function initializeApp() {
    DomModule.displayTasks();
    startCountdownRefresh();

    // Set up event listeners
    DomModule.addTaskBtn.addEventListener("click", handleAddTaskClick);
    DomModule.cancelBtn.addEventListener("click", handleCancelClick);
    DomModule.taskForm.addEventListener("submit", handleFormSubmit);
    DomModule.taskNameInput.addEventListener("blur", handleTaskNameBlur);
    DomModule.taskDescriptionInput.addEventListener(
      "blur",
      handleDescriptionBlur
    );
    DomModule.categoryFilter.addEventListener("change", DomModule.displayTasks);
    DomModule.sortByDueDateBtn.addEventListener("click", toggleSortOrder);
  }

  // Return public API
  return {
    editTask,
    deleteTask,
    initializeApp,
  };
})();

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", UiModule.initializeApp);
