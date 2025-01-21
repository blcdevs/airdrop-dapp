import React from 'react';
import { useWeb3 } from "../context/Web3Context";
import { useNotification } from "../context/NotificationContext";

const AddTokenButton = ({ className }) => {
  const { showNotification } = useNotification();

  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
  const tokenSymbol = "TNTC";
  const tokenDecimals = 18;
  const tokenImage = "http://localhost:3000/assets/images/logo.png"; // Optional: Add your token logo URL

  const addTokenToWallet = async () => {
    try {
      if (!window.ethereum) {
        showNotification("Please install MetaMask or use a Web3 browser", "error");
        return;
      }

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage, // Optional
          },
        },
      });

      if (wasAdded) {
        showNotification("Token added to wallet successfully!", "success");
      } else {
        showNotification("Failed to add token to wallet.", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Error adding token to wallet", "error");
    }
  };

  return (
    <button
      onClick={addTokenToWallet}
      className={`btn btn-default btn-radius ${className}`}
    >
      Add TNTC to Wallet
    </button>
  );
};

export default AddTokenButton;