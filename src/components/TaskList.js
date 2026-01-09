import React from 'react';
import './TaskList.css';

const TaskList = ({ tasks, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffa500';
      case 'low':
        return '#51cf66';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="task-list">
      {tasks.map(task => (
        <div key={task._id} className="task-card">
          <div className="task-header">
            <h3>{task.title}</h3>
            <span
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>

          {task.description && <p className="task-description">{task.description}</p>}

          <div className="task-meta">
            <span className="due-date">📅 {formatDate(task.dueDate)}</span>
          </div>

          <div className="task-status">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className={`status-select status-${task.status}`}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="task-actions">
            <button
              className="edit-btn"
              onClick={() => onEdit(task)}
              title="Edit task"
            >
              ✏️ Edit
            </button>
            <button
              className="delete-btn"
              onClick={() => onDelete(task._id)}
              title="Delete task"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
