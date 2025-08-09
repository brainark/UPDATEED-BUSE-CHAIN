// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Enhanced BrainArk EPO (Early Public Offering) Contract
 * @dev Allows users to purchase BAK tokens with various payment tokens
 * @notice Fixed price of $0.02 per BAK token, with multi-wallet treasury management
 */
contract BrainArkEPO is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Events
    event TokenPurchase(
        address indexed buyer,
        address indexed paymentToken,
        uint256 paymentAmount,
        uint256 bakAmount,
        uint256 usdValue,
        address treasuryWallet,
        uint256 timestamp
    );
    
    event PriceUpdated(
        uint256 newPriceUSD,
        uint256 timestamp
    );
    
    event PaymentTokenUpdated(
        address indexed token,
        bool enabled,
        uint256 priceUSD,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        address indexed token,
        uint256 amount,
        address indexed to,
        uint256 timestamp
    );

    event TreasuryWalletUpdated(
        address indexed token,
        address indexed oldWallet,
        address indexed newWallet,
        uint256 timestamp
    );

    // Structs
    struct PaymentToken {
        bool enabled;
        uint8 decimals;
        uint256 priceUSD; // Price in USD with 18 decimals
        uint256 minPurchaseUSD; // Minimum purchase in USD
        uint256 maxPurchaseUSD; // Maximum purchase in USD
        string symbol;
        address treasuryWallet; // Specific wallet for this token
    }

    struct PurchaseInfo {
        address buyer;
        address paymentToken;
        uint256 paymentAmount;
        uint256 bakAmount;
        uint256 usdValue;
        uint256 timestamp;
    }

    struct EPOStats {
        uint256 totalBakSold;
        uint256 totalUSDRaised;
        uint256 totalPurchases;
        uint256 remainingSupply;
        uint256 bakPriceUSD;
        bool isActive;
    }

    struct WalletConfig {
        address ethWallet;      // For ETH payments
        address usdtWallet;     // For USDT payments
        address usdcWallet;     // For USDC payments
        address bnbWallet;      // For BNB payments
        address defaultWallet;  // Fallback wallet
    }

    // State variables
    uint256 public constant BAK_PRICE_USD = 0.02 * 10**18; // $0.02 with 18 decimals
    uint256 public constant TOTAL_BAK_SUPPLY = 100_000_000 * 10**18; // 100M BAK
    uint256 public constant USD_DECIMALS = 18;
    
    // Payment tokens configuration
    mapping(address => PaymentToken) public paymentTokens;
    address[] public paymentTokenList;
    
    // Purchase tracking
    mapping(address => uint256) public userPurchases; // Total BAK purchased by user
    mapping(address => PurchaseInfo[]) public userPurchaseHistory;
    PurchaseInfo[] public allPurchases;
    
    // Statistics
    uint256 public totalBakSold;
    uint256 public totalUSDRaised;
    
    // Treasury wallet configuration
    WalletConfig public walletConfig;
    
    // Contract funding (BAK tokens are sent from this wallet)
    address public immutable fundingWallet;

    constructor(
        address _fundingWallet,
        address _ethWallet,
        address _usdtWallet,
        address _usdcWallet,
        address _bnbWallet,
        address _defaultWallet
    ) {
        require(_fundingWallet != address(0), "Invalid funding wallet");
        require(_defaultWallet != address(0), "Invalid default wallet");
        
        fundingWallet = _fundingWallet;
        
        walletConfig = WalletConfig({
            ethWallet: _ethWallet != address(0) ? _ethWallet : _defaultWallet,
            usdtWallet: _usdtWallet != address(0) ? _usdtWallet : _defaultWallet,
            usdcWallet: _usdcWallet != address(0) ? _usdcWallet : _defaultWallet,
            bnbWallet: _bnbWallet != address(0) ? _bnbWallet : _defaultWallet,
            defaultWallet: _defaultWallet
        });
    }

    /**
     * @notice Purchase BAK tokens with supported payment tokens
     * @param paymentToken Address of the payment token
     * @param paymentAmount Amount of payment token to spend
     * @param minBakAmount Minimum BAK tokens expected (slippage protection)
     */
    function purchaseBAK(
        address paymentToken,
        uint256 paymentAmount,
        uint256 minBakAmount
    ) external payable nonReentrant whenNotPaused {
        require(paymentTokens[paymentToken].enabled, "Payment token not supported");
        require(paymentAmount > 0, "Payment amount must be greater than 0");
        
        PaymentToken memory token = paymentTokens[paymentToken];
        
        // Calculate USD value and BAK amount
        (uint256 usdValue, uint256 bakAmount) = calculatePurchase(paymentToken, paymentAmount);
        
        // Validate purchase limits
        require(usdValue >= token.minPurchaseUSD, "Below minimum purchase amount");
        require(usdValue <= token.maxPurchaseUSD, "Above maximum purchase amount");
        
        // Slippage protection
        require(bakAmount >= minBakAmount, "Slippage tolerance exceeded");
        
        // Check supply limits
        require(totalBakSold + bakAmount <= TOTAL_BAK_SUPPLY, "Exceeds available supply");
        
        // Determine treasury wallet for this payment
        address treasuryWallet = getTreasuryWallet(paymentToken);
        
        // Transfer payment token from user to treasury
        if (paymentToken == address(0)) {
            // ETH payment
            require(msg.value == paymentAmount, "Incorrect ETH amount");
            payable(treasuryWallet).transfer(paymentAmount);
        } else {
            // ERC20 token payment
            IERC20(paymentToken).safeTransferFrom(msg.sender, treasuryWallet, paymentAmount);
        }
        
        // Transfer BAK tokens to user (from funding wallet)
        _transferBAKFromFunding(msg.sender, bakAmount);
        
        // Update statistics
        totalBakSold += bakAmount;
        totalUSDRaised += usdValue;
        userPurchases[msg.sender] += bakAmount;
        
        // Record purchase
        PurchaseInfo memory purchase = PurchaseInfo({
            buyer: msg.sender,
            paymentToken: paymentToken,
            paymentAmount: paymentAmount,
            bakAmount: bakAmount,
            usdValue: usdValue,
            timestamp: block.timestamp
        });
        
        userPurchaseHistory[msg.sender].push(purchase);
        allPurchases.push(purchase);
        
        emit TokenPurchase(
            msg.sender,
            paymentToken,
            paymentAmount,
            bakAmount,
            usdValue,
            treasuryWallet,
            block.timestamp
        );
    }

    /**
     * @notice Get appropriate treasury wallet for payment token
     * @param paymentToken Address of the payment token
     * @return Treasury wallet address for the token
     */
    function getTreasuryWallet(address paymentToken) public view returns (address) {
        // If token has specific wallet configured, use it
        if (paymentTokens[paymentToken].treasuryWallet != address(0)) {
            return paymentTokens[paymentToken].treasuryWallet;
        }
        
        // Otherwise use configured wallet based on token type
        if (paymentToken == address(0)) {
            return walletConfig.ethWallet;
        }
        
        // For ERC20 tokens, try to match by symbol or use default
        string memory symbol = paymentTokens[paymentToken].symbol;
        
        if (keccak256(bytes(symbol)) == keccak256(bytes("USDT"))) {
            return walletConfig.usdtWallet;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("USDC"))) {
            return walletConfig.usdcWallet;
        } else if (keccak256(bytes(symbol)) == keccak256(bytes("BNB"))) {
            return walletConfig.bnbWallet;
        }
        
        return walletConfig.defaultWallet;
    }

    /**
     * @notice Calculate purchase amounts
     * @param paymentToken Address of payment token
     * @param paymentAmount Amount of payment token
     * @return usdValue USD value of the purchase
     * @return bakAmount BAK tokens to receive
     */
    function calculatePurchase(
        address paymentToken,
        uint256 paymentAmount
    ) public view returns (uint256 usdValue, uint256 bakAmount) {
        require(paymentTokens[paymentToken].enabled, "Payment token not supported");
        
        PaymentToken memory token = paymentTokens[paymentToken];
        
        // Calculate USD value
        usdValue = (paymentAmount * token.priceUSD) / (10 ** token.decimals);
        
        // Calculate BAK amount based on fixed price
        bakAmount = (usdValue * 10**18) / BAK_PRICE_USD;
        
        return (usdValue, bakAmount);
    }

    /**
     * @notice Get purchase quote
     * @param paymentToken Address of payment token
     * @param paymentAmount Amount of payment token
     * @return bakAmount BAK tokens to receive
     * @return usdValue USD value of purchase
     * @return effectivePrice Effective price per BAK
     */
    function getQuote(
        address paymentToken,
        uint256 paymentAmount
    ) external view returns (
        uint256 bakAmount,
        uint256 usdValue,
        uint256 effectivePrice
    ) {
        (usdValue, bakAmount) = calculatePurchase(paymentToken, paymentAmount);
        effectivePrice = BAK_PRICE_USD;
        
        return (bakAmount, usdValue, effectivePrice);
    }

    /**
     * @notice Transfer BAK tokens from contract to recipient
     * @param to Recipient address
     * @param amount Amount of BAK tokens
     */
    function _transferBAKFromFunding(address to, uint256 amount) internal {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient BAK balance");
        
        // Transfer native BAK tokens from contract to recipient
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "BAK transfer failed");
    }

    // Admin functions
    
    /**
     * @notice Add or update payment token with optional treasury wallet
     * @param token Token address (address(0) for ETH)
     * @param enabled Whether token is enabled
     * @param decimals Token decimals
     * @param priceUSD Token price in USD (18 decimals)
     * @param minPurchaseUSD Minimum purchase in USD
     * @param maxPurchaseUSD Maximum purchase in USD
     * @param symbol Token symbol
     * @param treasuryWallet Specific treasury wallet for this token (optional)
     */
    function updatePaymentToken(
        address token,
        bool enabled,
        uint8 decimals,
        uint256 priceUSD,
        uint256 minPurchaseUSD,
        uint256 maxPurchaseUSD,
        string memory symbol,
        address treasuryWallet
    ) external onlyOwner {
        require(priceUSD > 0, "Invalid price");
        require(maxPurchaseUSD > minPurchaseUSD, "Invalid purchase limits");
        
        // Add to list if new and enabled
        if (!paymentTokens[token].enabled && enabled) {
            paymentTokenList.push(token);
        }
        
        paymentTokens[token] = PaymentToken({
            enabled: enabled,
            decimals: decimals,
            priceUSD: priceUSD,
            minPurchaseUSD: minPurchaseUSD,
            maxPurchaseUSD: maxPurchaseUSD,
            symbol: symbol,
            treasuryWallet: treasuryWallet
        });
        
        emit PaymentTokenUpdated(token, enabled, priceUSD, block.timestamp);
    }

    /**
     * @notice Update treasury wallet for specific token
     * @param token Token address
     * @param newWallet New treasury wallet address
     */
    function updateTokenTreasuryWallet(
        address token,
        address newWallet
    ) external onlyOwner {
        require(paymentTokens[token].enabled, "Token not configured");
        require(newWallet != address(0), "Invalid wallet address");
        
        address oldWallet = paymentTokens[token].treasuryWallet;
        paymentTokens[token].treasuryWallet = newWallet;
        
        emit TreasuryWalletUpdated(token, oldWallet, newWallet, block.timestamp);
    }

    /**
     * @notice Update wallet configuration
     * @param _ethWallet ETH treasury wallet
     * @param _usdtWallet USDT treasury wallet
     * @param _usdcWallet USDC treasury wallet
     * @param _bnbWallet BNB treasury wallet
     * @param _defaultWallet Default treasury wallet
     */
    function updateWalletConfig(
        address _ethWallet,
        address _usdtWallet,
        address _usdcWallet,
        address _bnbWallet,
        address _defaultWallet
    ) external onlyOwner {
        require(_defaultWallet != address(0), "Invalid default wallet");
        
        walletConfig = WalletConfig({
            ethWallet: _ethWallet != address(0) ? _ethWallet : _defaultWallet,
            usdtWallet: _usdtWallet != address(0) ? _usdtWallet : _defaultWallet,
            usdcWallet: _usdcWallet != address(0) ? _usdcWallet : _defaultWallet,
            bnbWallet: _bnbWallet != address(0) ? _bnbWallet : _defaultWallet,
            defaultWallet: _defaultWallet
        });
    }

    /**
     * @notice Update token price
     * @param token Token address
     * @param priceUSD New price in USD
     */
    function updateTokenPrice(address token, uint256 priceUSD) external onlyOwner {
        require(paymentTokens[token].enabled, "Token not supported");
        require(priceUSD > 0, "Invalid price");
        
        paymentTokens[token].priceUSD = priceUSD;
        emit PaymentTokenUpdated(token, true, priceUSD, block.timestamp);
    }

    /**
     * @notice Emergency withdraw funds
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            require(amount <= address(this).balance, "Insufficient ETH balance");
            payable(to).transfer(amount);
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
        
        emit FundsWithdrawn(token, amount, to, block.timestamp);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    
    /**
     * @notice Get wallet configuration
     * @return WalletConfig struct with all treasury wallets
     */
    function getWalletConfig() external view returns (WalletConfig memory) {
        return walletConfig;
    }

    /**
     * @notice Get user purchase history
     * @param user User address
     * @return Array of purchase info
     */
    function getUserPurchaseHistory(address user) external view returns (PurchaseInfo[] memory) {
        return userPurchaseHistory[user];
    }

    /**
     * @notice Get supported payment tokens
     * @return Array of token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return paymentTokenList;
    }

    /**
     * @notice Get EPO statistics
     * @return EPO stats struct
     */
    function getEPOStats() external view returns (EPOStats memory) {
        return EPOStats({
            totalBakSold: totalBakSold,
            totalUSDRaised: totalUSDRaised,
            totalPurchases: allPurchases.length,
            remainingSupply: TOTAL_BAK_SUPPLY - totalBakSold,
            bakPriceUSD: BAK_PRICE_USD,
            isActive: !paused()
        });
    }

    /**
     * @notice Get all purchases with pagination
     * @param offset Starting index
     * @param limit Number of purchases to return
     * @return Array of purchase info
     */
    function getAllPurchases(
        uint256 offset,
        uint256 limit
    ) external view returns (PurchaseInfo[] memory) {
        require(offset < allPurchases.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > allPurchases.length) {
            end = allPurchases.length;
        }
        
        PurchaseInfo[] memory result = new PurchaseInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allPurchases[i];
        }
        
        return result;
    }

    // Receive ETH
    receive() external payable {
        // Allow contract to receive ETH for purchases
    }
}