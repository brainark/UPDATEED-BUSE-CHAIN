// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BrainArk Airdrop Contract
 * @dev Handles airdrop distribution with referral system
 * @notice Distributes 10M BAK tokens to 1M users with referral bonuses
 */
contract BrainArkAirdrop is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event AirdropClaimed(
        address indexed user,
        uint256 amount,
        address indexed referrer,
        uint256 referralBonus,
        uint256 timestamp
    );
    
    event ReferralBonusPaid(
        address indexed referrer,
        address indexed referee,
        uint256 bonus,
        uint256 timestamp
    );
    
    event DistributionTriggered(
        uint256 totalParticipants,
        uint256 totalDistributed,
        uint256 timestamp
    );
    
    event SocialTaskCompleted(
        address indexed user,
        string taskType,
        bool verified,
        uint256 timestamp
    );

    // Structs
    struct User {
        bool hasClaimed;
        bool twitterFollowed;
        bool twitterRetweeted;
        bool telegramJoined;
        address referrer;
        uint256 referralCount;
        uint256 totalEarned;
        uint256 claimTimestamp;
    }

    struct AirdropStats {
        uint256 totalParticipants;
        uint256 totalClaimed;
        uint256 totalReferralBonuses;
        uint256 remainingSupply;
        bool distributionActive;
        uint256 distributionStartTime;
    }

    // State variables
    mapping(address => User) public users;
    mapping(address => bool) public socialVerifiers; // Authorized verifiers for social tasks
    
    address[] public participants;
    
    // Airdrop configuration
    uint256 public constant TOTAL_AIRDROP_SUPPLY = 10_000_000 * 10**18; // 10M BAK
    uint256 public constant COINS_PER_USER = 10 * 10**18; // 10 BAK per user
    uint256 public constant TARGET_PARTICIPANTS = 1_000_000;
    uint256 public constant REFERRAL_BONUS = 3.2 * 10**18; // 3.2 BAK per referral
    uint256 public constant REFERRAL_POOL = 5_000_000 * 10**18; // 5M BAK for referrals
    
    // Distribution tracking
    uint256 public totalClaimed;
    uint256 public totalReferralBonuses;
    uint256 public distributionStartTime;
    bool public distributionActive;
    bool public distributionTriggered;
    
    // Funding wallet - 0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF
    address public immutable fundingWallet;

    constructor(address _fundingWallet) {
        require(_fundingWallet != address(0), "Invalid funding wallet");
        fundingWallet = _fundingWallet;
        distributionActive = true;
        distributionStartTime = block.timestamp;
    }

    /**
     * @notice Claim airdrop tokens with referral
     * @param referrer Address of the referrer (optional)
     */
    function claimAirdrop(address referrer) external nonReentrant whenNotPaused {
        require(distributionActive, "Distribution not active");
        require(!users[msg.sender].hasClaimed, "Already claimed");
        require(participants.length < TARGET_PARTICIPANTS, "Target participants reached");
        
        // Validate social tasks completion
        require(
            users[msg.sender].twitterFollowed && 
            users[msg.sender].twitterRetweeted && 
            users[msg.sender].telegramJoined,
            "Social tasks not completed"
        );
        
        // Validate referrer
        if (referrer != address(0)) {
            require(referrer != msg.sender, "Cannot refer yourself");
            require(users[referrer].hasClaimed, "Referrer must be a participant");
        }
        
        // Record user data
        users[msg.sender].hasClaimed = true;
        users[msg.sender].referrer = referrer;
        users[msg.sender].totalEarned = COINS_PER_USER;
        users[msg.sender].claimTimestamp = block.timestamp;
        
        participants.push(msg.sender);
        totalClaimed += COINS_PER_USER;
        
        uint256 referralBonus = 0;
        
        // Handle referral bonus
        if (referrer != address(0) && totalReferralBonuses + REFERRAL_BONUS <= REFERRAL_POOL) {
            users[referrer].referralCount++;
            users[referrer].totalEarned += REFERRAL_BONUS;
            totalReferralBonuses += REFERRAL_BONUS;
            referralBonus = REFERRAL_BONUS;
            
            emit ReferralBonusPaid(referrer, msg.sender, REFERRAL_BONUS, block.timestamp);
        }
        
        emit AirdropClaimed(
            msg.sender,
            COINS_PER_USER,
            referrer,
            referralBonus,
            block.timestamp
        );
        
        // Auto-trigger distribution when target is reached
        if (participants.length >= TARGET_PARTICIPANTS && !distributionTriggered) {
            _triggerDistribution();
        }
    }

    /**
     * @notice Verify social media tasks
     * @param user User address
     * @param taskType Type of task (twitter_follow, twitter_retweet, telegram_join)
     * @param verified Whether the task is verified
     */
    function verifySocialTask(
        address user,
        string memory taskType,
        bool verified
    ) external {
        require(socialVerifiers[msg.sender], "Not authorized verifier");
        
        if (keccak256(bytes(taskType)) == keccak256(bytes("twitter_follow"))) {
            users[user].twitterFollowed = verified;
        } else if (keccak256(bytes(taskType)) == keccak256(bytes("twitter_retweet"))) {
            users[user].twitterRetweeted = verified;
        } else if (keccak256(bytes(taskType)) == keccak256(bytes("telegram_join"))) {
            users[user].telegramJoined = verified;
        }
        
        emit SocialTaskCompleted(user, taskType, verified, block.timestamp);
    }

    /**
     * @notice Trigger distribution automatically when target is reached
     */
    function _triggerDistribution() internal {
        require(participants.length >= TARGET_PARTICIPANTS, "Target not reached");
        
        distributionTriggered = true;
        distributionActive = false;
        
        emit DistributionTriggered(
            participants.length,
            totalClaimed + totalReferralBonuses,
            block.timestamp
        );
    }

    /**
     * @notice Manual distribution trigger (owner only, emergency)
     */
    function triggerDistribution() external onlyOwner {
        require(!distributionTriggered, "Already triggered");
        _triggerDistribution();
    }

    /**
     * @notice Distribute tokens to users (called after distribution is triggered)
     * @param startIndex Starting index for batch processing
     * @param endIndex Ending index for batch processing
     */
    function distributeTokens(uint256 startIndex, uint256 endIndex) external onlyOwner {
        require(distributionTriggered, "Distribution not triggered");
        require(endIndex <= participants.length, "Invalid end index");
        require(startIndex < endIndex, "Invalid range");
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            address participant = participants[i];
            uint256 amount = users[participant].totalEarned;
            
            if (amount > 0) {
                // Transfer native BAK tokens from funding wallet to participant
                _transferFromFunding(participant, amount);
            }
        }
    }

    /**
     * @notice Transfer native BAK tokens to recipient
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function _transferFromFunding(address to, uint256 amount) internal {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        // Transfer native BAK tokens from contract to recipient
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "BAK transfer failed");
    }

    // Admin functions
    function addSocialVerifier(address verifier) external onlyOwner {
        socialVerifiers[verifier] = true;
    }

    function removeSocialVerifier(address verifier) external onlyOwner {
        socialVerifiers[verifier] = false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyStop() external onlyOwner {
        distributionActive = false;
    }

    // View functions
    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }

    function getAirdropStats() external view returns (AirdropStats memory) {
        return AirdropStats({
            totalParticipants: participants.length,
            totalClaimed: totalClaimed,
            totalReferralBonuses: totalReferralBonuses,
            remainingSupply: TOTAL_AIRDROP_SUPPLY + REFERRAL_POOL - totalClaimed - totalReferralBonuses,
            distributionActive: distributionActive,
            distributionStartTime: distributionStartTime
        });
    }

    function getParticipants(uint256 offset, uint256 limit) external view returns (address[] memory) {
        require(offset < participants.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > participants.length) {
            end = participants.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = participants[i];
        }
        
        return result;
    }

    function canClaim(address user) external view returns (bool) {
        return distributionActive && 
               !users[user].hasClaimed && 
               users[user].twitterFollowed && 
               users[user].twitterRetweeted && 
               users[user].telegramJoined &&
               participants.length < TARGET_PARTICIPANTS;
    }

    // Receive native BAK tokens for distribution
    receive() external payable {
        // Allow contract to receive native BAK tokens from funding wallet
    }
}