// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BrainArk DEX - Simple AMM for BAK Token Trading
 * @dev Uniswap V2-style AMM optimized for BrainArk ecosystem
 */
contract BrainArkDEX is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint256 pairCount
    );
    
    event LiquidityAdded(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );

    // Structs
    struct Pair {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidity;
        bool exists;
    }

    struct SwapResult {
        uint256 amountOut;
        uint256 priceImpact;
        uint256 fee;
    }

    // State variables
    mapping(bytes32 => Pair) public pairs;
    mapping(address => mapping(address => bytes32)) public getPairId;
    bytes32[] public allPairs;
    
    uint256 public constant FEE_RATE = 30; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    address public immutable BAK_TOKEN;
    address public feeRecipient;

    constructor(address _bakToken, address _feeRecipient) {
        require(_bakToken != address(0), "Invalid BAK token");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        BAK_TOKEN = _bakToken;
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Create a new trading pair
     * @param tokenA First token address
     * @param tokenB Second token address
     */
    function createPair(address tokenA, address tokenB) external returns (bytes32 pairId) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        
        // Ensure one token is BAK for initial launch
        require(tokenA == BAK_TOKEN || tokenB == BAK_TOKEN, "One token must be BAK");
        
        // Order tokens
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        
        pairId = keccak256(abi.encodePacked(token0, token1));
        require(!pairs[pairId].exists, "Pair already exists");
        
        // Create pair
        Pair storage pair = pairs[pairId];
        pair.tokenA = token0;
        pair.tokenB = token1;
        pair.exists = true;
        
        allPairs.push(pairId);
        getPairId[token0][token1] = pairId;
        getPairId[token1][token0] = pairId;
        
        emit PairCreated(token0, token1, address(this), allPairs.length);
        
        return pairId;
    }

    /**
     * @notice Add liquidity to a trading pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param amountA Amount of tokenA to add
     * @param amountB Amount of tokenB to add
     * @param minAmountA Minimum amount of tokenA (slippage protection)
     * @param minAmountB Minimum amount of tokenB (slippage protection)
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 minAmountA,
        uint256 minAmountB
    ) external nonReentrant returns (uint256 liquidityMinted) {
        bytes32 pairId = getPairId[tokenA][tokenB];
        require(pairs[pairId].exists, "Pair does not exist");
        
        Pair storage pair = pairs[pairId];
        
        // Calculate optimal amounts
        (uint256 optimalAmountA, uint256 optimalAmountB) = _calculateOptimalAmounts(
            pair, tokenA, tokenB, amountA, amountB
        );
        
        require(optimalAmountA >= minAmountA, "Insufficient amount A");
        require(optimalAmountB >= minAmountB, "Insufficient amount B");
        
        // Transfer tokens
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), optimalAmountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), optimalAmountB);
        
        // Calculate liquidity to mint
        if (pair.totalLiquidity == 0) {
            liquidityMinted = sqrt(optimalAmountA * optimalAmountB);
        } else {
            liquidityMinted = min(
                (optimalAmountA * pair.totalLiquidity) / pair.reserveA,
                (optimalAmountB * pair.totalLiquidity) / pair.reserveB
            );
        }
        
        require(liquidityMinted > 0, "Insufficient liquidity minted");
        
        // Update reserves and liquidity
        pair.reserveA += optimalAmountA;
        pair.reserveB += optimalAmountB;
        pair.totalLiquidity += liquidityMinted;
        pair.liquidity[msg.sender] += liquidityMinted;
        
        emit LiquidityAdded(
            msg.sender, tokenA, tokenB, 
            optimalAmountA, optimalAmountB, liquidityMinted
        );
        
        return liquidityMinted;
    }

    /**
     * @notice Remove liquidity from a trading pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param liquidity Amount of liquidity to remove
     * @param minAmountA Minimum amount of tokenA to receive
     * @param minAmountB Minimum amount of tokenB to receive
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 minAmountA,
        uint256 minAmountB
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        bytes32 pairId = getPairId[tokenA][tokenB];
        require(pairs[pairId].exists, "Pair does not exist");
        
        Pair storage pair = pairs[pairId];
        require(pair.liquidity[msg.sender] >= liquidity, "Insufficient liquidity");
        
        // Calculate amounts to return
        amountA = (liquidity * pair.reserveA) / pair.totalLiquidity;
        amountB = (liquidity * pair.reserveB) / pair.totalLiquidity;
        
        require(amountA >= minAmountA, "Insufficient amount A");
        require(amountB >= minAmountB, "Insufficient amount B");
        
        // Update state
        pair.reserveA -= amountA;
        pair.reserveB -= amountB;
        pair.totalLiquidity -= liquidity;
        pair.liquidity[msg.sender] -= liquidity;
        
        // Transfer tokens
        IERC20(tokenA).safeTransfer(msg.sender, amountA);
        IERC20(tokenB).safeTransfer(msg.sender, amountB);
        
        emit LiquidityRemoved(
            msg.sender, tokenA, tokenB, 
            amountA, amountB, liquidity
        );
        
        return (amountA, amountB);
    }

    /**
     * @notice Swap tokens
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum amount of output tokens (slippage protection)
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn != tokenOut, "Identical tokens");
        require(amountIn > 0, "Invalid input amount");
        
        bytes32 pairId = getPairId[tokenIn][tokenOut];
        require(pairs[pairId].exists, "Pair does not exist");
        
        Pair storage pair = pairs[pairId];
        
        // Calculate swap result
        SwapResult memory result = _calculateSwap(pair, tokenIn, tokenOut, amountIn);
        require(result.amountOut >= minAmountOut, "Slippage tolerance exceeded");
        
        // Transfer input tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Update reserves
        if (tokenIn == pair.tokenA) {
            pair.reserveA += amountIn;
            pair.reserveB -= result.amountOut;
        } else {
            pair.reserveB += amountIn;
            pair.reserveA -= result.amountOut;
        }
        
        // Transfer output tokens (minus fee)
        uint256 amountAfterFee = result.amountOut - result.fee;
        IERC20(tokenOut).safeTransfer(msg.sender, amountAfterFee);
        
        // Transfer fee to fee recipient
        if (result.fee > 0) {
            IERC20(tokenOut).safeTransfer(feeRecipient, result.fee);
        }
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountAfterFee, result.fee);
        
        return amountAfterFee;
    }

    /**
     * @notice Get quote for a swap
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     */
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (
        uint256 amountOut,
        uint256 priceImpact,
        uint256 fee
    ) {
        bytes32 pairId = getPairId[tokenIn][tokenOut];
        require(pairs[pairId].exists, "Pair does not exist");
        
        SwapResult memory result = _calculateSwap(pairs[pairId], tokenIn, tokenOut, amountIn);
        return (result.amountOut - result.fee, result.priceImpact, result.fee);
    }

    /**
     * @notice Get pair reserves
     * @param tokenA First token address
     * @param tokenB Second token address
     */
    function getReserves(address tokenA, address tokenB) 
        external view returns (uint256 reserveA, uint256 reserveB) 
    {
        bytes32 pairId = getPairId[tokenA][tokenB];
        if (!pairs[pairId].exists) return (0, 0);
        
        Pair storage pair = pairs[pairId];
        if (tokenA == pair.tokenA) {
            return (pair.reserveA, pair.reserveB);
        } else {
            return (pair.reserveB, pair.reserveA);
        }
    }

    /**
     * @notice Get user's liquidity in a pair
     * @param user User address
     * @param tokenA First token address
     * @param tokenB Second token address
     */
    function getUserLiquidity(address user, address tokenA, address tokenB) 
        external view returns (uint256) 
    {
        bytes32 pairId = getPairId[tokenA][tokenB];
        if (!pairs[pairId].exists) return 0;
        return pairs[pairId].liquidity[user];
    }

    // Internal functions
    function _calculateOptimalAmounts(
        Pair storage pair,
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) internal view returns (uint256 optimalAmountA, uint256 optimalAmountB) {
        if (pair.reserveA == 0 && pair.reserveB == 0) {
            return (amountA, amountB);
        }
        
        uint256 amountBOptimal = (amountA * pair.reserveB) / pair.reserveA;
        if (amountBOptimal <= amountB) {
            return (amountA, amountBOptimal);
        } else {
            uint256 amountAOptimal = (amountB * pair.reserveA) / pair.reserveB;
            return (amountAOptimal, amountB);
        }
    }

    function _calculateSwap(
        Pair storage pair,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal view returns (SwapResult memory) {
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == pair.tokenA) {
            reserveIn = pair.reserveA;
            reserveOut = pair.reserveB;
        } else {
            reserveIn = pair.reserveB;
            reserveOut = pair.reserveA;
        }
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        // Calculate output amount using constant product formula
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        uint256 amountOut = numerator / denominator;
        
        // Calculate price impact
        uint256 priceImpact = (amountIn * 10000) / reserveIn;
        
        // Calculate fee
        uint256 fee = (amountOut * FEE_RATE) / FEE_DENOMINATOR;
        
        return SwapResult({
            amountOut: amountOut,
            priceImpact: priceImpact,
            fee: fee
        });
    }

    // Utility functions
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // Admin functions
    function updateFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function getAllPairs() external view returns (bytes32[] memory) {
        return allPairs;
    }

    function getPairCount() external view returns (uint256) {
        return allPairs.length;
    }
}