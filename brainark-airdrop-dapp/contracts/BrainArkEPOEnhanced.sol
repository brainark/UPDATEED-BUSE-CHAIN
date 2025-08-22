// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Enhanced BrainArk EPO Contract
 * @dev Combines your existing EPO with bonding curve and cross-chain capabilities
 */
contract BrainArkEPOEnhanced is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Events from your original contract
    event TokenPurchase(
        address indexed buyer,
        address indexed paymentToken,
        uint256 paymentAmount,
        uint256 bakAmount,
        uint256 usdValue,
        address treasuryWallet,
        uint256 timestamp
    );
    
    // New events for cross-chain
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
        uint256 priceUSD,
        uint256 timestamp
    );

    // Your existing structs
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

    struct WalletConfig {
        address ethWallet;      // For ETH payments
        address usdtWallet;     // For USDT payments
        address usdcWallet;     // For USDC payments
        address bnbWallet;      // For BNB payments
        address defaultWallet;  // Fallback wallet
    }

    // New structs for cross-chain
    struct CrossChainProof {
        bytes32 txHash;
        string sourceNetwork;
        string paymentToken;
        uint256 paymentAmountUSD;
        uint256 blockNumber;
        uint256 timestamp;
        bytes signature;
    }

    // Constants
    uint256 public constant BAK_PRICE_START = 0.02 * 10**18; // $0.02 starting price
    uint256 public constant BAK_PRICE_END = 0.04 * 10**18; // $0.04 ending price
    uint256 public constant TOTAL_BAK_SUPPLY = 100_000_000 * 10**18; // 100M BAK
    uint256 public constant USD_DECIMALS = 18;
    
    // Bonding curve parameters (enabled by default for production)
    bool public bondingCurveEnabled = true;
    uint256 public constant CURVE_STEEPNESS = 1000;
    uint256 public constant PRICE_INCREASE_FACTOR = (BAK_PRICE_END - BAK_PRICE_START) / (TOTAL_BAK_SUPPLY / 10**18);
    
    // Cross-chain security
    uint256 public constant SIGNATURE_EXPIRY = 1 hours;

    // Your existing state variables
    mapping(address => PaymentToken) public paymentTokens;
    address[] public paymentTokenList;
    mapping(address => uint256) public userPurchases;
    mapping(address => PurchaseInfo[]) public userPurchaseHistory;
    PurchaseInfo[] public allPurchases;
    
    uint256 public totalBakSold;
    uint256 public totalUSDRaised;
    WalletConfig public walletConfig;
    address public immutable fundingWallet;

    // New state variables for cross-chain
    mapping(bytes32 => bool) public processedPayments;
    mapping(string => mapping(string => address)) public crossChainTreasuries;
    uint256 public currentBakPrice;

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
        currentBakPrice = BAK_PRICE_START;
        
        walletConfig = WalletConfig({
            ethWallet: _ethWallet != address(0) ? _ethWallet : _defaultWallet,
            usdtWallet: _usdtWallet != address(0) ? _usdtWallet : _defaultWallet,
            usdcWallet: _usdcWallet != address(0) ? _usdcWallet : _defaultWallet,
            bnbWallet: _bnbWallet != address(0) ? _bnbWallet : _defaultWallet,
            defaultWallet: _defaultWallet
        });

        // Initialize cross-chain treasuries (USDT and USDC only)
        _initializeCrossChainTreasuries();
    }

    function _initializeCrossChainTreasuries() internal {
        // Ethereum treasuries (USDT and USDC only)
        crossChainTreasuries["ethereum"]["USDT"] = 0xc9dE877a53f85BF51D76faed0C8c8842EFb35782;
        crossChainTreasuries["ethereum"]["USDC"] = 0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145;
        
        // BSC treasuries (USDT and USDC only)
        crossChainTreasuries["bsc"]["USDT"] = 0xC13527f3bBAaf4cd726d07a78da9C5b74876527F;
        crossChainTreasuries["bsc"]["USDC"] = 0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c;
        
        // Polygon treasuries (USDT and USDC only)
        crossChainTreasuries["polygon"]["USDT"] = 0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B;
        crossChainTreasuries["polygon"]["USDC"] = 0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84;
    }

    /**
     * @notice Your existing purchaseBAK function (preserved)
     */
    function purchaseBAK(
        address paymentToken,
        uint256 paymentAmount,
        uint256 minBakAmount
    ) external payable nonReentrant whenNotPaused {
        require(paymentTokens[paymentToken].enabled, "Payment token not supported");
        require(paymentAmount > 0, "Payment amount must be greater than 0");
        
        PaymentToken memory token = paymentTokens[paymentToken];
        
        // Calculate USD value and BAK amount (with optional bonding curve)
        (uint256 usdValue, uint256 bakAmount) = calculatePurchase(paymentToken, paymentAmount);
        
        // Validate purchase limits
        require(usdValue >= token.minPurchaseUSD, "Below minimum purchase amount");
        require(usdValue <= token.maxPurchaseUSD, "Above maximum purchase amount");
        require(bakAmount >= minBakAmount, "Slippage tolerance exceeded");
        require(totalBakSold + bakAmount <= TOTAL_BAK_SUPPLY, "Exceeds available supply");
        
        // Determine treasury wallet for this payment
        address treasuryWallet = getTreasuryWallet(paymentToken);
        
        // Transfer payment token from user to treasury
        if (paymentToken == address(0)) {
            require(msg.value == paymentAmount, "Incorrect ETH amount");
            payable(treasuryWallet).transfer(paymentAmount);
        } else {
            IERC20(paymentToken).safeTransferFrom(msg.sender, treasuryWallet, paymentAmount);
        }
        
        // Transfer BAK tokens to user
        _transferBAKFromFunding(msg.sender, bakAmount);
        
        // Update statistics
        totalBakSold += bakAmount;
        totalUSDRaised += usdValue;
        userPurchases[msg.sender] += bakAmount;
        
        // Update price if bonding curve is enabled
        if (bondingCurveEnabled) {
            currentBakPrice = _calculateNewPrice();
            emit BondingCurveUpdate(totalBakSold, currentBakPrice, block.timestamp);
        }
        
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
     * @notice NEW: Process cross-chain BAK purchase (no oracle required)
     */
    function processCrossChainPurchase(
        address buyer,
        CrossChainProof memory proof
    ) external onlyOwner nonReentrant whenNotPaused {
        require(buyer != address(0), "Invalid buyer");
        require(proof.txHash != bytes32(0), "Invalid tx hash");
        require(!processedPayments[proof.txHash], "Already processed");
        require(proof.timestamp + SIGNATURE_EXPIRY > block.timestamp, "Proof expired");
        require(_isValidNetwork(proof.sourceNetwork), "Invalid network");
        require(_isValidToken(proof.paymentToken), "Invalid payment token");
        
        // Calculate BAK amount using bonding curve
        uint256 bakAmount;
        if (bondingCurveEnabled) {
            (bakAmount,,) = calculateBondingCurve(proof.paymentAmountUSD);
        } else {
            bakAmount = (proof.paymentAmountUSD * 10**18) / BAK_PRICE_START;
        }
        
        require(bakAmount > 0, "Invalid BAK amount");
        require(totalBakSold + bakAmount <= TOTAL_BAK_SUPPLY, "Exceeds total supply");
        
        // Mark as processed
        processedPayments[proof.txHash] = true;
        
        // Transfer BAK tokens
        _transferBAKFromFunding(buyer, bakAmount);
        
        // Update state
        totalBakSold += bakAmount;
        totalUSDRaised += proof.paymentAmountUSD;
        userPurchases[buyer] += bakAmount;
        
        // Update price if bonding curve is enabled
        if (bondingCurveEnabled) {
            currentBakPrice = _calculateNewPrice();
            emit BondingCurveUpdate(totalBakSold, currentBakPrice, block.timestamp);
        }
        
        emit CrossChainPurchase(
            buyer,
            proof.sourceNetwork,
            proof.paymentToken,
            proof.txHash,
            proof.paymentAmountUSD,
            bakAmount,
            currentBakPrice,
            block.timestamp
        );
    }

    /**
     * @notice Calculate bonding curve from $0.02 to $0.04
     */
    function calculateBondingCurve(uint256 usdAmount) 
        public 
        view 
        returns (uint256 bakAmount, uint256 averagePrice, uint256 newPrice) 
    {
        if (!bondingCurveEnabled) {
            // Fixed price calculation
            bakAmount = (usdAmount * 10**18) / BAK_PRICE_START;
            averagePrice = BAK_PRICE_START;
            newPrice = BAK_PRICE_START;
            return (bakAmount, averagePrice, newPrice);
        }
        
        // Bonding curve calculation from $0.02 to $0.04
        uint256 currentPrice = getCurrentBakPrice();
        uint256 remainingUSD = usdAmount;
        uint256 totalBak = 0;
        uint256 tempSold = totalBakSold;
        
        uint256 increment = 1000 * 10**18; // 1000 BAK increments
        
        while (remainingUSD > 0 && tempSold < TOTAL_BAK_SUPPLY) {
            // Linear price increase from $0.02 to $0.04 over total supply
            uint256 priceAtPoint = BAK_PRICE_START + ((tempSold * (BAK_PRICE_END - BAK_PRICE_START)) / TOTAL_BAK_SUPPLY);
            uint256 bakAtIncrement = increment;
            uint256 costAtIncrement = bakAtIncrement * priceAtPoint / 10**18;
            
            if (costAtIncrement <= remainingUSD) {
                totalBak += bakAtIncrement;
                remainingUSD -= costAtIncrement;
                tempSold += bakAtIncrement;
            } else {
                uint256 affordableBak = remainingUSD * 10**18 / priceAtPoint;
                totalBak += affordableBak;
                remainingUSD = 0;
            }
        }
        
        bakAmount = totalBak;
        averagePrice = totalBak > 0 ? (usdAmount - remainingUSD) * 10**18 / totalBak : currentPrice;
        newPrice = BAK_PRICE_START + (((totalBakSold + bakAmount) * (BAK_PRICE_END - BAK_PRICE_START)) / TOTAL_BAK_SUPPLY);
        
        return (bakAmount, averagePrice, newPrice);
    }

    /**
     * @notice Your existing calculatePurchase function (enhanced)
     */
    function calculatePurchase(address paymentToken, uint256 paymentAmount)
        public view returns (uint256 usdValue, uint256 bakAmount)
    {
        PaymentToken memory token = paymentTokens[paymentToken];
        
        if (paymentToken == address(0)) {
            // ETH payment
            usdValue = paymentAmount * token.priceUSD / 10**18;
        } else {
            // ERC20 token payment
            uint256 adjustedAmount = paymentAmount * 10**(18 - token.decimals);
            usdValue = adjustedAmount * token.priceUSD / 10**18;
        }
        
        if (bondingCurveEnabled) {
            (bakAmount,,) = calculateBondingCurve(usdValue);
        } else {
            bakAmount = usdValue * 10**18 / BAK_PRICE_START;
        }
        
        return (usdValue, bakAmount);
    }

    function getCurrentBakPrice() public view returns (uint256) {
        if (bondingCurveEnabled) {
            return BAK_PRICE_START + ((totalBakSold * (BAK_PRICE_END - BAK_PRICE_START)) / TOTAL_BAK_SUPPLY);
        }
        return BAK_PRICE_START;
    }

    function _calculateNewPrice() internal view returns (uint256) {
        if (bondingCurveEnabled) {
            return BAK_PRICE_START + ((totalBakSold * (BAK_PRICE_END - BAK_PRICE_START)) / TOTAL_BAK_SUPPLY);
        }
        return BAK_PRICE_START;
    }

    function _isValidNetwork(string memory network) internal pure returns (bool) {
        return (
            keccak256(bytes(network)) == keccak256(bytes("ethereum")) ||
            keccak256(bytes(network)) == keccak256(bytes("bsc")) ||
            keccak256(bytes(network)) == keccak256(bytes("polygon"))
        );
    }

    function _isValidToken(string memory token) internal pure returns (bool) {
        return (
            keccak256(bytes(token)) == keccak256(bytes("USDT")) ||
            keccak256(bytes(token)) == keccak256(bytes("USDC"))
        );
    }

    // Your existing functions (preserved)
    function getTreasuryWallet(address paymentToken) public view returns (address) {
        if (paymentToken == address(0)) {
            return walletConfig.ethWallet;
        }
        
        PaymentToken memory token = paymentTokens[paymentToken];
        if (token.treasuryWallet != address(0)) {
            return token.treasuryWallet;
        }
        
        return walletConfig.defaultWallet;
    }

    function _transferBAKFromFunding(address to, uint256 amount) internal {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient BAK balance");
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "BAK transfer failed");
    }

    // Admin functions
    function enableBondingCurve(bool enabled) external onlyOwner {
        bondingCurveEnabled = enabled;
        if (enabled) {
            currentBakPrice = getCurrentBakPrice();
        } else {
            currentBakPrice = BAK_PRICE_START;
        }
    }

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
        paymentTokens[token] = PaymentToken({
            enabled: enabled,
            decimals: decimals,
            priceUSD: priceUSD,
            minPurchaseUSD: minPurchaseUSD,
            maxPurchaseUSD: maxPurchaseUSD,
            symbol: symbol,
            treasuryWallet: treasuryWallet
        });
        
        if (enabled) {
            bool exists = false;
            for (uint i = 0; i < paymentTokenList.length; i++) {
                if (paymentTokenList[i] == token) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                paymentTokenList.push(token);
            }
        }
        
        emit PaymentTokenUpdated(token, enabled, priceUSD, block.timestamp);
    }

    function updateCrossChainTreasury(
        string memory network,
        string memory token,
        address treasury
    ) external onlyOwner {
        require(_isValidNetwork(network), "Invalid network");
        require(_isValidToken(token), "Invalid token");
        require(treasury != address(0), "Invalid treasury");
        crossChainTreasuries[network][token] = treasury;
    }

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
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getEPOStats() external view returns (
        uint256 _totalBakSold,
        uint256 _totalUSDRaised,
        uint256 _currentPrice,
        uint256 _remainingSupply,
        uint256 _totalPurchases,
        bool _bondingCurveEnabled
    ) {
        return (
            totalBakSold,
            totalUSDRaised,
            getCurrentBakPrice(),
            TOTAL_BAK_SUPPLY - totalBakSold,
            allPurchases.length,
            bondingCurveEnabled
        );
    }

    function getCrossChainTreasury(string memory network, string memory token) 
        external view returns (address) 
    {
        return crossChainTreasuries[network][token];
    }

    function getUserPurchaseHistory(address user) external view returns (PurchaseInfo[] memory) {
        return userPurchaseHistory[user];
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return paymentTokenList;
    }

    receive() external payable {}
}
