// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Enhanced BrainArk EPO with Cross-Chain Support
 * @dev Supports both direct payments and cross-chain payment verification
 */
contract BrainArkEPOCrossChain is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event CrossChainPurchase(
        address indexed buyer,
        string sourceChain,
        string paymentToken,
        uint256 paymentAmount,
        uint256 bakAmount,
        string sourceTxHash,
        uint256 timestamp
    );
    
    event DirectPurchase(
        address indexed buyer,
        uint256 bakAmount,
        uint256 timestamp
    );

    // Cross-chain purchase record
    struct CrossChainPurchaseRecord {
        address buyer;
        string sourceChain;
        string paymentToken;
        uint256 paymentAmount;
        uint256 bakAmount;
        string sourceTxHash;
        uint256 timestamp;
        bool processed;
    }
    
    // State variables
    uint256 public constant BAK_PRICE_USD = 0.02 * 10**18; // $0.02 with 18 decimals
    uint256 public constant TOTAL_BAK_SUPPLY = 100_000_000 * 10**18; // 100M BAK
    
    uint256 public totalBakSold;
    uint256 public totalUSDRaised;
    
    // Cross-chain purchase tracking
    mapping(string => bool) public processedTxHashes;
    mapping(address => uint256) public userPurchases;
    CrossChainPurchaseRecord[] public crossChainPurchases;
    
    // Admin addresses for cross-chain verification
    mapping(address => bool) public authorizedOracles;
    
    constructor() {
        // Set deployer as first authorized oracle
        authorizedOracles[msg.sender] = true;
    }

    /**
     * @notice Process cross-chain BAK purchase
     * @dev Only authorized oracles can call this function
     * @param buyer Address to receive BAK tokens
     * @param sourceChain Source blockchain (e.g., "ethereum", "bsc", "polygon")
     * @param paymentToken Payment token used (e.g., "USDT", "USDC")
     * @param paymentAmount Amount paid in payment token
     * @param sourceTxHash Transaction hash from source chain
     */
    function processCrossChainPurchase(
        address buyer,
        string memory sourceChain,
        string memory paymentToken,
        uint256 paymentAmount,
        string memory sourceTxHash
    ) external nonReentrant whenNotPaused {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        require(buyer != address(0), "Invalid buyer address");
        require(!processedTxHashes[sourceTxHash], "Transaction already processed");
        require(bytes(sourceTxHash).length > 0, "Invalid transaction hash");
        
        // Calculate BAK amount (assuming 1:1 USD conversion for stablecoins)
        uint256 usdValue = paymentAmount; // Assuming payment is in USD (USDT/USDC)
        uint256 bakAmount = (usdValue * 10**18) / BAK_PRICE_USD;
        
        // Check supply limits
        require(totalBakSold + bakAmount <= TOTAL_BAK_SUPPLY, "Exceeds available supply");
        require(address(this).balance >= bakAmount, "Insufficient BAK balance in contract");
        
        // Mark transaction as processed
        processedTxHashes[sourceTxHash] = true;
        
        // Transfer BAK tokens to buyer
        (bool success, ) = payable(buyer).call{value: bakAmount}("");
        require(success, "BAK transfer failed");
        
        // Update statistics
        totalBakSold += bakAmount;
        totalUSDRaised += usdValue;
        userPurchases[buyer] += bakAmount;
        
        // Record purchase
        crossChainPurchases.push(CrossChainPurchaseRecord({
            buyer: buyer,
            sourceChain: sourceChain,
            paymentToken: paymentToken,
            paymentAmount: paymentAmount,
            bakAmount: bakAmount,
            sourceTxHash: sourceTxHash,
            timestamp: block.timestamp,
            processed: true
        }));
        
        emit CrossChainPurchase(
            buyer,
            sourceChain,
            paymentToken,
            paymentAmount,
            bakAmount,
            sourceTxHash,
            block.timestamp
        );
    }

    /**
     * @notice Direct BAK purchase with native currency
     * @dev For users who want to buy directly on BrainArk chain
     */
    function purchaseBAKDirect() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Payment required");
        
        // Calculate BAK amount (msg.value is in BAK, which equals USD value)
        uint256 usdValue = msg.value;
        uint256 bakAmount = (usdValue * 10**18) / BAK_PRICE_USD;
        
        // Check supply limits
        require(totalBakSold + bakAmount <= TOTAL_BAK_SUPPLY, "Exceeds available supply");
        require(address(this).balance >= bakAmount, "Insufficient BAK balance in contract");
        
        // Transfer BAK tokens to buyer
        (bool success, ) = payable(msg.sender).call{value: bakAmount}("");
        require(success, "BAK transfer failed");
        
        // Update statistics
        totalBakSold += bakAmount;
        totalUSDRaised += usdValue;
        userPurchases[msg.sender] += bakAmount;
        
        emit DirectPurchase(msg.sender, bakAmount, block.timestamp);
    }

    // Admin functions
    
    /**
     * @notice Add or remove authorized oracle
     * @param oracle Oracle address
     * @param authorized Whether oracle is authorized
     */
    function setAuthorizedOracle(address oracle, bool authorized) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        authorizedOracles[oracle] = authorized;
    }
    
    /**
     * @notice Emergency withdraw BAK tokens
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function emergencyWithdraw(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
    
    // View functions
    
    /**
     * @notice Get cross-chain purchase count
     */
    function getCrossChainPurchaseCount() external view returns (uint256) {
        return crossChainPurchases.length;
    }
    
    /**
     * @notice Check if transaction hash was processed
     */
    function isTransactionProcessed(string memory txHash) external view returns (bool) {
        return processedTxHashes[txHash];
    }
    
    /**
     * @notice Get contract statistics
     */
    function getStats() external view returns (
        uint256 totalSold,
        uint256 totalRaised,
        uint256 remainingSupply,
        uint256 contractBalance
    ) {
        return (
            totalBakSold,
            totalUSDRaised,
            TOTAL_BAK_SUPPLY - totalBakSold,
            address(this).balance
        );
    }
    
    // Receive function to accept BAK funding
    receive() external payable {}
}
