const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BrainArkEPO", function () {
  let epo;
  let owner;
  let treasury;
  let funding;
  let buyer;
  let mockBAK;
  let mockUSDT;
  let mockUSDC;

  const TOTAL_SUPPLY = ethers.parseEther("100000000"); // 100M BAK
  const BAK_PRICE_USD = ethers.parseEther("0.02"); // $0.02 per BAK
  const USDT_PRICE_USD = ethers.parseEther("1"); // $1 per USDT
  const MIN_PURCHASE_USD = ethers.parseEther("1"); // $1 minimum
  const MAX_PURCHASE_USD = ethers.parseEther("1000000"); // $1,000,000 maximum

  // Deploy contracts once before all tests
  before(async function () {
    [owner, treasury, funding, buyer] = await ethers.getSigners();

    const initialBalance = await ethers.provider.getBalance(owner.address);
    console.log(
      "Initial test account balance:",
      ethers.formatEther(initialBalance),
      "BAK"
    );

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory(
      "contracts/test/MockERC20.sol:MockERC20"
    );
    mockUSDT = await (
      await MockToken.deploy("USDT", "USDT", 6)
    ).waitForDeployment();
    mockUSDC = await (
      await MockToken.deploy("USDC", "USDC", 6)
    ).waitForDeployment();

    // Deploy Enhanced EPO contract with multi-wallet configuration
    const BrainArkEPO = await ethers.getContractFactory("BrainArkEPO");
    epo = await (
      await BrainArkEPO.deploy(
        await funding.getAddress(),    // fundingWallet
        await treasury.getAddress(),   // ethWallet
        await treasury.getAddress(),   // usdtWallet
        await treasury.getAddress(),   // usdcWallet
        await treasury.getAddress(),   // bnbWallet
        await treasury.getAddress()    // defaultWallet
      )
    ).waitForDeployment();

    // Fund the contract with BAK tokens (native tokens)
    await owner.sendTransaction({
      to: await epo.getAddress(),
      value: ethers.parseEther("100"), // Fund with 100 BAK for testing
    });

    console.log("Contract funded with 100 BAK");
  });

  // Reset state before each test
  beforeEach(async function () {
    // Add more BAK balance to contract
    await owner.sendTransaction({
      to: await epo.getAddress(),
      value: ethers.parseEther("50"), // Add 50 BAK for testing
    });

    // Configure payment tokens with treasury wallet
    await epo.updatePaymentToken(
      await mockUSDT.getAddress(),
      true,
      6,
      USDT_PRICE_USD,
      MIN_PURCHASE_USD,
      MAX_PURCHASE_USD,
      "USDT",
      ethers.ZeroAddress // Use default wallet routing
    );

    // Mint tokens to buyer
    await mockUSDT.mint(
      await buyer.getAddress(),
      ethers.parseUnits("10000", 6)
    );
    await mockUSDT
      .connect(buyer)
      .approve(await epo.getAddress(), ethers.parseUnits("10000", 6));
  });

  describe("Initialization", function () {
    it("Should set the correct funding wallet", async function () {
      expect(await epo.fundingWallet()).to.equal(await funding.getAddress());
    });

    it("Should initialize wallet configuration correctly", async function () {
      const walletConfig = await epo.getWalletConfig();
      expect(walletConfig.ethWallet).to.equal(await treasury.getAddress());
      expect(walletConfig.usdtWallet).to.equal(await treasury.getAddress());
      expect(walletConfig.usdcWallet).to.equal(await treasury.getAddress());
      expect(walletConfig.bnbWallet).to.equal(await treasury.getAddress());
      expect(walletConfig.defaultWallet).to.equal(await treasury.getAddress());
    });

    it("Should configure payment token correctly", async function () {
      const mockUSDTAddress = await mockUSDT.getAddress();

      // Check token configuration
      const token = await epo.paymentTokens(mockUSDTAddress);
      expect(token.enabled).to.be.true;
      expect(Number(token.decimals)).to.equal(6);
      expect(token.priceUSD).to.equal(USDT_PRICE_USD);
      expect(token.minPurchaseUSD).to.equal(MIN_PURCHASE_USD);
      expect(token.maxPurchaseUSD).to.equal(MAX_PURCHASE_USD);
      expect(token.symbol).to.equal("USDT");

      // Check payment token list
      const tokenList = await epo.paymentTokenList(0);
      expect(tokenList).to.equal(mockUSDTAddress);

      // Verify EPO stats
      const stats = await epo.getEPOStats();
      expect(stats.isActive).to.be.true;
      expect(stats.bakPriceUSD).to.equal(BAK_PRICE_USD);
      expect(stats.remainingSupply).to.equal(TOTAL_SUPPLY - stats.totalBakSold);
    });
  });

  describe("Treasury Wallet Management", function () {
    it("Should return correct treasury wallet for USDT", async function () {
      const mockUSDTAddress = await mockUSDT.getAddress();
      const treasuryWallet = await epo.getTreasuryWallet(mockUSDTAddress);
      expect(treasuryWallet).to.equal(await treasury.getAddress());
    });

    it("Should allow owner to update token treasury wallet", async function () {
      const mockUSDTAddress = await mockUSDT.getAddress();
      const newWallet = buyer; // Use buyer as new wallet for testing
      
      await expect(
        epo.updateTokenTreasuryWallet(mockUSDTAddress, await newWallet.getAddress())
      ).to.emit(epo, "TreasuryWalletUpdated")
        .withArgs(mockUSDTAddress, ethers.ZeroAddress, await newWallet.getAddress(), await time.latest() + 1);

      // Check that treasury wallet was updated
      const treasuryWallet = await epo.getTreasuryWallet(mockUSDTAddress);
      expect(treasuryWallet).to.equal(await newWallet.getAddress());
    });

    it("Should allow owner to update wallet configuration", async function () {
      const newEthWallet = buyer;
      
      await epo.updateWalletConfig(
        await newEthWallet.getAddress(), // ethWallet
        await treasury.getAddress(),     // usdtWallet
        await treasury.getAddress(),     // usdcWallet
        await treasury.getAddress(),     // bnbWallet
        await treasury.getAddress()      // defaultWallet
      );

      const walletConfig = await epo.getWalletConfig();
      expect(walletConfig.ethWallet).to.equal(await newEthWallet.getAddress());
    });

    it("Should prevent non-owner from updating treasury wallets", async function () {
      const mockUSDTAddress = await mockUSDT.getAddress();
      
      await expect(
        epo.connect(buyer).updateTokenTreasuryWallet(mockUSDTAddress, await buyer.getAddress())
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Token Purchase", function () {
    it("Should return correct quote information", async function () {
      const paymentAmount = ethers.parseUnits("100", 6); // 100 USDT
      const mockUSDTAddress = await mockUSDT.getAddress();

      const [bakAmount, usdValue, effectivePrice] = await epo.getQuote(
        mockUSDTAddress,
        paymentAmount
      );

      const expectedBakAmount = ethers.parseEther("5000"); // $100 worth at $0.02 per BAK
      expect(bakAmount).to.equal(expectedBakAmount);
      expect(usdValue).to.equal(ethers.parseEther("100")); // $100
      expect(effectivePrice).to.equal(ethers.parseEther("0.02")); // $0.02 per BAK
    });

    it("Should calculate purchase amounts correctly", async function () {
      const paymentAmount = ethers.parseUnits("100", 6); // 100 USDT
      const mockUSDTAddress = await mockUSDT.getAddress();
      const [usdValue, bakAmount] = await epo.calculatePurchase(
        mockUSDTAddress,
        paymentAmount
      );

      // 100 USDT = $100, at $0.02 per BAK = 5000 BAK
      const expectedBakAmount = ethers.parseEther("5000");
      expect(bakAmount).to.equal(expectedBakAmount);
    });

    it("Should allow token purchase with USDT and route to correct treasury", async function () {
      const paymentAmount = ethers.parseUnits("1", 6); // 1 USDT
      const expectedBakAmount = ethers.parseEther("50"); // $1 worth at $0.02 per BAK = 50 BAK
      const minBakAmount = (expectedBakAmount * 95n) / 100n; // 5% slippage

      const mockUSDTAddress = await mockUSDT.getAddress();
      const expectedTreasuryWallet = await epo.getTreasuryWallet(mockUSDTAddress);

      await expect(
        epo.connect(buyer).purchaseBAK(mockUSDTAddress, paymentAmount, minBakAmount)
      ).to.emit(epo, "TokenPurchase")
        .withArgs(
          await buyer.getAddress(),
          mockUSDTAddress,
          paymentAmount,
          expectedBakAmount,
          ethers.parseEther("1"),
          expectedTreasuryWallet,
          await time.latest() + 1
        );

      // Check balances and statistics
      const stats = await epo.getEPOStats();
      expect(stats.totalBakSold).to.equal(expectedBakAmount);
      expect(stats.totalUSDRaised).to.equal(ethers.parseEther("1"));
    });

    it("Should handle token allowances correctly", async function () {
      // Remove USDT approval
      await mockUSDT.connect(buyer).approve(await epo.getAddress(), 0);

      const paymentAmount = ethers.parseUnits("1", 6); // 1 USDT
      const expectedBakAmount = ethers.parseEther("50");
      const minBakAmount = (expectedBakAmount * 95n) / 100n;

      // Should fail without USDT approval
      let error;
      try {
        await epo
          .connect(buyer)
          .purchaseBAK(
            await mockUSDT.getAddress(),
            paymentAmount,
            minBakAmount
          );
      } catch (e) {
        error = e;
      }
      expect(error?.message).to.include("insufficient allowance");

      // Approve USDT and try again
      await mockUSDT
        .connect(buyer)
        .approve(await epo.getAddress(), paymentAmount);
      const tx = await epo
        .connect(buyer)
        .purchaseBAK(await mockUSDT.getAddress(), paymentAmount, minBakAmount);
      await tx.wait();
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update token price", async function () {
      const newPrice = ethers.parseEther("1.1"); // $1.10
      const mockUSDTAddress = await mockUSDT.getAddress();

      // Get initial state
      const initialToken = await epo.paymentTokens(mockUSDTAddress);

      // Update price
      await epo.updateTokenPrice(mockUSDTAddress, newPrice);

      // Verify state changes
      const token = await epo.paymentTokens(mockUSDTAddress);
      expect(token.priceUSD).to.equal(newPrice);
      expect(token.enabled).to.equal(initialToken.enabled);
      expect(token.decimals).to.equal(initialToken.decimals);
      expect(token.symbol).to.equal(initialToken.symbol);
    });

    it("Should allow owner to pause and unpause", async function () {
      await epo.pause();
      expect(await epo.paused()).to.be.true;

      await epo.unpause();
      expect(await epo.paused()).to.be.false;
    });
  });

  describe("Security", function () {
    it("Should allow emergency withdrawal by owner", async function () {
      // First fund the contract with some USDT
      await mockUSDT.mint(await epo.getAddress(), ethers.parseUnits("1000", 6));
      const mockUSDTAddress = await mockUSDT.getAddress();

      // Check initial balances
      const initialTreasuryBalance = await mockUSDT.balanceOf(
        await treasury.getAddress()
      );
      const initialEpoBalance = await mockUSDT.balanceOf(
        await epo.getAddress()
      );

      // Withdraw all USDT
      const withdrawAmount = initialEpoBalance;
      await epo
        .connect(owner)
        .emergencyWithdraw(
          mockUSDTAddress,
          withdrawAmount,
          await treasury.getAddress()
        );

      // Check final balances
      expect(await mockUSDT.balanceOf(await treasury.getAddress())).to.equal(
        initialTreasuryBalance + withdrawAmount
      );
      expect(await mockUSDT.balanceOf(await epo.getAddress())).to.equal(0n);
    });

    it("Should prevent unauthorized token updates", async function () {
      const mockUSDTAddress = await mockUSDT.getAddress();
      let error;
      try {
        await epo
          .connect(buyer)
          .updateTokenPrice(mockUSDTAddress, ethers.parseEther("1.1"));
      } catch (e) {
        error = e;
      }
      expect(error?.message).to.include("caller is not the owner");
    });

    it("Should enforce minimum purchase amount", async function () {
      const smallAmount = ethers.parseUnits("0.5", 6); // $0.50 worth of USDT (below $1 minimum)
      const mockUSDTAddress = await mockUSDT.getAddress();
      
      await expect(
        epo.connect(buyer).purchaseBAK(mockUSDTAddress, smallAmount, 0)
      ).to.be.revertedWith("Below minimum purchase amount");
    });

    it("Should enforce maximum purchase amount", async function () {
      const largeAmount = ethers.parseUnits("2000000", 6); // $2M worth of USDT (above $1M maximum)
      const mockUSDTAddress = await mockUSDT.getAddress();
      
      await expect(
        epo.connect(buyer).purchaseBAK(mockUSDTAddress, largeAmount, 0)
      ).to.be.revertedWith("Above maximum purchase amount");
    });
  });

  describe("View Functions", function () {
    it("Should return wallet configuration", async function () {
      const walletConfig = await epo.getWalletConfig();
      expect(walletConfig.defaultWallet).to.equal(await treasury.getAddress());
    });

    it("Should return user purchase history", async function () {
      const userAddress = await buyer.getAddress();
      const paymentAmount = ethers.parseUnits("1", 6);
      const expectedBakAmount = ethers.parseEther("50");
      const minBakAmount = (expectedBakAmount * 95n) / 100n;

      await epo.connect(buyer).purchaseBAK(
        await mockUSDT.getAddress(),
        paymentAmount,
        minBakAmount
      );

      const history = await epo.getUserPurchaseHistory(userAddress);
      expect(history.length).to.be.greaterThan(0);
      const lastPurchase = history[history.length - 1]; expect(lastPurchase.buyer).to.equal(userAddress);
      expect(lastPurchase.bakAmount).to.equal(expectedBakAmount);
    });

    it("Should return EPO statistics", async function () {
      const stats = await epo.getEPOStats();
      expect(stats.bakPriceUSD).to.equal(BAK_PRICE_USD);
      expect(stats.isActive).to.be.true;
    });

    it("Should return supported tokens", async function () {
      const tokens = await epo.getSupportedTokens();
      expect(tokens.length).to.be.greaterThan(0);
      expect(tokens[0]).to.equal(await mockUSDT.getAddress());
    });
  });
});

// Helper to get latest block timestamp
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  }
};