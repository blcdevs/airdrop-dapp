import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWeb3 } from "../context/Web3Context";
import UserDashboard from "../components/UserDashboard/UserDashboard";
import styles from '../styles/DashboardLayout.module.css';
import { ethers } from 'ethers';
import Link from 'next/link'; 

const Dashboard = () => {
  const router = useRouter();
  const { 
    account, 
    isConnected, 
    contract,
    checkUserStatus,
    getUserParticipationInfo,
    getAirdropInfo
  } = useWeb3();
  
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [airdropData, setAirdropData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          
          const userInfo = await contract.getUserParticipationInfo(account);
          
          let referrals = [];
          try {
            if (userInfo.referrals_) {
              referrals = userInfo.referrals_;
            }
          } catch (error) {
            console.log("No referrals array in contract");
          }

          let transactions = [];
          try {
            if (userInfo.transactions_) {
              transactions = userInfo.transactions_;
            }
          } catch (error) {
            console.log("No transactions array in contract");
          }

          setUserData({
            hasParticipated: userInfo.hasParticipated_,
            referralCount: Number(userInfo.referralCount_),
            referrer: userInfo.referrer_,
            totalEarned: ethers.utils.formatEther(userInfo.totalEarned || "0"),
            feePaid: ethers.utils.formatEther(userInfo.feePaid_ || "0"),
            referrals: referrals,
            transactions: transactions
          });

          const airdropInfo = await contract.getAirdropInfo();
          setAirdropData({
            airdropAmount: ethers.utils.formatEther(airdropInfo.baseAmount || "0"),
            referralBonus: ethers.utils.formatEther(airdropInfo.referralAmount || "0"),
            feeAmount: ethers.utils.formatEther(airdropInfo.currentFeeAmount || "0"),
            tokenSymbol: "BNB",
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

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isConnected) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

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
        <div className={styles.sidebarHeader}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
            <Link href="/" className={styles.backLink}>
              <i className="fas fa-arrow-left"></i>
            </Link>
            </div>
            <span className={styles.address}>{shortenAddress(account)}</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
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
          />
        )}
        {activeMenu === 'tasks' && (
          <div className={styles.comingSoon}>
            <i className="fas fa-clock"></i>
            <h2>Tasks Coming Soon</h2>
            <p>This feature is under development</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;