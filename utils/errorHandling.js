export const handleTransactionError = (error, showNotification) => {
    console.error("Transaction error:", error);
    
    const errorMessages = {
      ACTION_REJECTED: "Transaction cancelled by user",
      INSUFFICIENT_FUNDS: "Insufficient BNB for gas fees. Please get test BNB from faucet.",
      NETWORK_ERROR: "Network error. Please check your connection and try again.",
      UNPREDICTABLE_GAS_LIMIT: "Transaction cannot be completed. Please try again.",
      CALL_EXCEPTION: "Contract call failed. Please try again.",
    };
  
    const errorMessage = errorMessages[error.code] || error.message || "Transaction failed";
    showNotification(errorMessage, "error");
  };