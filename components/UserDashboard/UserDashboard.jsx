import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import styles from "./UserDashboard.module.css";
import { useWeb3 } from "../../context/Web3Context";

const UserDashboard = ({ activeUser, airdropInfo, handleParticipateWithoutReferral }) => {
  const { account, contract } = useWeb3();
  const [referralLink, setReferralLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextClaimTime, setNextClaimTime] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (account && typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}?ref=${account}`);
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    const checkClaimStatus = async () => {
      if (contract && account) {
        const nextTime = await contract.getNextClaimTime(account);
        setNextClaimTime(Number(nextTime));
        setCanClaim(Date.now() / 1000 >= Number(nextTime));
      }
    };

    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 1000);
    return () => clearInterval(interval);
  }, [contract, account]);

  const formatTimeLeft = (nextClaimTime) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = nextClaimTime - now;
    if (diff <= 0) return "Ready to claim";
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header Section */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h1>User Dashboard</h1>
          <p className={styles.walletAddress}>
            Wallet: <span>{shortenAddress(account)}</span>
          </p>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className={styles.dashboardContent}>
        {/* Stats Overview Section */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {/* Participation Status Card */}
            <div className={styles.statCard}>
              <div className={styles.cardIcon}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className={styles.cardContent}>
                <h3>Airdrop Status</h3>
                {activeUser?.hasParticipated && !canClaim ? (
  <p className={`${styles.statusBadge} ${styles.active}`}>
    Claimed - Next in: {formatTimeLeft(nextClaimTime)}
  </p>
) : (
  <div className={styles.claimContainer}>
    <button
      onClick={handleParticipateWithoutReferral}
      className={styles.claimButton}
      disabled={!canClaim}
    >
      {canClaim ? "Claim Airdrop" : `Next claim in: ${formatTimeLeft(nextClaimTime)}`}
    </button>
  </div>
)}
              </div>
            </div>

            {/* Total Earned Card */}
            <div className={styles.statCard}>
              <div className={styles.cardIcon}>
                <i className="fas fa-coins"></i>
              </div>
              <div className={styles.cardContent}>
                <h3>Total Earned</h3>
                <p className={styles.tokenAmount}>
                  {activeUser?.totalEarned} {airdropInfo?.tokenSymbol}
                </p>
              </div>
            </div>

            {/* Referral Count Card */}
            <div className={styles.statCard}>
              <div className={styles.cardIcon}>
                <i className="fas fa-users"></i>
              </div>
              <div className={styles.cardContent}>
                <h3>Referral Count</h3>
                <p className={styles.referralCount}>
                  {activeUser?.referralCount || "0"} referrals
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.cardIcon}>
                <i className="fas fa-coins"></i>
              </div>
              <div className={styles.cardContent}>
                <h3>Task Points</h3>
                <p className={styles.tokenAmount}>
                {ethers.utils.formatUnits(activeUser?.userPoints || "0", 18)}
                </p>
              </div>
            </div>


          </div>
        </div>

        {/* Detailed Information Section */}
        <div className={styles.detailsSection}>
          <div className={styles.detailsGrid}>
            {/* Referral Information */}
            <div className={styles.detailCard}>
              <h3>Referral Information</h3>
              <div className={styles.referralDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Your Referrer</span>
                  <span className={styles.value}>
                    {activeUser?.referrer && activeUser.referrer !== "0x0000000000000000000000000000000000000000" 
                      ? shortenAddress(activeUser.referrer) 
                      : "No referrer"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Referral Link</span>
                  <div className={styles.referralLinkContainer}>
                    <input 
                      type="text" 
                      readOnly 
                      value={referralLink}
                      className={styles.referralLink}
                    />
                    <button 
                      className={`${styles.copyButton} ${copySuccess ? styles.copySuccess : ''}`}
                      onClick={copyToClipboard}
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Airdrop Details */}
            <div className={styles.detailCard}>
              <h3>Airdrop Details</h3>
              <div className={styles.airdropDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Base Amount</span>
                  <span className={styles.value}>
                    {airdropInfo?.airdropAmount} {airdropInfo?.tokenSymbol}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Referral Bonus</span>
                  <span className={styles.value}>
                    {airdropInfo?.referralBonus} {airdropInfo?.tokenSymbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Your Referrals Section */}
            <div className={styles.detailCard}>
              <h3>Your Referrals</h3>
              <div className={styles.referralsList}>
                {activeUser?.referralCount > 0 ? (
                  Array(activeUser.referralCount).fill(null).map((_, index) => (
                    <div key={index} className={styles.referralItem}>
                      <span className={styles.referralAddress}>
                        Referral #{index + 1}
                      </span>
                      <span className={styles.referralReward}>
                        +{airdropInfo?.referralBonus || "0"} {airdropInfo?.tokenSymbol}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noReferrals}>No referrals yet</p>
                )}
              </div>
            </div>

            {/* Transaction History Section */}
            <div className={styles.detailCard}>
              <h3>Transaction History</h3>
              <div className={styles.transactionList}>
                {activeUser?.hasParticipated ? (
                  <div className={styles.transactionItem}>
                    <div className={styles.txInfo}>
                      <span className={styles.txType}>Participation</span>
                      <span className={styles.txDate}>
                        {formatDate(Date.now() / 1000)}
                      </span>
                    </div>
                    <span className={styles.txAmount}>
                      {activeUser.feePaid} BNB
                    </span>
                  </div>
                ) : (
                  <p className={styles.noTransactions}>No transactions yet</p>
                )}
                {activeUser?.referralCount > 0 && (
                  <div className={styles.transactionItem}>
                    <div className={styles.txInfo}>
                      <span className={styles.txType}>Referral Rewards</span>
                      <span className={styles.txDate}>
                        {formatDate(Date.now() / 1000)}
                      </span>
                    </div>
                    <span className={styles.txAmount}>
                      {Number(airdropInfo?.referralBonus || 0) * activeUser.referralCount} {airdropInfo?.tokenSymbol}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;