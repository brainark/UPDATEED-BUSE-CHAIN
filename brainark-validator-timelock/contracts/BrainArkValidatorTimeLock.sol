// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BrainArkValidatorTimeLock
 * @dev 30-year time-lock contract for 400M BAK validator tokens
 * Releases 13,333,333 BAK annually (1,111,111 per month) for validator rewards
 * Features automated release triggers, emergency pause, and transparent on-chain tracking
 */
contract BrainArkValidatorTimeLock is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant TOTAL_LOCKED_AMOUNT = 400_000_000 * 10**18; // 400M BAK
    uint256 public constant ANNUAL_RELEASE_AMOUNT = 13_333_333 * 10**18; // ~13.33M BAK per year
    uint256 public constant MONTHLY_RELEASE_AMOUNT = 1_111_111 * 10**18; // ~1.11M BAK per month
    uint256 public constant LOCK_DURATION = 30 * 365 days; // 30 years
    uint256 public constant RELEASE_INTERVAL = 30 days; // Monthly releases
    
    // State variables
    IERC20 public immutable bakToken;
    address public immutable validatorRewardDistributor;
    
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public totalReleased;
    uint256 public lastReleaseTime;
    uint256 public nextReleaseTime;
    
    // Emergency controls
    bool public emergencyWithdrawEnabled = false;
    uint256 public emergencyWithdrawDelay = 7 days;
    uint256 public emergencyWithdrawRequestTime;
    
    // Events
    event TokensReleased(uint256 amount, uint256 timestamp, uint256 totalReleased);
    event EmergencyWithdrawRequested(uint256 requestTime);
    event EmergencyWithdrawExecuted(uint256 amount, uint256 timestamp);
    event ValidatorRewardDistributorUpdated(address newDistributor);
    
    /**
     * @dev Constructor initializes the time-lock contract
     * @param _bakToken Address of the BAK token contract
     * @param _validatorRewardDistributor Address that will receive released tokens
     * @param _startTime Unix timestamp when lock starts (deployment time)
     */
    constructor(
        address _bakToken,
        address _validatorRewardDistributor,
        uint256 _startTime
    ) Ownable(msg.sender) {
        require(_bakToken != address(0), "Invalid BAK token address");
        require(_validatorRewardDistributor != address(0), "Invalid distributor address");
        require(_startTime >= block.timestamp, "Start time must be in the future");
        
        bakToken = IERC20(_bakToken);
        validatorRewardDistributor = _validatorRewardDistributor;
        startTime = _startTime;
        endTime = _startTime + LOCK_DURATION;
        nextReleaseTime = _startTime + RELEASE_INTERVAL;
    }
    
    /**
     * @dev Modifier to ensure release conditions are met
     */
    modifier canRelease() {
        require(block.timestamp >= nextReleaseTime, "Release time not reached");
        require(block.timestamp >= startTime, "Lock period not started");
        require(block.timestamp <= endTime, "Lock period ended");
        require(totalReleased < TOTAL_LOCKED_AMOUNT, "All tokens already released");
        _;
    }
    
    /**
     * @dev Release monthly allocation of BAK tokens to validator reward distributor
     * Can be called by anyone once release time is reached
     */
    function releaseTokens() external nonReentrant whenNotPaused canRelease {
        uint256 releaseAmount = calculateReleaseAmount();
        require(releaseAmount > 0, "No tokens to release");
        
        // Update state
        totalReleased += releaseAmount;
        lastReleaseTime = block.timestamp;
        nextReleaseTime = lastReleaseTime + RELEASE_INTERVAL;
        
        // Transfer tokens to validator reward distributor
        bakToken.safeTransfer(validatorRewardDistributor, releaseAmount);
        
        emit TokensReleased(releaseAmount, block.timestamp, totalReleased);
    }
    
    /**
     * @dev Calculate the amount of tokens to release based on current time
     * @return Amount of tokens to release
     */
    function calculateReleaseAmount() public view returns (uint256) {
        if (block.timestamp < nextReleaseTime || totalReleased >= TOTAL_LOCKED_AMOUNT) {
            return 0;
        }
        
        // Calculate how many release periods we've missed since the last release
        uint256 timeElapsed = block.timestamp - (nextReleaseTime - RELEASE_INTERVAL);
        uint256 periodsToRelease = (timeElapsed / RELEASE_INTERVAL);
        
        if (periodsToRelease == 0) {
            periodsToRelease = 1;
        }
        
        uint256 releaseAmount = periodsToRelease * MONTHLY_RELEASE_AMOUNT;
        
        // Don't exceed remaining locked amount
        uint256 remainingLocked = TOTAL_LOCKED_AMOUNT - totalReleased;
        if (releaseAmount > remainingLocked) {
            releaseAmount = remainingLocked;
        }
        
        return releaseAmount;
    }
    
    /**
     * @dev Get current contract status and metrics
     * @return locked Current locked amount
     * @return released Total released amount
     * @return nextRelease Next release timestamp
     * @return progress Release progress percentage (basis points)
     */
    function getContractStatus() external view returns (
        uint256 locked,
        uint256 released,
        uint256 nextRelease,
        uint256 progress
    ) {
        locked = TOTAL_LOCKED_AMOUNT - totalReleased;
        released = totalReleased;
        nextRelease = nextReleaseTime;
        progress = (totalReleased * 10000) / TOTAL_LOCKED_AMOUNT; // Basis points
    }
    
    /**
     * @dev Check if tokens are available for release
     * @return canRelease_ True if tokens can be released
     * @return releaseAmount Amount available for release
     * @return timeUntilRelease Seconds until next release
     */
    function checkReleaseStatus() external view returns (
        bool canRelease_,
        uint256 releaseAmount,
        uint256 timeUntilRelease
    ) {
        canRelease_ = block.timestamp >= nextReleaseTime && 
                      block.timestamp >= startTime && 
                      block.timestamp <= endTime &&
                      totalReleased < TOTAL_LOCKED_AMOUNT;
        
        releaseAmount = calculateReleaseAmount();
        
        if (block.timestamp < nextReleaseTime) {
            timeUntilRelease = nextReleaseTime - block.timestamp;
        } else {
            timeUntilRelease = 0;
        }
    }
    
    /**
     * @dev Emergency pause function (only owner)
     * Pauses all releases in case of security issues
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Request emergency withdrawal (only owner)
     * Starts a time delay before emergency withdrawal can be executed
     */
    function requestEmergencyWithdraw() external onlyOwner {
        emergencyWithdrawEnabled = true;
        emergencyWithdrawRequestTime = block.timestamp;
        emit EmergencyWithdrawRequested(block.timestamp);
    }
    
    /**
     * @dev Execute emergency withdrawal after delay (only owner)
     * Can withdraw remaining tokens in case of extreme emergency
     */
    function executeEmergencyWithdraw() external onlyOwner {
        require(emergencyWithdrawEnabled, "Emergency withdraw not enabled");
        require(
            block.timestamp >= emergencyWithdrawRequestTime + emergencyWithdrawDelay,
            "Emergency withdraw delay not met"
        );
        
        uint256 remainingBalance = bakToken.balanceOf(address(this));
        require(remainingBalance > 0, "No tokens to withdraw");
        
        bakToken.safeTransfer(owner(), remainingBalance);
        emergencyWithdrawEnabled = false;
        
        emit EmergencyWithdrawExecuted(remainingBalance, block.timestamp);
    }
    
    /**
     * @dev Update validator reward distributor address (only owner)
     * @param _newDistributor New distributor address
     */
    function updateValidatorRewardDistributor(address _newDistributor) external onlyOwner {
        require(_newDistributor != address(0), "Invalid distributor address");
        // Note: This doesn't change the immutable variable, but could be used with a proxy pattern
        emit ValidatorRewardDistributorUpdated(_newDistributor);
    }
    
    /**
     * @dev View function to get lock parameters
     * @return totalLocked Total locked amount
     * @return annualRelease Annual release amount
     * @return monthlyRelease Monthly release amount
     * @return lockDuration Total lock duration in seconds
     * @return startTimestamp Lock start timestamp
     * @return endTimestamp Lock end timestamp
     */
    function getLockParameters() external view returns (
        uint256 totalLocked,
        uint256 annualRelease,
        uint256 monthlyRelease,
        uint256 lockDuration,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) {
        return (
            TOTAL_LOCKED_AMOUNT,
            ANNUAL_RELEASE_AMOUNT,
            MONTHLY_RELEASE_AMOUNT,
            LOCK_DURATION,
            startTime,
            endTime
        );
    }
    
    /**
     * @dev Calculate total releases over the entire 30-year period
     * @return totalMonths Total number of monthly releases
     * @return projectedTotal Projected total amount to be released
     */
    function getProjectedReleases() external pure returns (
        uint256 totalMonths,
        uint256 projectedTotal
    ) {
        totalMonths = 30 * 12; // 360 months
        projectedTotal = totalMonths * MONTHLY_RELEASE_AMOUNT;
    }
}