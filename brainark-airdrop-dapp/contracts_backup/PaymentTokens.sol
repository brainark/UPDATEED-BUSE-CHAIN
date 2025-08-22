// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BrainArk Payment Tokens
 * @dev ERC20 tokens for EPO payments on BrainArk Besu network
 */

// USDT Token for BrainArk Network
contract BrainArkUSDT is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("BrainArk USDT", "USDT") {
        _decimals = 6; // USDT typically uses 6 decimals
        _mint(msg.sender, 1000000000 * 10**_decimals); // 1B USDT initial supply
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

// USDC Token for BrainArk Network
contract BrainArkUSDC is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("BrainArk USDC", "USDC") {
        _decimals = 6; // USDC uses 6 decimals
        _mint(msg.sender, 1000000000 * 10**_decimals); // 1B USDC initial supply
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

// BNB Token for BrainArk Network
contract BrainArkBNB is ERC20, Ownable {
    constructor() ERC20("BrainArk BNB", "BNB") {
        _mint(msg.sender, 100000000 * 10**18); // 100M BNB initial supply
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

// Wrapped ETH for BrainArk Network (if needed)
contract BrainArkWETH is ERC20, Ownable {
    constructor() ERC20("Wrapped Ether", "WETH") {
        _mint(msg.sender, 10000000 * 10**18); // 10M WETH initial supply
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // Allow wrapping of native BAK to WETH if needed
    function deposit() external payable {
        _mint(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }
}