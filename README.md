# Dynamic Task Manager Application

A dynamic, client-side task management web application built with vanilla JavaScript, following the **Module Pattern** architecture for clean separation of concerns.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Code Documentation](#code-documentation)
- [Future Enhancements](#future-enhancements)
- [Author](#author)

---

## 🎯 Overview

This Task Manager is a **Single Page Application (SPA)** that allows users to efficiently manage their daily tasks. The application demonstrates advanced JavaScript concepts including:

- **Module Pattern (IIFE)** for encapsulation and code organization
- **DOM Manipulation** for dynamic UI updates
- **Event-Driven Architecture** for user interactions
- **Real-time Updates** with countdown timers using `setInterval`
- **Form Validation** with immediate user feedback

---

## ✨ Features

### Task Management

| Feature             | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| ➕ **Create Tasks** | Add new tasks with name, category, priority, due date, and description |
| ✏️ **Edit Tasks**   | Modify existing tasks while preserving their ID                        |
| 🗑️ **Delete Tasks** | Remove tasks from the list                                             |
| 📋 **View Tasks**   | Display all tasks in a clean, organized list                           |

### Categories & Filtering

| Feature                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| 🏷️ **Default Categories** | Work, Personal, Shopping, Fitness                  |
| 🔍 **Filter by Category** | Show tasks from specific categories only           |
| 🔤 **Case-Insensitive**   | "Work" and "work" are treated as the same category |

### Priority System

| Priority      | Visual Indicator   |
| ------------- | ------------------ |
| 🟢 **Low**    | Green left border  |
| 🟡 **Medium** | Yellow left border |
| 🔴 **High**   | Red left border    |

### Time Management

| Feature                  | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| ⏰ **Due Date & Time**   | Set specific deadline for each task                         |
| ⏱️ **Countdown Timer**   | Real-time display of remaining time (days, hours, minutes)  |
| 🔴 **Overdue Detection** | Automatic highlighting of overdue tasks with red background |
| 🔄 **Auto-Refresh**      | Status updates every 60 seconds                             |

### Sorting

| Feature                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| 📅 **Sort by Due Date** | Toggle between ascending and descending order |

### Validation

| Validation Type           | Rule                                                   |
| ------------------------- | ------------------------------------------------------ |
| 📝 **Task Name**          | Required, alphanumeric + spaces only                   |
| 🚫 **Duplicate Check**    | Prevents tasks with identical names (case-insensitive) |
| 📄 **Description**        | Optional, allows basic punctuation                     |
| ⚠️ **Real-time Feedback** | Errors shown immediately on blur                       |

---

## 🎬 Demo

### Main Task List View

- View all tasks with their details
- Filter by category
- Sort by due date
- Visual priority indicators
- Real-time countdown display

### Add/Edit Task Form

- Intuitive form with validation
- Category dropdown
- Priority radio buttons
- Date-time picker
- Optional description field

---

## 📁 Project Structure

```
Dynamic-Task-Manager-App/
│
├── index.html          # Main HTML structure
├── script.js           # JavaScript application (735 lines)
├── styles.css          # Custom CSS styles
├── README.md           # Project documentation
│
└── [No external dependencies except Bootstrap CDN]
```

---

## 🏗️ Architecture

The application follows the **Module Pattern** using **IIFE (Immediately Invoked Function Expression)** for encapsulation:

```
┌─────────────────────────────────────────────────────────────┐
│                    TASK MANAGER APPLICATION                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   TasksModule   │  │    DomModule    │  │   UiModule  │ │
│  │                 │  │                 │  │             │ │
│  │ • Data Storage  │  │ • DOM Elements  │  │ • Events    │ │
│  │ • Validation    │◄─┤ • View Updates  │◄─┤ • Handlers  │ │
│  │ • Business Logic│  │ • Rendering     │  │ • Init      │ │
│  │ • CRUD Ops      │  │ • Error Display │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Module Descriptions

#### 1. TasksModule (Data & Business Logic)

```javascript
const TasksModule = (() => {
  // Private data
  let tasks = [];
  let editingTaskId = null;
  let sortAscending = true;

  // Public API
  return {
    getAvailableCategories, // Get unique categories
    isTaskNameDuplicate, // Check for duplicates
    validateTaskName, // Validate task name
    validateDescription, // Validate description
    addTask, // Create new task
    updateTask, // Modify existing task
    removeTask, // Delete task
    getTaskById, // Find task by ID
    getFilteredTasks, // Filter & sort tasks
    getTimeRemaining, // Calculate countdown
    isTaskOverdue, // Check if past due
    // ... state getters/setters
  };
})();
```

#### 2. DomModule (DOM Manipulation)

```javascript
const DomModule = (() => {
  // DOM Element references
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskForm = document.getElementById("taskForm");
  // ...

  // Public API
  return {
    // DOM elements exposed for event binding
    addTaskBtn,
    taskForm,
    cancelBtn, // ...

    // View functions
    showTaskFormView,
    showTaskListView,

    // Update functions
    updateCategorySelect,
    updateCategoryFilter,
    displayTasks,
    refreshTaskStatuses,

    // Error handling
    showEmptyNameError,
    showPatternNameError,
    showDuplicateNameError,
    hideTaskNameErrors,
    // ...
  };
})();
```

#### 3. UiModule (User Interactions)

```javascript
const UiModule = (() => {
  // Event handlers (private)
  function handleAddTaskClick() {
    /* ... */
  }
  function handleFormSubmit(e) {
    /* ... */
  }
  // ...

  // Public API
  return {
    editTask, // Called from onclick in HTML
    deleteTask, // Called from onclick in HTML
    initializeApp, // Called on DOMContentLoaded
  };
})();
```

### Data Flow

```
User Action → UiModule (Handler) → TasksModule (Logic) → DomModule (Update UI)
     │                                    │                      │
     │                                    ▼                      │
     │                            Validate Data                  │
     │                                    │                      │
     │                                    ▼                      │
     │                            Update tasks[]                 │
     │                                    │                      │
     │                                    ▼                      │
     └────────────────────────────── Render UI ◄─────────────────┘
```

---

## 🛠️ Technologies Used

| Technology     | Version | Purpose                   |
| -------------- | ------- | ------------------------- |
| **JavaScript** | ES6+    | Core application logic    |
| **HTML5**      | 5       | Semantic structure        |
| **CSS3**       | 3       | Custom styling            |
| **Bootstrap**  | 5.3.3   | UI framework & components |

### JavaScript Concepts Used

- ✅ Module Pattern (IIFE)
- ✅ Closures for private variables
- ✅ Arrow Functions
- ✅ Template Literals
- ✅ Destructuring Assignment
- ✅ Spread Operator
- ✅ Array Methods (map, filter, find, some, forEach)
- ✅ Set for unique values
- ✅ Event Listeners
- ✅ DOM Manipulation
- ✅ Regular Expressions (Validation)
- ✅ Date Object manipulation
- ✅ setInterval for real-time updates

---

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/samuel9974/Dynamic-Task-Manager-App-JavaScript-Web-Programming.git
   ```

2. **Navigate to project directory**

   ```bash
   cd Dynamic-Task-Manager-App-JavaScript-Web-Programming
   ```

3. **Open in browser**
   - Simply open `index.html` in any modern web browser
   - Or use a local server (e.g., Live Server in VS Code)

> **Note:** No npm install required - the project uses Bootstrap via CDN.

---

## 📖 Usage

### Adding a Task

1. Click the **"Add Task"** button
2. Fill in the task details:
   - **Task Name** (required): Enter a descriptive name
   - **Category**: Select from dropdown
   - **Priority**: Choose Low, Medium, or High
   - **Due Date**: Pick date and time
   - **Description** (optional): Add additional details
3. Click **"Add Task"** to save

### Editing a Task

1. Click the **"Edit"** button on any task
2. Modify the desired fields
3. Click **"Save Changes"**

### Filtering Tasks

1. Use the **"Filter by Category"** dropdown
2. Select a specific category or "All"

### Sorting Tasks

1. Click **"Sort by Due Time"** button
2. Toggle between Ascending and Descending order

---

## 📚 Code Documentation

### Task Object Structure

```javascript
{
  id: Number,          // Unique identifier (timestamp)
  name: String,        // Task title
  category: String,    // Category (lowercase)
  priority: String,    // "low" | "medium" | "high"
  dueDate: String,     // ISO datetime string
  description: String, // Optional details
  completed: Boolean   // Completion status
}
```

### Key Functions

| Function                | Module      | Description                       |
| ----------------------- | ----------- | --------------------------------- |
| `addTask()`             | TasksModule | Creates a new task with unique ID |
| `updateTask()`          | TasksModule | Updates task by ID                |
| `removeTask()`          | TasksModule | Deletes task from array           |
| `getFilteredTasks()`    | TasksModule | Returns filtered & sorted tasks   |
| `getTimeRemaining()`    | TasksModule | Calculates countdown string       |
| `displayTasks()`        | DomModule   | Renders task list to DOM          |
| `createTaskElement()`   | DomModule   | Builds single task HTML element   |
| `refreshTaskStatuses()` | DomModule   | Updates countdown for all tasks   |
| `handleFormSubmit()`    | UiModule    | Processes form submission         |
| `initializeApp()`       | UiModule    | Sets up event listeners           |

---

## 🔮 Future Enhancements

- [ ] **Local Storage** - Persist tasks between sessions
- [ ] **Task Completion** - Mark tasks as done
- [ ] **Drag & Drop** - Reorder tasks manually
- [ ] **Search** - Find tasks by keyword
- [ ] **Export/Import** - Save tasks to JSON file
- [ ] **Notifications** - Browser alerts for due tasks
- [ ] **Dark Mode** - Theme toggle
- [ ] **Subtasks** - Nested task support

---

## 👨‍💻 Author

**Samuel**

- GitHub: [@samuel9974](https://github.com/samuel9974)

---

## 📄 License

This project is open source and available for educational purposes.

---

<p align="center">
  Made with ❤️ using vanilla JavaScript
</p>
