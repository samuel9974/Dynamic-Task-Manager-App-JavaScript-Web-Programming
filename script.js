// Task Manager - Add Task Function Only
// Array to store tasks
let tasks = [];

// DOM Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const categoryFilter = document.getElementById('categoryFilter');
const taskCategory = document.getElementById('taskCategory');


const cancelBtn = document.getElementById('cancelBtn');
const taskListView = document.getElementById('taskListView');
const taskFormView = document.getElementById('taskFormView');

// Initial default categories
const defaultCategories = ['Work', 'Personal', 'Shopping', 'Fitness'];


// Show Add Task Form
addTaskBtn.addEventListener('click', function() {
    taskListView.style.display = 'none';
    taskFormView.style.display = 'block';
    updateCategorySelect();
    taskForm.reset();
});

// Update category options in form select
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


const  getAvailableCategories = () =>  {
    const taskCategories = new Set(tasks.map(task => task.category));
    const allCategories = new Set([...defaultCategories, ...taskCategories]);
    return Array.from(allCategories).sort();
}



// Get task name input element
const taskNameInput = document.getElementById('taskName');
const taskNameError = document.getElementById('taskNameError');

// Validate task name on blur (when user leaves the field)
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

// Validation function for task name
function validateTaskName(taskName) {
    // Only allow letters, numbers, and spaces
    const validPattern = /^[a-zA-Z0-9\s]+$/;
    return validPattern.test(taskName);
}

// Get description input element
const taskDescriptionInput = document.getElementById('taskDescription');
const taskDescriptionError = document.getElementById('taskDescriptionError');

// Validate description on blur (when user leaves the field)
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

// Validation function for description
function validateDescription(description) {
    // Only allow letters, numbers, spaces, and basic punctuation (.,!?-')
    const validPattern = /^[a-zA-Z0-9\s\.,!?\-']+$/;
    return validPattern.test(description);
}






// Initialize categories on page load
document.addEventListener('DOMContentLoaded', function() {
    // Don't initialize filter on page load
});


