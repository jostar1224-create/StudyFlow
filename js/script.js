const taskForm = document.querySelector('.task-form');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');

const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const completionRateEl = document.getElementById('completion-rate');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const digitalClockEl = document.getElementById('digital-clock');
const quoteTextEl = document.getElementById('quote-text');
const quoteSpinnerEl = document.getElementById('quote-spinner');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const sortSelect = document.getElementById('sort-select');
const notificationBannerEl = document.getElementById('notification-banner');


let tasks = [];
let editingTaskId = null;

taskForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const taskName = document.getElementById('task-name').value;
  const taskDescription = document.getElementById('task-description').value;
  const taskPriority = document.getElementById('task-priority').value;
  const taskDueDate = document.getElementById('task-due-date').value;
  const taskCategory = document.getElementById('task-category').value;

    if (editingTaskId !== null) {
  const taskToUpdate = tasks.find(function (task) {
    return task.id === editingTaskId;
  });

  taskToUpdate.name = taskName;
  taskToUpdate.description = taskDescription;
  taskToUpdate.priority = taskPriority;
  taskToUpdate.dueDate = taskDueDate;
  taskToUpdate.category = taskCategory;

  const oldCard = document.querySelector(`.task-card[data-id="${editingTaskId}"]`);
  oldCard.remove();

  renderTask(taskToUpdate);

  editingTaskId = null;
      cancelEditBtn.style.display = 'none';   
  
} else {
  const newTask = {
    id: Date.now(),
    name: taskName,
    description: taskDescription,
    priority: taskPriority,
    dueDate: taskDueDate,
    category: taskCategory,
    completed: false
  };

  tasks.push(newTask);
  renderTask(newTask);
  updateStats();
  saveTasks();
  checkDueDates();
}

taskForm.reset();
});



function renderTask(task) {
  const taskCard = document.createElement('div');
  taskCard.classList.add('task-card');
  taskCard.setAttribute('data-id', task.id);

  taskCard.innerHTML = `
    <input type="checkbox" class="task-checkbox">
    <div class="task-info">
      <h3 class="task-name">${task.name}</h3>
      <span class="task-priority priority-${task.priority}">${task.priority}</span>
      <span class="task-due-date">Due: ${task.dueDate}</span>
    </div>
    <div class="task-actions">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

  taskList.appendChild(taskCard);
}



taskList.addEventListener('click', function (event) {
  if (event.target.classList.contains('delete-btn')) {
    const taskCard = event.target.closest('.task-card');
    const taskId = Number(taskCard.getAttribute('data-id'));

    tasks = tasks.filter(function (task) {
      return task.id !== taskId;
    });
    updateStats();
    saveTasks();
    checkDueDates();

    taskCard.remove();

    console.log(tasks);
  }

  if(event.target.classList.contains('edit-btn')) {
    const taskCard = event.target.closest('.task-card');
    const taskId = Number(taskCard.getAttribute('data-id'));
    const taskToEdit = tasks.find(function (task) {
      return task.id === taskId;
    });

    console.log(taskToEdit);
     updateStats();
     saveTasks();
     checkDueDates();

    document.getElementById('task-name').value = taskToEdit.name;
     document.getElementById('task-description').value = taskToEdit.description;
    document.getElementById('task-priority').value = taskToEdit.priority;
    document.getElementById('task-due-date').value = taskToEdit.dueDate;
    document.getElementById('task-category').value = taskToEdit.category;

      editingTaskId = taskId;
      cancelEditBtn.style.display = 'inline-block';
 
      taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('task-name').focus();
  }
  
});
taskList.addEventListener('change', function (event) {
  if (event.target.classList.contains('task-checkbox')) {
    const taskCard = event.target.closest('.task-card');
    const taskId = Number(taskCard.getAttribute('data-id'));

    const task = tasks.find(function (task) {
      return task.id === taskId;
    });

    task.completed = event.target.checked;

      updateStats();
      saveTasks();
      checkDueDates();

    taskCard.classList.toggle('completed', task.completed);

    console.log(task);
  }
});

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(function (task) {
    return task.completed;
  }).length;
  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
  completionRateEl.textContent = completionRate + '%';
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}



function loadTasks() {
  const storedTasks = localStorage.getItem('tasks');

  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
    tasks.forEach(function (task) {
      renderTask(task);
    });
    updateStats();
    checkDueDates();
  }
}


searchInput.addEventListener('input', function (event) {
  const searchTerm = event.target.value.toLowerCase();

  const allTaskCards = document.querySelectorAll('.task-card');

  allTaskCards.forEach(function (card) {
    const taskName = card.querySelector('.task-name').textContent.toLowerCase();

    if (taskName.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
});

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const filterValue = button.getAttribute('data-filter');

    const allTaskCards = document.querySelectorAll('.task-card');

    allTaskCards.forEach(function (card) {
      const taskId = Number(card.getAttribute('data-id'));
      const task = tasks.find(function (t) {
        return t.id === taskId;
      });

      let shouldShow = false;

      if (filterValue === 'all') {
        shouldShow = true;
      } else if (filterValue === 'pending') {
        shouldShow = !task.completed;
      } else if (filterValue === 'completed') {
        shouldShow = task.completed;
      } else if (filterValue === 'high-priority') {
        shouldShow = task.priority === 'high';
      }

      card.style.display = shouldShow ? 'flex' : 'none';
    });
  });
});

darkModeToggle.addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');

  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
});

function loadDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode');

  if (isDarkMode === 'true') {
    document.body.classList.add('dark-mode');
  }
}

function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  digitalClockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();



async function fetchQuote() {
  quoteSpinnerEl.style.display = 'block';
  quoteTextEl.textContent = '';

  const keywords = ['study', 'focus', 'discipline', 'goal', 'work', 'success', 'effort', 'persist', 'achieve'];

  try {
    let data;
    let attempts = 0;

    do {
      const response = await fetch('https://dummyjson.com/quotes/random');
      data = await response.json();
      attempts++;
    } while (
      !keywords.some(function (word) {
        return data.quote.toLowerCase().includes(word);
      }) &&
      attempts < 8
    );

    quoteTextEl.textContent = `"${data.quote}" — ${data.author}`;
  } catch (error) {
    quoteTextEl.textContent = 'Stay focused. You are doing great, and you can achieve more.';
    console.error('Failed to fetch quote:', error);
  } finally {
    quoteSpinnerEl.style.display = 'none';
  }
}

setTimeout(fetchQuote, 300);


cancelEditBtn.addEventListener('click', function () {
  editingTaskId = null;
  taskForm.reset();
  cancelEditBtn.style.display = 'none';
});

sortSelect.addEventListener('change', function () {
  const sortValue = sortSelect.value;

  if (sortValue === 'due-date') {
    tasks.sort(function (a, b) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (sortValue === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort(function (a, b) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  taskList.innerHTML = '';
  tasks.forEach(function (task) {
    renderTask(task);
  });
});

function checkDueDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueSoonTasks = tasks.filter(function (task) {
    if (task.completed) return false;

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    return due <= today;
  });

  if (dueSoonTasks.length > 0) {
    notificationBannerEl.textContent = `⚠️ You have ${dueSoonTasks.length} task(s) due today or overdue!`;
    notificationBannerEl.style.display = 'block';
  }
   if (Notification.permission === 'granted') {
    new Notification('StudyFlow Reminder', {
      body: `You have ${dueSoonTasks.length} task(s) due today or overdue!`,
      icon: '🔔'
    });
  }
   else {
    notificationBannerEl.style.display = 'none';
  }
}

if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  Notification.requestPermission();
}




loadTasks();  loadDarkMode();  checkDueDates();

