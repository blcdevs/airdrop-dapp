import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import styles from "./TaskDashboard.module.css";
import { ethers } from "ethers";
import { useNotification } from "../../context/NotificationContext";

const TaskDashboard = ({ userPoints, onPointsUpdate }) => {
  const { contract, account, getAllTasks } = useWeb3(); // Add getAllTasks from context
  const [tasks, setTasks] = useState([]);
  const [userTaskStatuses, setUserTaskStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();


  useEffect(() => {
    const loadTasks = async () => {
      if (contract) {
        try {
          const allTasks = await getAllTasks(); // Use getAllTasks from context
          console.log("Fetched tasks:", allTasks); // Debug log
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

  const handleTaskClick = async (task) => {
    if (!contract || !account) return;
    if (userTaskStatuses[task.id]?.isCompleted) return;

    try {
        // Open task link in new tab
        window.open(task.link, '_blank');

        // Complete the task
        const tx = await contract.completeTask(task.id);
        console.log("Completing task...", tx);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Task completed:", receipt);

        // Update task status
        const [isCompleted, completedAt] = await contract.getUserTaskStatus(account, task.id);
        setUserTaskStatuses(prev => ({
            ...prev,
            [task.id]: { isCompleted, completedAt: Number(completedAt) }
        }));

        // Refresh user points
        const points = await contract.userTaskPoints(account);
        if (onPointsUpdate) {
            onPointsUpdate(points);
        }

        // Show success notification
        showNotification("Task completed successfully!", "success");

    } catch (error) {
        console.error("Error completing task:", error);
        showNotification("Failed to complete task. Please try again.", "error");
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
                className={styles.taskLink}
                disabled={userTaskStatuses[task.id]?.isCompleted}
              >
                {userTaskStatuses[task.id]?.isCompleted ? 'Completed' : 'Complete Task'}
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