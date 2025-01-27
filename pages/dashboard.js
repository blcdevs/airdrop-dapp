import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWeb3 } from "../context/Web3Context";
import UserDashboard from "../components/UserDashboard/UserDashboard";
import TaskDashboard from "../components/TaskDashboard/TaskDashboard";
import styles from '../styles/DashboardLayout.module.css';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useNotification } from "../context/NotificationContext";

const Dashboard = () => {
  const router = useRouter();
  const { 
    account, 
    isConnected, 
    contract,
  } = useWeb3();
  
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [airdropData, setAirdropData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (contract && account) {
        try {
          setLoading(true);
          
          // Get user participation info
          const userInfo = await contract.getUserParticipationInfo(account);
          const userPoints = await contract.userTaskPoints(account);
          
          setUserData({
            hasParticipated: userInfo.hasParticipated_,
            referralCount: Number(userInfo.referralCount_),
            referrer: userInfo.referrer_,
            totalEarned: ethers.utils.formatEther(userInfo.totalEarned || "0"),
            feePaid: ethers.utils.formatEther(userInfo.feePaid_ || "0"),
            userPoints: userPoints
          });

          // Get airdrop info
          const airdropInfo = await contract.getAirdropInfo();
          setAirdropData({
            airdropAmount: ethers.utils.formatEther(airdropInfo.baseAmount || "0"),
            referralBonus: ethers.utils.formatEther(airdropInfo.referralAmount || "0"),
            feeAmount: ethers.utils.formatEther(airdropInfo.currentFeeAmount || "0"),
            tokenSymbol: "TNTC",
          });

        } catch (error) {
          console.error("Error loading dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [contract, account]);

  const handlePointsUpdate = async () => {
    if (contract && account) {
      try {
        const userInfo = await contract.getUserParticipationInfo(account);
        setUserData(async prevData => ({
          ...prevData,
          totalEarned: ethers.utils.formatEther(userInfo.totalEarned),
          userPoints: Number(await contract.userTaskPoints(account))
        }));
      } catch (error) {
        console.error("Error updating points:", error);
      }
    }
  };

  const handleParticipateWithoutReferral = async () => {
    try {
      showNotification("Processing...", "info");
      const tx = await contract.participateWithoutReferral({ 
        value: ethers.utils.parseEther(airdropData?.feeAmount || "0") 
      });
      await tx.wait();
      
      // Refresh data after successful participation
      const userInfo = await contract.getUserParticipationInfo(account);
      const userPoints = await contract.userTaskPoints(account);
      
      setUserData({
        hasParticipated: userInfo.hasParticipated_,
        referralCount: Number(userInfo.referralCount_),
        referrer: userInfo.referrer_,
        totalEarned: ethers.utils.formatEther(userInfo.totalEarned || "0"),
        feePaid: ethers.utils.formatEther(userInfo.feePaid_ || "0"),
        userPoints: userPoints
      });

      showNotification("You have successfully participated!", "success");
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message, "error");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.dashboardLayout}>

<button 
        className={styles.menuToggle}
        onClick={toggleMobileMenu}
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <div 
        className={`${styles.overlay} ${isMobileMenuOpen ? styles.show : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <div className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <nav>
          <div className={styles.mobileMenuButton} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <i className="fas fa-bars"></i>
          </div>
          <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
            <li 
              className={styles.navItem}
            >
              <i className="fas fa-home"></i>
              <Link href="/">
                Back Home
              </Link>
            </li>

            <li 
              className={`${styles.navItem} ${activeMenu === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveMenu('dashboard')}
            >
              <i className="fas fa-chart-line"></i>
              Dashboard
            </li>
            <li 
              className={`${styles.navItem} ${activeMenu === 'tasks' ? styles.active : ''}`}
              onClick={() => setActiveMenu('tasks')}
            >
              <i className="fas fa-tasks"></i>
              Tasks
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.mainContent}>
        {activeMenu === 'dashboard' && (
          <UserDashboard 
            activeUser={userData}
            airdropInfo={airdropData}
            handleParticipateWithoutReferral={handleParticipateWithoutReferral}
          />
        )}
        {activeMenu === 'tasks' && (
          <TaskDashboard 
            userPoints={userData?.userPoints || 0}
            onPointsUpdate={handlePointsUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;