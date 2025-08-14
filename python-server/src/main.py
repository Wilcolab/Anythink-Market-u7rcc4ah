from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

app = FastAPI(title="Time Travel Tasks API")

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TaskCreate(BaseModel):
    text: str
    priority: Priority = Priority.MEDIUM
    category: str = "general"

class Task(TaskCreate):
    id: int
    created_at: datetime
    completed: bool = False

tasks_db = []
task_id_counter = 1

# Initialize with sample tasks
initial_tasks = [
    {"text": "Write a diary entry from the future", "priority": Priority.MEDIUM, "category": "writing"},
    {"text": "Create a time machine from a cardboard box", "priority": Priority.HIGH, "category": "crafts"},
    {"text": "Plan a trip to the dinosaurs", "priority": Priority.HIGH, "category": "planning"},
    {"text": "Draw a futuristic city", "priority": Priority.MEDIUM, "category": "art"},
    {"text": "List items to bring on a time-travel adventure", "priority": Priority.LOW, "category": "planning"}
]

for task_data in initial_tasks:
    task = Task(
        id=task_id_counter,
        created_at=datetime.now(),
        **task_data
    )
    tasks_db.append(task)
    task_id_counter += 1

@app.get("/")
def read_root():
    return {"message": "Welcome to the Time Travel Tasks API"}

@app.post("/tasks", response_model=Task)
def add_task(task: TaskCreate):
    global task_id_counter
    new_task = Task(
        id=task_id_counter,
        created_at=datetime.now(),
        **task.dict()
    )
    tasks_db.append(new_task)
    task_id_counter += 1
    return new_task

@app.get("/tasks", response_model=List[Task])
def get_tasks(
    priority: Optional[Priority] = None,
    category: Optional[str] = None,
    completed: Optional[bool] = None,
    search: Optional[str] = Query(None, min_length=3)
):
    filtered_tasks = tasks_db

    if priority:
        filtered_tasks = [t for t in filtered_tasks if t.priority == priority]
    if category:
        filtered_tasks = [t for t in filtered_tasks if t.category == category]
    if completed is not None:
        filtered_tasks = [t for t in filtered_tasks if t.completed == completed]
    if search:
        filtered_tasks = [t for t in filtered_tasks if search.lower() in t.text.lower()]

    return filtered_tasks

@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    task = next((t for t in tasks_db if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_update: TaskCreate):
    task_idx = next((idx for idx, t in enumerate(tasks_db) if t.id == task_id), None)
    if task_idx is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = Task(
        id=task_id,
        created_at=tasks_db[task_idx].created_at,
        completed=tasks_db[task_idx].completed,
        **task_update.dict()
    )
    tasks_db[task_idx] = updated_task
    return updated_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    task_idx = next((idx for idx, t in enumerate(tasks_db) if t.id == task_id), None)
    if task_idx is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    tasks_db.pop(task_idx)
    return {"message": "Task deleted successfully"}

@app.patch("/tasks/{task_id}/toggle", response_model=Task)
def toggle_task(task_id: int):
    task = next((t for t in tasks_db if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.completed = not task.completed
    return task
