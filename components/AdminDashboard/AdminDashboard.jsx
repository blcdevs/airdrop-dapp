import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = ({
  isOpen,
  onClose,
  airdropInfo,
  setAirdropAmount,
  setAirdropBonus,
  updateAirdropAmount,
  updateReferralBonus,
  updateWithdrawTokens,
  contract,
  feeAmount,
  feeCollector,
  onUpdateFeeAmount,
  onUpdateFeeCollector,
  onWithdrawFees
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [newFeeCollector, setNewFeeCollector] = useState("");

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2>Admin Dashboard</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "overview" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "settings" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "participants" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("participants")}
          >
            Participants
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "overview" && (
            <div className={styles.overview}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>Total Participants</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.totalParticipants || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Remaining Tokens</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.remainingTokens || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Airdrop Tokens</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.airdropAmount || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Referral Bonus Tokens</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.referralBonus || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Distributed</h3>
                  <p className={styles.statValue}>
                    {1000000 - airdropInfo?.airdropContractBalance || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Status</h3>
                  <p
                    className={`${styles.status} ${
                      airdropInfo?.isAirdropActive
                        ? styles.active
                        : styles.inactive
                    }`}
                  >
                    {airdropInfo?.isAirdropActive ? "Active" : "Inactive"}
                  </p>
                </div>
                {/* New Fee-related cards */}
                <div className={styles.statCard}>
                  <h3>Current Fee</h3>
                  <p className={styles.statValue}>
                    {feeAmount} BNB
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Fee Collector</h3>
                  <p className={styles.statValue} style={{ fontSize: '0.8em', wordBreak: 'break-all' }}>
                    {feeCollector}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Fees Collected</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.totalFeesCollected || 0} BNB
                  </p>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionButton} ${styles.dangerButton}`}
                  onClick={updateWithdrawTokens}
                >
                  Withdraw Remaining Tokens
                </button>
                <button
                  className={`${styles.actionButton} ${styles.primaryButton}`}
                  onClick={onWithdrawFees}
                >
                  Withdraw Collected Fees
                </button>
              </div>
            </div>
          )}

          {/* Rest of the component remains the same */}
          {activeTab === "settings" && (
            <div className={styles.settings}>
              <div className={styles.settingGroup}>
                <h3>Update Airdrop Amount</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    onChange={(e) => setAirdropAmount(e.target.value)}
                    placeholder="New airdrop amount"
                  />
                  <button onClick={updateAirdropAmount}>Update</button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <h3>Update Referral Bonus</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    onChange={(e) => setAirdropBonus(e.target.value)}
                    placeholder="New referral bonus"
                  />
                  <button onClick={updateReferralBonus}>Update</button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <h3>Update Fee Amount</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    step="0.000000000000000001"
                    value={newFeeAmount}
                    onChange={(e) => setNewFeeAmount(e.target.value)}
                    placeholder="New fee amount (BNB)"
                  />
                  <button onClick={() => onUpdateFeeAmount(newFeeAmount)}>
                    Update
                  </button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <h3>Update Fee Collector</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={newFeeCollector}
                    onChange={(e) => setNewFeeCollector(e.target.value)}
                    placeholder="New fee collector address"
                  />
                  <button onClick={() => onUpdateFeeCollector(newFeeCollector)}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className={styles.participants}>
              <table className={styles.participantsTable}>
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Referrals</th>
                    <th>Total Earned</th>
                    <th>Fee Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {airdropInfo?.allParticipants.map((participant, index) => (
                    <tr key={index}>
                      <td>{participant.address}</td>
                      <td>
                        <span className={styles.participationStatus}>
                          {participant.hasParticipated ? "✓" : "✗"}
                        </span>
                      </td>
                      <td>{participant.referralCount}</td>
                      <td>{participant.totalEarned} Tokens</td>
                      <td>{participant.feePaid} BNB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;