// Task priority enum
const Priority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    values: () => [Priority.LOW, Priority.MEDIUM, Priority.HIGH]
};

class Task {
    constructor({ id, text, priority = Priority.MEDIUM, category = 'general', completed = false }) {
        this.id = id;
        this.text = text;
        this.priority = priority;
        this.category = category;
        this.completed = completed;
        this.created_at = new Date().toISOString();
    }

    static validatePriority(priority) {
        return Priority.values().includes(priority);
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.idCounter = 1;
    }

    addTask(taskData) {
        const task = new Task({
            id: this.idCounter++,
            ...taskData
        });
        this.tasks.push(task);
        return task;
    }

    getAllTasks() {
        return this.tasks;
    }

    updateTask(id, taskData) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return null;
        
        const updated = new Task({
            id,
            ...taskData,
            created_at: this.tasks[index].created_at,
            completed: this.tasks[index].completed
        });
        this.tasks[index] = updated;
        return updated;
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return false;
        this.tasks.splice(index, 1);
        return true;
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return null;
        task.completed = !task.completed;
        return task;
    }
}

const taskManager = new TaskManager();

module.exports = {
    Task,
    Priority,
    taskManager
};
