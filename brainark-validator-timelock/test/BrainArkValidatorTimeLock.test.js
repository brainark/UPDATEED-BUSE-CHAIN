const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BrainArkValidatorTimeLock", function () {
  let timeLock, bakToken;
  let owner, validator, user, otherAccount;
  let startTime;
  
  const TOTAL_LOCKED = ethers.parseEther("400000000"); // 400M BAK
  const MONTHLY_RELEASE = ethers.parseEther("1111111"); // ~1.11M BAK
  const ANNUAL_RELEASE = ethers.parseEther("13333333"); // ~13.33M BAK
  
  beforeEach(async function () {
    // Get signers
    [owner, validator, user, otherAccount] = await ethers.getSigners();
    
    // Deploy mock BAK token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    bakToken = await MockERC20.deploy("BrainArk Token", "BAK", TOTAL_LOCKED);
    await bakToken.waitForDeployment();
    
    // Set start time to 1 hour from now
    startTime = (await time.latest()) + 3600;
    
    // Deploy TimeLock contract
    const TimeLock = await ethers.getContractFactory("BrainArkValidatorTimeLock");
    timeLock = await TimeLock.deploy(
      await bakToken.getAddress(),
      validator.address,
      startTime
    );
    await timeLock.waitForDeployment();
    
    // Transfer tokens to the contract
    await bakToken.transfer(await timeLock.getAddress(), TOTAL_LOCKED);
  });

  describe("Deployment", function () {
    it("Should set the correct parameters", async function () {
      expect(await timeLock.bakToken()).to.equal(await bakToken.getAddress());
      expect(await timeLock.validatorRewardDistributor()).to.equal(validator.address);
      expect(await timeLock.startTime()).to.equal(startTime);
      expect(await timeLock.endTime()).to.equal(startTime + (30 * 365 * 24 * 3600));
      expect(await timeLock.TOTAL_LOCKED_AMOUNT()).to.equal(TOTAL_LOCKED);
      expect(await timeLock.MONTHLY_RELEASE_AMOUNT()).to.equal(MONTHLY_RELEASE);
    });

    it("Should have correct lock parameters", async function () {
      const params = await timeLock.getLockParameters();
      expect(params.totalLocked).to.equal(TOTAL_LOCKED);
      expect(params.monthlyRelease).to.equal(MONTHLY_RELEASE);
      expect(params.annualRelease).to.equal(ANNUAL_RELEASE);
      expect(params.lockDuration).to.equal(30 * 365 * 24 * 3600);
    });

    it("Should reject invalid parameters", async function () {
      const TimeLock = await ethers.getContractFactory("BrainArkValidatorTimeLock");
      
      // Invalid token address
      await expect(
        TimeLock.deploy(ethers.ZeroAddress, validator.address, startTime)
      ).to.be.revertedWith("Invalid BAK token address");
      
      // Invalid distributor address
      await expect(
        TimeLock.deploy(await bakToken.getAddress(), ethers.ZeroAddress, startTime)
      ).to.be.revertedWith("Invalid distributor address");
      
      // Past start time
      await expect(
        TimeLock.deploy(await bakToken.getAddress(), validator.address, (await time.latest()) - 1)
      ).to.be.revertedWith("Start time must be in the future");
    });
  });

  describe("Token Release", function () {
    it("Should not allow release before start time", async function () {
      await expect(timeLock.releaseTokens())
        .to.be.revertedWith("Release time not reached");
    });

    it("Should not allow release before first interval", async function () {
      // Move to start time but before first release interval
      await time.increaseTo(startTime);
      await expect(timeLock.releaseTokens())
        .to.be.revertedWith("Release time not reached");
    });

    it("Should allow first release after 30 days", async function () {
      // Move to first release time
      const firstReleaseTime = startTime + (30 * 24 * 3600);
      await time.increaseTo(firstReleaseTime);
      
      const validatorBalanceBefore = await bakToken.balanceOf(validator.address);
      
      const tx = await timeLock.releaseTokens();
      await expect(tx)
        .to.emit(timeLock, "TokensReleased");
      
      const validatorBalanceAfter = await bakToken.balanceOf(validator.address);
      expect(validatorBalanceAfter - validatorBalanceBefore).to.equal(MONTHLY_RELEASE);
      
      expect(await timeLock.totalReleased()).to.equal(MONTHLY_RELEASE);
    });

    it("Should handle multiple consecutive releases", async function () {
      // Move to 3 months after start
      await time.increaseTo(startTime + (3 * 30 * 24 * 3600));
      
      // Should release 3 months worth of tokens
      const expectedRelease = MONTHLY_RELEASE * 3n;
      
      const tx = await timeLock.releaseTokens();
      await expect(tx)
        .to.emit(timeLock, "TokensReleased");
      
      expect(await timeLock.totalReleased()).to.equal(expectedRelease);
    });

    it("Should not allow double release in same period", async function () {
      // Move to first release and release tokens
      await time.increaseTo(startTime + (30 * 24 * 3600));
      await timeLock.releaseTokens();
      
      // Try to release again immediately
      await expect(timeLock.releaseTokens())
        .to.be.revertedWith("Release time not reached");
    });

    it("Should calculate release amount correctly", async function () {
      // Before start
      expect(await timeLock.calculateReleaseAmount()).to.equal(0);
      
      // At 2 months
      await time.increaseTo(startTime + (2 * 30 * 24 * 3600));
      expect(await timeLock.calculateReleaseAmount()).to.equal(MONTHLY_RELEASE * 2n);
      
      // After first release
      await timeLock.releaseTokens();
      expect(await timeLock.calculateReleaseAmount()).to.equal(0);
      
      // At 3 months (move to next release time)
      await time.increaseTo(startTime + (3 * 30 * 24 * 3600) + 1);
      expect(await timeLock.calculateReleaseAmount()).to.equal(MONTHLY_RELEASE);
    });

    it("Should work for anyone to call releaseTokens", async function () {
      await time.increaseTo(startTime + (30 * 24 * 3600));
      
      // User can call release
      await expect(timeLock.connect(user).releaseTokens())
        .to.emit(timeLock, "TokensReleased");
    });
  });

  describe("Contract Status", function () {
    it("Should return correct status information", async function () {
      const status = await timeLock.getContractStatus();
      expect(status.locked).to.equal(TOTAL_LOCKED);
      expect(status.released).to.equal(0);
      expect(status.progress).to.equal(0);
      
      // After release
      await time.increaseTo(startTime + (30 * 24 * 3600));
      await timeLock.releaseTokens();
      
      const statusAfter = await timeLock.getContractStatus();
      expect(statusAfter.locked).to.equal(TOTAL_LOCKED - MONTHLY_RELEASE);
      expect(statusAfter.released).to.equal(MONTHLY_RELEASE);
      expect(statusAfter.progress).to.be.greaterThan(0);
    });

    it("Should return correct release status", async function () {
      // Before start
      let status = await timeLock.checkReleaseStatus();
      expect(status.canRelease_).to.be.false;
      expect(status.releaseAmount).to.equal(0);
      expect(status.timeUntilRelease).to.be.greaterThan(0);
      
      // After release time
      await time.increaseTo(startTime + (30 * 24 * 3600));
      status = await timeLock.checkReleaseStatus();
      expect(status.canRelease_).to.be.true;
      expect(status.releaseAmount).to.equal(MONTHLY_RELEASE);
      expect(status.timeUntilRelease).to.equal(0);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause", async function () {
      await timeLock.emergencyPause();
      expect(await timeLock.paused()).to.be.true;
      
      // Should not allow release when paused
      await time.increaseTo(startTime + (30 * 24 * 3600));
      await expect(timeLock.releaseTokens())
        .to.be.revertedWithCustomError(timeLock, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await timeLock.emergencyPause();
      await timeLock.unpause();
      expect(await timeLock.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(timeLock.connect(user).emergencyPause())
        .to.be.revertedWithCustomError(timeLock, "OwnableUnauthorizedAccount");
    });

    it("Should handle emergency withdraw request", async function () {
      await expect(timeLock.requestEmergencyWithdraw())
        .to.emit(timeLock, "EmergencyWithdrawRequested");
      
      expect(await timeLock.emergencyWithdrawEnabled()).to.be.true;
    });

    it("Should not allow immediate emergency withdraw", async function () {
      await timeLock.requestEmergencyWithdraw();
      
      await expect(timeLock.executeEmergencyWithdraw())
        .to.be.revertedWith("Emergency withdraw delay not met");
    });

    it("Should allow emergency withdraw after delay", async function () {
      await timeLock.requestEmergencyWithdraw();
      
      // Increase time by 7 days + 1 second
      await time.increase(7 * 24 * 3600 + 1);
      
      const ownerBalanceBefore = await bakToken.balanceOf(owner.address);
      
      await expect(timeLock.executeEmergencyWithdraw())
        .to.emit(timeLock, "EmergencyWithdrawExecuted");
      
      const ownerBalanceAfter = await bakToken.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(TOTAL_LOCKED);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle end of lock period", async function () {
      // Move to end of 30 years
      await time.increaseTo(startTime + (30 * 365 * 24 * 3600) + 1);
      
      await expect(timeLock.releaseTokens())
        .to.be.revertedWith("Lock period ended");
    });

    it("Should not exceed total locked amount", async function () {
      // This test ensures contract handles edge cases in calculation
      // Move to way past the end (shouldn't happen in practice)
      await time.increaseTo(startTime + (50 * 365 * 24 * 3600));
      
      const amount = await timeLock.calculateReleaseAmount();
      expect(amount).to.be.at.most(TOTAL_LOCKED);
    });

    it("Should handle projected releases correctly", async function () {
      const projected = await timeLock.getProjectedReleases();
      expect(projected.totalMonths).to.equal(360); // 30 years * 12 months
      expect(projected.projectedTotal).to.equal(MONTHLY_RELEASE * 360n);
    });
  });

  describe("Access Control", function () {
    it("Should have correct owner", async function () {
      expect(await timeLock.owner()).to.equal(owner.address);
    });

    it("Should allow owner to transfer ownership", async function () {
      await timeLock.transferOwnership(otherAccount.address);
      expect(await timeLock.owner()).to.equal(otherAccount.address);
    });

    it("Should emit distributor update event", async function () {
      await expect(timeLock.updateValidatorRewardDistributor(otherAccount.address))
        .to.emit(timeLock, "ValidatorRewardDistributorUpdated")
        .withArgs(otherAccount.address);
    });
  });
});