import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';

const Dashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, {
        status: newStatus
      });
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#ffc107';
      case 'pending': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: {
      margin: 0,
      color: '#333'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    logoutButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    taskGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem'
    },
    taskCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    taskTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333'
    },
    taskDescription: {
      color: '#666',
      marginBottom: '1rem'
    },
    taskMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    badge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      color: 'white'
    },
    taskActions: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem'
    },
    select: {
      padding: '0.25rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '0.75rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#666'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>Loading tasks...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Project Management Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user.username}!</span>
          <button 
            style={styles.button}
            onClick={() => setShowForm(true)}
          >
            New Task
          </button>
          <button 
            style={styles.logoutButton}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {tasks.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No tasks yet</h3>
          <p>Create your first task to get started!</p>
        </div>
      ) : (
        <div style={styles.taskGrid}>
          {tasks.map(task => (
            <div key={task._id} style={styles.taskCard}>
              <div style={styles.taskTitle}>{task.title}</div>
              <div style={styles.taskDescription}>{task.description}</div>
              
              <div style={styles.taskMeta}>
                <span 
                  style={{
                    ...styles.badge,
                    backgroundColor: getStatusColor(task.status)
                  }}
                >
                  {task.status}
                </span>
                <span 
                  style={{
                    ...styles.badge,
                    backgroundColor: getPriorityColor(task.priority)
                  }}
                >
                  {task.priority}
                </span>
              </div>

              {task.dueDate && (
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}

              <div style={styles.taskActions}>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  style={styles.select}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                
                <button
                  style={styles.actionButton}
                  onClick={() => setEditingTask(task)}
                >
                  Edit
                </button>
                
                <button
                  style={{
                    ...styles.actionButton,
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;