import { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNotification } from "../context/NotificationContext";

import MainHeader from "../components/MainHeader";
import Banner from "../components/Banner";
import WhyUs from "../components/WhyUs";
import AboutUs from "../components/AboutUs";
import AirDrop from "../components/AirDrop";
import Distribution from "../components/Distribution";
import Timeline from "../components/Timeline";
import App from "../components/App";
import Team from "../components/Team";
import Faq from "../components/Faq";
import Contact from "../components/Contact";
import Clients from "../components/Clients";
import Footer from "../components/Footer";
import MoveUp from "../components/MoveUp";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import UserDashboard from "../components/UserDashboard/UserDashboard";

const index = () => {
  const { isConnected } = useAccount();
  const { 
    account, 
    contract, 
    connectWallet,
    feeAmount,
    feeCollector,
    updateFeeAmount,
    updateFeeCollector,
    withdrawFees 
  } = useWeb3();
  const { showNotification } = useNotification();
  
  const [activeUser, setActiveUser] = useState();
  const [airdropInfo, setAirdropInfo] = useState();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralAddress, setReferralAddress] = useState("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState();
  const [airdropBonus, setAirdropBonus] = useState();
  const [newStartTime, setNewStartTime] = useState("");

  useEffect(() => {
    if (contract && account) {
      fetchAirdropDetails();
      fetchUserDetails();
    }
  }, [contract, account]);

  const fetchAirdropDetails = async () => {
    try {
      const [tokenInfo, airdropInfo, participants, allParticipants] =
        await Promise.all([
          contract.getTokenInfo(),
          contract.getAirdropInfo(),
          contract.getTotalParticipants(),
          contract.getAllParticipants(),
        ]);

      const formattedParticipants = allParticipants.map((p) => ({
        address: p.userAddress,
        hasParticipated: p.hasParticipated,
        referralCount: p.referralCount.toString(),
        referrer: p.referrer,
        totalEarned: ethers.utils.formatEther(p.totalEarned),
        participationTime: new Date(
          Number(p.participationTime) * 1000
        ).toLocaleString(),
        feePaid: ethers.utils.formatEther(p.feePaid || 0),
      }));

      setAirdropInfo({
        startTime: airdropInfo.start ? Number(airdropInfo.start) * 1000 : 0,
        endTime: airdropInfo.end ? Number(airdropInfo.end) * 1000 : 0,
        totalParticipants: Number(participants),
        airdropName: airdropInfo.name,
        airdropDescription: airdropInfo.description,
        airdropAmount: ethers.utils.formatEther(airdropInfo.baseAmount),
        referralBonus: ethers.utils.formatEther(airdropInfo.referralAmount),
        remainingTokens: ethers.utils.formatEther(airdropInfo.remainingTokens),
        isAirdropActive: airdropInfo.isAirdropActive,
        feeAmount: ethers.utils.formatEther(airdropInfo.currentFeeAmount || 0),
        feeCollector: airdropInfo.currentFeeCollector,
        totalFeesCollected: ethers.utils.formatEther(airdropInfo.totalFeesCollected || 0),
        airdropContractBalance: ethers.utils.formatEther(
          tokenInfo.airdropContractBalance
        ),
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        tokenDecimals: tokenInfo.decimals,
        tokenAddress: tokenInfo.tokenAddress,
        totalSupply: ethers.utils.formatEther(tokenInfo.totalSupply),
        allParticipants: formattedParticipants,
      });
    } catch (error) {
      console.error("Error fetching airdrop details:", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const [participationInfo] = await Promise.all([
        contract.getUserParticipationInfo(account),
      ]);

      setActiveUser({
        hasParticipated: participationInfo.hasParticipated_,
        referralCount: participationInfo.referralCount_.toNumber(),
        referrer: participationInfo.referrer_,
        totalEarned: ethers.utils.formatEther(participationInfo.totalEarned),
        feePaid: ethers.utils.formatEther(participationInfo.feePaid_ || 0),
      });
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

  const handleParticipateWithoutReferral = async () => {
    try {
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.participateWithoutReferral({ 
        value: ethers.utils.parseEther(feeAmount) 
      });
      await tx.wait();
      showNotification("You have successfully participated!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const handleParticipate = async () => {
    try {
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.participate(referralAddress, { 
        value: ethers.utils.parseEther(feeAmount) 
      });
      await tx.wait();
      showNotification("You have successfully participated!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const updateAirdropAmount = async () => {
    try {
      const amount = ethers.utils.parseEther(airdropAmount.toString());
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.setAirdropAmount(amount);
      await tx.wait();
      showNotification("Airdrop amount updated successfully!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const updateReferralBonus = async () => {
    try {
      const amount = ethers.utils.parseEther(airdropBonus.toString());
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.setReferralBonus(amount);
      await tx.wait();
      showNotification("Referral bonus updated successfully!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const updateWithdrawTokens = async () => {
    try {
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.withdrawTokens();
      await tx.wait();
      showNotification("Tokens withdrawn successfully!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const handleUpdateFeeAmount = async (newAmount) => {
    try {
      setLoading(true);
      showNotification("Updating fee amount...", "info");
      const result = await updateFeeAmount(newAmount);
      if (result.success) {
        showNotification(result.message, "success");
        fetchAirdropDetails();
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeCollector = async (newCollector) => {
    try {
      setLoading(true);
      showNotification("Updating fee collector...", "info");
      const result = await updateFeeCollector(newCollector);
      if (result.success) {
        showNotification(result.message, "success");
        fetchAirdropDetails();
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFees = async () => {
    try {
      setLoading(true);
      showNotification("Withdrawing fees...", "info");
      const result = await withdrawFees();
      if (result.success) {
        showNotification(result.message, "success");
        fetchAirdropDetails();
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg_light v_light_blue_pro" data-spy="scroll">
      <MainHeader />
      <Banner
        airdropInfo={airdropInfo}
        activeUser={activeUser}
        handleParticipateWithoutReferral={handleParticipateWithoutReferral}
        handleParticipate={handleParticipate}
        setReferralAddress={setReferralAddress}
        referralAddress={referralAddress}
        loading={loading}
        account={account}
        setIsAdminModalOpen={setIsAdminModalOpen}
      />

      {/* <UserDashboard 
        activeUser={activeUser}
        airdropInfo={airdropInfo}
      /> */}

      <Footer />
      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        airdropInfo={airdropInfo}
        setAirdropAmount={setAirdropAmount}
        setAirdropBonus={setAirdropBonus}
        updateAirdropAmount={updateAirdropAmount}
        updateReferralBonus={updateReferralBonus}
        updateWithdrawTokens={updateWithdrawTokens}
        contract={contract}
        feeAmount={feeAmount}
        feeCollector={feeCollector}
        onUpdateFeeAmount={handleUpdateFeeAmount}
        onUpdateFeeCollector={handleUpdateFeeCollector}
        onWithdrawFees={handleWithdrawFees}
      />
    </div>
  );
};

export default index;