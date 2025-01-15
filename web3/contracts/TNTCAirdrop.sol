// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20Extended is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract TNTCAirdrop is Ownable, ReentrancyGuard {
    IERC20Extended public token;
    
    string public airdropName;
    string public airdropDescription;
    
    uint256 public airdropAmount = 5 * 10**18; // 100 tokens
    uint256 public referralBonus = 1 * 10**18;  // 20 tokens
    uint256 public startTime;
    uint256 public endTime;

    // Fee management
    address public feeCollector;
    uint256 public feeAmount;

    address[] public participantAddresses;

    struct ParticipantInfo {
        address userAddress;
        bool hasParticipated;
        uint256 referralCount;
        address referrer;
        uint256 totalEarned;
        uint256 participationTime;
        uint256 feePaid;
    }
    
    mapping(address => bool) public hasParticipated;
    mapping(address => uint256) public referralCount;
    mapping(address => address) public referredBy;
    mapping(address => uint256) public feesPaid;
    
    // Events
event AirdropClaimed(address indexed user, uint256 amount);
    event ReferralBonusClaimed(address indexed referrer, address indexed referee, uint256 amount);
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);
    event TransferFailed(address indexed from, address indexed to, uint256 amount);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event FeeAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event FeePaid(address indexed user, uint256 amount);
    event StartTimeUpdated(uint256 newStartTime);
    event EndTimeUpdated(uint256 newEndTime);
    event AirdropTimingUpdated(uint256 newStartTime, uint256 newEndTime);
    
    constructor(
        address _tokenAddress,
        uint256 _startTime,
        uint256 _endTime,
        string memory _airdropName,
        string memory _airdropDescription
    ) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_startTime < _endTime, "Invalid time range");
        
        token = IERC20Extended(_tokenAddress);
        startTime = _startTime;
        endTime = _endTime;
        airdropName = _airdropName;
        airdropDescription = _airdropDescription;
        feeCollector = msg.sender; // Initially set fee collector as deployer
    }

    // Fee management functions
    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }

    function setFeeAmount(uint256 _newFeeAmount) external onlyOwner {
        uint256 oldAmount = feeAmount;
        feeAmount = _newFeeAmount;
        emit FeeAmountUpdated(oldAmount, _newFeeAmount);
    }
    
    modifier isActive() {
        require(_isAirdropActive(), "Airdrop is not active");
        _;
    }

    function _isAirdropActive() internal view returns (bool) {
        return (block.timestamp >= startTime && block.timestamp <= endTime);
    }
    
    function participate(address referrer) external payable nonReentrant isActive {
        require(!hasParticipated[msg.sender], "Already participated");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(token.balanceOf(address(this)) >= airdropAmount, "Insufficient tokens");
        
        // Handle fee
        if (feeAmount > 0) {
            require(msg.value >= feeAmount, "Insufficient fee");
            (bool success, ) = feeCollector.call{value: feeAmount}("");
            require(success, "Fee transfer failed");
            
            // Refund excess payment
            if (msg.value > feeAmount) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - feeAmount}("");
                require(refundSuccess, "Refund failed");
            }
            feesPaid[msg.sender] = feeAmount;
            emit FeePaid(msg.sender, feeAmount);
        }

        hasParticipated[msg.sender] = true;
        participantAddresses.push(msg.sender);
        
        require(token.transfer(msg.sender, airdropAmount), "Token transfer failed");
        emit AirdropClaimed(msg.sender, airdropAmount);
        
        if (referrer != address(0) && hasParticipated[referrer]) {
            referredBy[msg.sender] = referrer;
            referralCount[referrer]++;
            
            if (token.balanceOf(address(this)) >= referralBonus) {
                require(token.transfer(referrer, referralBonus), "Referral bonus transfer failed");
                emit ReferralBonusClaimed(referrer, msg.sender, referralBonus);
            }
        }
    }
    
    function participateWithoutReferral() external payable nonReentrant isActive {
        require(!hasParticipated[msg.sender], "Already participated");
        require(token.balanceOf(address(this)) >= airdropAmount, "Insufficient tokens");
        
        // Handle fee
        if (feeAmount > 0) {
            require(msg.value >= feeAmount, "Insufficient fee");
            (bool success, ) = feeCollector.call{value: feeAmount}("");
            require(success, "Fee transfer failed");
            
            // Refund excess payment
            if (msg.value > feeAmount) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - feeAmount}("");
                require(refundSuccess, "Refund failed");
            }
            feesPaid[msg.sender] = feeAmount;
            emit FeePaid(msg.sender, feeAmount);
        }

        hasParticipated[msg.sender] = true;
        participantAddresses.push(msg.sender);
        
        require(token.transfer(msg.sender, airdropAmount), "Token transfer failed");
        emit AirdropClaimed(msg.sender, airdropAmount);
    }
    
    // Admin functions
    function setAirdropAmount(uint256 _amount) external onlyOwner {
        airdropAmount = _amount;
    }
    
    function setReferralBonus(uint256 _amount) external onlyOwner {
        referralBonus = _amount;
    }
    
    function withdrawTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(token.transfer(owner(), balance), "Token transfer failed");
    }

    // Withdraw collected fees
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = feeCollector.call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }
    
    // View functions
    function getReferralCount(address user) external view returns (uint256) {
        return referralCount[user];
    }
    
    function getReferrer(address user) external view returns (address) {
        return referredBy[user];
    }

// Admin functions for timer management
function setStartTime(uint256 _newStartTime) external onlyOwner {
    require(_newStartTime < endTime, "Start time must be before end time");
    require(_newStartTime > block.timestamp, "Start time must be in the future");
    startTime = _newStartTime;
    emit StartTimeUpdated(_newStartTime);
}

function setEndTime(uint256 _newEndTime) external onlyOwner {
    require(_newEndTime > startTime, "End time must be after start time");
    require(_newEndTime > block.timestamp, "End time must be in the future");
    endTime = _newEndTime;
    emit EndTimeUpdated(_newEndTime);
}

function updateAirdropTiming(uint256 _newStartTime, uint256 _newEndTime) external onlyOwner {
    require(_newStartTime < _newEndTime, "Invalid time range");
    require(_newEndTime > block.timestamp, "End time must be in the future");
    startTime = _newStartTime;
    endTime = _newEndTime;
    emit AirdropTimingUpdated(_newStartTime, _newEndTime);
}
    
    
    // Get complete airdrop information
    function getAirdropInfo() external view returns (
        string memory name,
        string memory description,
        uint256 baseAmount,
        uint256 referralAmount,
        uint256 start,
        uint256 end,
        uint256 remainingTokens,
        uint256 totalParticipants,
        bool isAirdropActive,
        uint256 currentFeeAmount,
        address currentFeeCollector,
        uint256 totalFeesCollected
    ) {
        return (
            airdropName,
            airdropDescription,
            airdropAmount,
            referralBonus,
            startTime,
            endTime,
            token.balanceOf(address(this)),
            getTotalParticipants(),
            _isAirdropActive(),
            feeAmount,
            feeCollector,
            address(this).balance
        );
    }
    
    function getTokenInfo() external view returns (
        address tokenAddress,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        uint256 airdropContractBalance
    ) {
        return (
            address(token),
            token.name(),
            token.symbol(),
            token.decimals(),
            token.totalSupply(),
            token.balanceOf(address(this))
        );
    }

    function getUserParticipationInfo(address user) public view returns (
        bool hasParticipated_,
        uint256 referralCount_,
        address referrer_,
        uint256 totalEarned,
        uint256 feePaid_
    ) {
        hasParticipated_ = hasParticipated[user];
        referralCount_ = referralCount[user];
        referrer_ = referredBy[user];
        totalEarned = hasParticipated_ ? airdropAmount : 0;
        totalEarned += referralCount_ * referralBonus;
        feePaid_ = feesPaid[user];
    }

    function getAllParticipants() external view returns (ParticipantInfo[] memory) {
        uint256 totalParticipants = participantAddresses.length;
        ParticipantInfo[] memory participants = new ParticipantInfo[](totalParticipants);
        
        for (uint256 i = 0; i < totalParticipants; i++) {
            address participant = participantAddresses[i];
            (
                bool hasParticipated_,
                uint256 referralCount_,
                address referrer_,
                uint256 totalEarned,
                uint256 feePaid_
            ) = getUserParticipationInfo(participant);
            
            participants[i] = ParticipantInfo({
                userAddress: participant,
                hasParticipated: hasParticipated_,
                referralCount: referralCount_,
                referrer: referrer_,
                totalEarned: totalEarned,
                participationTime: block.timestamp,
                feePaid: feePaid_
            });
        }
        
        return participants;
    }

    function getTotalParticipants() public view returns (uint256) {
        return participantAddresses.length;
    }

    // Allow contract to receive BNB
    receive() external payable {}
}