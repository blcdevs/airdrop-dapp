import React, { useState, useCallback } from "react";
import styles from "./UserDetailsModal.module.css";

const UserDetailsModal = ({ isOpen, onClose, activeUser, account }) => {
  const [copied, setCopied] = useState(false);

  console.log(activeUser);

  // Generate referral URL
  const referralUrl = activeUser?.referrer
    ? `${window.location.origin}?ref/${account}`
    : "";

  // Handle copy with proper URL
  const handleCopyReferralUrl = useCallback(async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [referralUrl]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.closeIcon}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.modalHeader}>
          <h2>Your Airdrop Details</h2>
        </div>

        <div className={styles.detailsContainer}>
          {/* Participation Status */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Participation Status</span>
            <span
              className={`${styles.value} ${styles.status} ${
                activeUser?.hasParticipated
                  ? styles.participated
                  : styles.notParticipated
              }`}
            >
              {activeUser?.hasParticipated
                ? "✓ Participated"
                : "✗ Not Participated"}
            </span>
          </div>

          {/* Referral Count */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Referral Count</span>
            <span className={styles.value}>
              <span className={styles.number}>
                {activeUser?.referralCount || 0}
              </span>{" "}
              referrals
            </span>
          </div>

          {/* Referrer */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Referrer</span>
            <span className={`${styles.value} ${styles.address}`}>
              {activeUser?.referrer
                ? `${activeUser.referrer.slice(
                    0,
                    6
                  )}...${activeUser.referrer.slice(-4)}`
                : "No referrer"}
            </span>
          </div>

          {/* Total Earned */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Total Earned</span>
            <span className={`${styles.value} ${styles.earnings}`}>
              {activeUser?.totalEarned || 0} Tokens
            </span>
          </div>

          {/* Referral URL */}
          <div className={styles.referralUrlContainer}>
            <span className={styles.label}>Your Referral URL</span>
            <div className={styles.urlBox}>
              <input
                type="text"
                readOnly
                value={referralUrl}
                className={styles.urlInput}
                placeholder="Connect wallet to get referral link"
              />
              <button
                onClick={handleCopyReferralUrl}
                className={styles.copyButton}
                disabled={!referralUrl}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>
            Share your referral link to earn more tokens!
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
