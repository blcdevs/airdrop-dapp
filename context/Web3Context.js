// context/Web3Context.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId, useConnect } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import ABI from "../web3/artifacts/contracts/TNTCAirdrop.sol/TNTCAirdrop.json";

const Web3Context = createContext();

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS;
const INITIAL_FEE_COLLECTOR = process.env.NEXT_PUBLIC_FEE_COLLECTOR;
const INITIAL_FEE_AMOUNT = "0.001"; // 0.001 BNB default fee

export function Web3Provider({ children }) {
  const [contract, setContract] = useState(null);
  const [feeAmount, setFeeAmount] = useState(INITIAL_FEE_AMOUNT);
  const [feeCollector, setFeeCollector] = useState(INITIAL_FEE_COLLECTOR);

  // Wagmi hooks v2
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();

  // Custom ethers hooks
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const contractAddress = CONTRACT_ADDRESS;
  const contractABI = ABI.abi;

  // Initialize contract
  useEffect(() => {
    if (signer && provider) {
      try {
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(contract);
        getFeeDetails(contract);
      } catch (error) {
        console.error("Error initializing contract:", error);
        setContract(null);
      }
    }
  }, [signer, provider]);

  useEffect(() => {
    if (!isConnected) {
      setContract(null);
    }
  }, [isConnected]);

  const getFeeDetails = async (contractInstance) => {
    try {
      const airdropInfo = await contractInstance.getAirdropInfo();
      setFeeAmount(ethers.utils.formatEther(airdropInfo.currentFeeAmount || 0));
      setFeeCollector(airdropInfo.currentFeeCollector);
    } catch (error) {
      console.error("Error fetching fee details:", error);
    }
  };

  const updateFeeAmount = async (newAmount) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const amountInWei = ethers.utils.parseEther(newAmount);
      const tx = await contract.setFeeAmount(amountInWei);
      await tx.wait();
      await getFeeDetails(contract);
      return { success: true, message: "Fee amount updated successfully" };
    } catch (error) {
      console.error("Error updating fee amount:", error);
      return { success: false, message: error.message };
    }
  };

  const updateFeeCollector = async (newCollector) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.setFeeCollector(newCollector);
      await tx.wait();
      await getFeeDetails(contract);
      return { success: true, message: "Fee collector updated successfully" };
    } catch (error) {
      console.error("Error updating fee collector:", error);
      return { success: false, message: error.message };
    }
  };

  const withdrawFees = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.withdrawFees();
      await tx.wait();
      return { success: true, message: "Fees withdrawn successfully" };
    } catch (error) {
      console.error("Error withdrawing fees:", error);
      return { success: false, message: error.message };
    }
  };

  const connectWallet = async () => {
    try {
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        await connect({ connector: injectedConnector });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account: address,
        isConnected,
        provider,
        signer,
        contract,
        connectWallet,
        chainId,
        feeAmount,
        feeCollector,
        updateFeeAmount,
        updateFeeCollector,
        withdrawFees,
        getFeeDetails
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}