import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import Profile from './Profile';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await api.post('/api/tasks', taskData);
      setTasks([response.data, ...tasks]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, taskData);
      setTasks(tasks.map(t => t._id === taskId ? response.data : t));
      setEditingTask(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/api/tasks/${taskId}`);
        setTasks(tasks.filter(t => t._id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="app-title">Task Manager</h1>
          <div className="navbar-actions">
            <span className="user-info">Welcome, {user?.firstName || user?.username || user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'tasks' && (
            <div className="tasks-section">
              <div className="section-header">
                <h2>My Tasks</h2>
                <button
                  className="add-btn"
                  onClick={() => { setEditingTask(null); setShowForm(!showForm); }}
                >
                  {showForm ? '✕ Cancel' : '+ Add Task'}
                </button>
              </div>

              {showForm && (
                <TaskForm
                  onSubmit={editingTask ? (data) => handleUpdateTask(editingTask._id, data) : handleAddTask}
                  onCancel={handleCancelForm}
                  editingTask={editingTask}
                />
              )}

              <div className="filters">
                <input
                  type="text"
                  name="search"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="search-input"
                />
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {loading ? (
                <div className="loading">Loading tasks...</div>
              ) : filteredTasks.length > 0 ? (
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTask}
                  onStatusChange={(taskId, newStatus) => {
                    const task = tasks.find(t => t._id === taskId);
                    if (task) {
                      handleUpdateTask(taskId, { ...task, status: newStatus });
                    }
                  }}
                />
              ) : (
                <div className="empty-state">
                  <p>No tasks found. Create one to get started!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
