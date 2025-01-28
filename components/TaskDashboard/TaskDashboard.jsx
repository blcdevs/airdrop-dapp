import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import styles from "./TaskDashboard.module.css";
import { ethers } from "ethers";
import { useNotification } from "../../context/NotificationContext";

// Configuration constants
const TASK_COMPLETION_DELAY = 2 * 60; // 2 minutes in seconds
const STORAGE_KEY = 'taskTimers';

const TaskDashboard = ({ userPoints, onPointsUpdate }) => {
  const { contract, account, getAllTasks } = useWeb3();
  const [tasks, setTasks] = useState([]);
  const [userTaskStatuses, setUserTaskStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [taskTimers, setTaskTimers] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only load timers that haven't expired
        const currentTime = Date.now() / 1000;
        const validTimers = {};
        Object.entries(parsed).forEach(([taskId, startTime]) => {
          if (currentTime - startTime < TASK_COMPLETION_DELAY) {
            validTimers[taskId] = startTime;
          }
        });
        return validTimers;
      }
    }
    return {};
  });
  const [countdowns, setCountdowns] = useState({});
  const { showNotification } = useNotification();

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      if (contract) {
        try {
          const allTasks = await getAllTasks();
          console.log("Fetched tasks:", allTasks);
          setTasks(allTasks);
        } catch (error) {
          console.error("Error loading tasks:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTasks();
  }, [contract, getAllTasks]);

  // Load task statuses
  useEffect(() => {
    const loadTaskStatuses = async () => {
      if (contract && account && tasks.length > 0) {
        try {
          const statuses = {};
          for (const task of tasks) {
            const [isCompleted, completedAt] = await contract.getUserTaskStatus(account, task.id);
            statuses[task.id] = { isCompleted, completedAt: Number(completedAt) };
          }
          setUserTaskStatuses(statuses);
        } catch (error) {
          console.error("Error loading task statuses:", error);
        }
      }
    };

    loadTaskStatuses();
  }, [tasks, account, contract]);

  // Persist timers to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskTimers));
    }
  }, [taskTimers]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now() / 1000;
      const newCountdowns = {};
      
      Object.entries(taskTimers).forEach(([taskId, startTime]) => {
        const elapsed = currentTime - startTime;
        const remaining = TASK_COMPLETION_DELAY - elapsed;
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60);
          const seconds = Math.floor(remaining % 60);
          newCountdowns[taskId] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [taskTimers]);

  const startTaskTimer = (taskId) => {
    const startTime = Date.now() / 1000;
    setTaskTimers(prev => ({
      ...prev,
      [taskId]: startTime
    }));
  };

  const getTaskStatus = (taskId) => {
    const startTime = taskTimers[taskId];
    if (!startTime) return "START";

    const currentTime = Date.now() / 1000;
    const timeElapsed = currentTime - startTime;

    if (timeElapsed < TASK_COMPLETION_DELAY) {
      return "WAIT";
    }

    return "CLAIM";
  };

  const handleTaskClick = async (task) => {
    if (!contract || !account) return;
    if (userTaskStatuses[task.id]?.isCompleted) return;

    const status = getTaskStatus(task.id);

    switch (status) {
      case "START":
        // Open task link and start timer
        window.open(task.link, '_blank');
        startTaskTimer(task.id);
        showNotification(`Complete the task and wait ${TASK_COMPLETION_DELAY / 60} minutes to claim your reward`, "info");
        break;

      case "CLAIM":
        try {
          const tx = await contract.completeTask(task.id);
          showNotification("Claiming reward...", "info");
          
          const receipt = await tx.wait();
          console.log("Task completed:", receipt);

          // Update task status
          const [isCompleted, completedAt] = await contract.getUserTaskStatus(account, task.id);
          setUserTaskStatuses(prev => ({
            ...prev,
            [task.id]: { isCompleted, completedAt: Number(completedAt) }
          }));

          // Clear timer
          setTaskTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[task.id];
            return newTimers;
          });

          // Refresh user points
          if (onPointsUpdate) {
            const points = await contract.userTaskPoints(account);
            onPointsUpdate(points);
          }

          showNotification("Task completed successfully!", "success");
        } catch (error) {
          console.error("Error completing task:", error);
          showNotification("Failed to complete task. Please try again.", "error");
        }
        break;

      case "WAIT":
        showNotification(`Please wait ${countdowns[task.id]} before claiming`, "warning");
        break;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className={styles.taskDashboard}>
      <div className={styles.header}>
        <h2>Task Center</h2>
        <div className={styles.userPoints}>
          <span>Your Points: {ethers.utils.formatUnits(userPoints.toString(), 18) || 0}</span>
        </div>
      </div>

      <div className={styles.taskList}>
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`${styles.taskCard} ${userTaskStatuses[task.id]?.isCompleted ? styles.completed : ''}`}
            >
              <div className={styles.taskHeader}>
                <h3>{task.title}</h3>
                <span className={styles.reward}>+{ethers.utils.formatUnits(task.rewardAmount, 18)} Points</span>
              </div>
              
              <p className={styles.description}>{task.description}</p>
              
              <button 
                onClick={() => handleTaskClick(task)}
                className={`${styles.taskLink} ${getTaskStatus(task.id) === "WAIT" ? styles.waiting : ''}`}
                disabled={userTaskStatuses[task.id]?.isCompleted}
              >
                {userTaskStatuses[task.id]?.isCompleted 
                  ? 'Completed' 
                  : getTaskStatus(task.id) === "START"
                    ? 'Complete Task'
                    : getTaskStatus(task.id) === "WAIT"
                      ? `Wait ${countdowns[task.id]}`
                      : 'Claim Reward'}
              </button>

              <div className={styles.taskFooter}>
                <span className={styles.status}>
                  {userTaskStatuses[task.id]?.isCompleted ? (
                    <>
                      <i className="fas fa-check-circle"></i> Completed on{' '}
                      {formatDate(userTaskStatuses[task.id].completedAt)}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-hourglass-half"></i> Pending
                    </>
                  )}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noTasks}>
            <p>No tasks available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;