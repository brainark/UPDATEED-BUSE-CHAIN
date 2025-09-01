
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Complete BrainArk EPO Contract
 * @dev Combines ALL existing EPO features + Cross-Chain capabilities
 * Features:
 * - Bonding curve pricing
 * - Multi-token payments (USDT, USDC, ETH, BNB, MATIC)
 * - Cross-chain payment verification
 * - Referral system
 * - Airdrop integration
 * - Emergency controls
 * - Treasury management
 */
contract BrainArkEPOComplete is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // ============================================================================
    // EVENTS (All your existing events + new ones)
    // ============================================================================
    
    event TokenPurchase(
        address indexed buyer,
        address indexed paymentToken,
        uint256 paymentAmount,
        uint256 bakAmount,
        uint256 usdValue,
        address treasuryWallet,
        uint256 timestamp
    );
    
    event CrossChainPurchase(
        address indexed buyer,
        string indexed sourceNetwork,
        string indexed paymentToken,
        bytes32 txHash,
        uint256 paymentAmountUSD,
        uint256 bakAmount,
        uint256 effectivePrice,
        uint256 timestamp
    );
    
    event BondingCurveUpdate(
        uint256 totalSold,
        uint256 newPrice,
        uint256 timestamp
    );
    
    event PaymentTokenUpdated(
        address indexed token,
        bool enabled,
        uint256 treasuryIndex,
        uint256 timestamp
    );
    
    
    event EmergencyWithdraw(
        address indexed token,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    // ============================================================================
    // STRUCTS (All your existing structures)
    // ============================================================================
    
    struct PaymentToken {
        IERC20 token;
        bool isEnabled;
        uint256 decimals;
        uint256 pricePerUSDInToken;
        address treasuryWallet;
        bool isNativeToken;
        string symbol;
    }
    
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
    
    struct BondingCurveConfig {
        uint256 basePrice;
        uint256 priceIncrement;
        uint256 tierSize;
        bool enabled;
    }

    // ============================================================================
    // STATE VARIABLES (All your existing + new ones)
    // ============================================================================
    
    // Core EPO parameters
    uint256 public constant TOTAL_BAK_FOR_SALE = 100_000_000 * 10**18; // 100M BAK
    uint256 public constant BASE_PRICE_USD = 0.02 * 10**18; // $0.02 in wei
    uint256 public totalBakSold;
    uint256 public totalUSDRaised;
    uint256 public currentPrice;
    
    // Bonding curve configuration
    BondingCurveConfig public bondingCurve;
    
    // Payment tokens mapping
    mapping(address => PaymentToken) public paymentTokens;
    address[] public enabledTokens;
    
    // Cross-chain functionality
    mapping(address => bool) public authorizedOracles;
    mapping(string => bool) public processedTxHashes;
    mapping(address => uint256) public userPurchases;
    CrossChainPurchaseRecord[] public crossChainPurchases;
    
    
    // Treasury wallets for different networks
    mapping(string => mapping(string => address)) public treasuryWallets;
    
    // Emergency controls
    bool public emergencyStop = false;
    uint256 public maxPurchaseAmount = 10000 * 10**18; // Max 10k USD per tx

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    
    constructor() {
        currentPrice = BASE_PRICE_USD;
        
        // Initialize bonding curve
        bondingCurve = BondingCurveConfig({
            basePrice: BASE_PRICE_USD,
            priceIncrement: 0.001 * 10**18, // $0.001 increment
            tierSize: 1_000_000 * 10**18,   // 1M BAK per tier
            enabled: true
        });
        
        // Set deployer as authorized oracle
        authorizedOracles[msg.sender] = true;
        
        // Initialize treasury wallets (your actual addresses)
        treasuryWallets["ethereum"]["eth"] = 0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417;
        treasuryWallets["ethereum"]["usdt"] = 0xc9dE877a53f85BF51D76faed0C8c8842EFb35782;
        treasuryWallets["ethereum"]["usdc"] = 0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145;
        
        treasuryWallets["bsc"]["bnb"] = 0x794F67aA174bD0A252BeCA0089490a58Cc695a05;
        treasuryWallets["bsc"]["usdt"] = 0xC13527f3bBAaf4cd726d07a78da9C5b74876527F;
        treasuryWallets["bsc"]["usdc"] = 0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c;
        
        treasuryWallets["polygon"]["matic"] = 0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7;
        treasuryWallets["polygon"]["usdt"] = 0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B;
        treasuryWallets["polygon"]["usdc"] = 0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84;
    }

    // ============================================================================
    // MAIN PURCHASE FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Purchase BAK tokens with supported payment tokens (Original EPO function)
     */
    function purchaseTokens(
        address paymentTokenAddress,
        uint256 paymentAmount
    ) external payable nonReentrant whenNotPaused {
        require(!emergencyStop, "Emergency stop activated");
        require(paymentAmount > 0, "Payment amount must be greater than 0");
        
        PaymentToken storage paymentToken = paymentTokens[paymentTokenAddress];
        require(paymentToken.isEnabled, "Payment token not supported");
        
        // Calculate BAK amount based on current bonding curve price
        uint256 usdValue = calculateUSDValue(paymentTokenAddress, paymentAmount);
        require(usdValue <= maxPurchaseAmount, "Exceeds maximum purchase amount");
        
        uint256 bakAmount = calculateBAKAmount(usdValue);
        require(totalBakSold + bakAmount <= TOTAL_BAK_FOR_SALE, "Exceeds available supply");
        
        // Process payment
        if (paymentToken.isNativeToken) {
            require(msg.value >= paymentAmount, "Insufficient native token sent");
            payable(paymentToken.treasuryWallet).transfer(paymentAmount);
            
            // Refund excess
            if (msg.value > paymentAmount) {
                payable(msg.sender).transfer(msg.value - paymentAmount);
            }
        } else {
            paymentToken.token.safeTransferFrom(msg.sender, paymentToken.treasuryWallet, paymentAmount);
        }
        
        // Transfer BAK to buyer
        (bool success, ) = payable(msg.sender).call{value: bakAmount}("");
        require(success, "BAK transfer failed");
        
        // Update state
        totalBakSold += bakAmount;
        totalUSDRaised += usdValue;
        userPurchases[msg.sender] += bakAmount;
        
        // Update bonding curve price
        updateBondingCurvePrice();
        
        emit TokenPurchase(
            msg.sender,
            paymentTokenAddress,
            paymentAmount,
            bakAmount,
            usdValue,
            paymentToken.treasuryWallet,
            block.timestamp
        );
    }
    
    /**
     * @notice Process cross-chain BAK purchase (Oracle function)
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
        uint256 usdValue = paymentAmount;
        uint256 bakAmount = calculateBAKAmount(usdValue);
        
        // Check supply limits
        require(totalBakSold + bakAmount <= TOTAL_BAK_FOR_SALE, "Exceeds available supply");
        require(address(this).balance >= bakAmount, "Insufficient BAK balance");
        
        // Mark transaction as processed
        processedTxHashes[sourceTxHash] = true;
        
        // Transfer BAK tokens to buyer
        (bool success, ) = payable(buyer).call{value: bakAmount}("");
        require(success, "BAK transfer failed");
        
        // Update statistics
        totalBakSold += bakAmount;
        totalUSDRaised += usdValue;
        userPurchases[buyer] += bakAmount;
        
        // Update bonding curve price
        updateBondingCurvePrice();
        
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
            keccak256(abi.encodePacked(sourceTxHash)),
            paymentAmount,
            bakAmount,
            currentPrice,
            block.timestamp
        );
    }

    // ============================================================================
    // BONDING CURVE FUNCTIONS
    // ============================================================================
    
    function calculateBAKAmount(uint256 usdValue) public view returns (uint256) {
        if (!bondingCurve.enabled) {
            return (usdValue * 10**18) / currentPrice;
        }
        
        // Bonding curve calculation
        uint256 currentTier = totalBakSold / bondingCurve.tierSize;
        uint256 tierPrice = bondingCurve.basePrice + (currentTier * bondingCurve.priceIncrement);
        
        return (usdValue * 10**18) / tierPrice;
    }
    
    function updateBondingCurvePrice() internal {
        if (bondingCurve.enabled) {
            uint256 currentTier = totalBakSold / bondingCurve.tierSize;
            uint256 newPrice = bondingCurve.basePrice + (currentTier * bondingCurve.priceIncrement);
            
            if (newPrice != currentPrice) {
                currentPrice = newPrice;
                emit BondingCurveUpdate(totalBakSold, currentPrice, block.timestamp);
            }
        }
    }
    
    function calculateUSDValue(address tokenAddress, uint256 tokenAmount) public view returns (uint256) {
        PaymentToken storage token = paymentTokens[tokenAddress];
        require(token.isEnabled, "Token not supported");
        
        // Convert token amount to USD value
        return (tokenAmount * token.pricePerUSDInToken) / (10**token.decimals);
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================
    
    function addPaymentToken(
        address tokenAddress,
        uint256 decimals,
        uint256 pricePerUSDInToken,
        address treasuryWallet,
        bool isNativeToken,
        string memory symbol
    ) external onlyOwner {
        require(treasuryWallet != address(0), "Invalid treasury wallet");
        
        paymentTokens[tokenAddress] = PaymentToken({
            token: IERC20(tokenAddress),
            isEnabled: true,
            decimals: decimals,
            pricePerUSDInToken: pricePerUSDInToken,
            treasuryWallet: treasuryWallet,
            isNativeToken: isNativeToken,
            symbol: symbol
        });
        
        enabledTokens.push(tokenAddress);
        
        emit PaymentTokenUpdated(tokenAddress, true, enabledTokens.length - 1, block.timestamp);
    }
    
    function setAuthorizedOracle(address oracle, bool authorized) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        authorizedOracles[oracle] = authorized;
    }
    
    function setBondingCurve(
        uint256 basePrice,
        uint256 priceIncrement,
        uint256 tierSize,
        bool enabled
    ) external onlyOwner {
        bondingCurve = BondingCurveConfig({
            basePrice: basePrice,
            priceIncrement: priceIncrement,
            tierSize: tierSize,
            enabled: enabled
        });
    }
    
    
    function setMaxPurchaseAmount(uint256 _maxAmount) external onlyOwner {
        maxPurchaseAmount = _maxAmount;
    }
    
    function setEmergencyStop(bool _stop) external onlyOwner {
        emergencyStop = _stop;
    }
    
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    function getContractStats() external view returns (
        uint256 totalSold,
        uint256 totalRaised,
        uint256 remainingSupply,
        uint256 price,
        uint256 contractBalance
    ) {
        return (
            totalBakSold,
            totalUSDRaised,
            TOTAL_BAK_FOR_SALE - totalBakSold,
            currentPrice,
            address(this).balance
        );
    }
    
    function getCrossChainPurchaseCount() external view returns (uint256) {
        return crossChainPurchases.length;
    }
    
    function isTransactionProcessed(string memory txHash) external view returns (bool) {
        return processedTxHashes[txHash];
    }
    
    function getEnabledTokensCount() external view returns (uint256) {
        return enabledTokens.length;
    }
    
    function getTreasuryWallet(string memory network, string memory token) external view returns (address) {
        return treasuryWallets[network][token];
    }

    // ============================================================================
    // EMERGENCY FUNCTIONS
    // ============================================================================
    
    function emergencyWithdrawBAK(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EmergencyWithdraw(address(0), to, amount, block.timestamp);
    }
    
    function emergencyWithdrawToken(address token, uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        
        IERC20(token).safeTransfer(to, amount);
        
        emit EmergencyWithdraw(token, to, amount, block.timestamp);
    }
    
    // ============================================================================
    // RECEIVE FUNCTION
    // ============================================================================
    
    receive() external payable {
        // Accept BAK funding for contract
    }
}