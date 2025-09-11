const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BrainArkValidatorTimeLock contract...");

  // Get deployment parameters
  const BAK_TOKEN_ADDRESS = process.env.BAK_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  const VALIDATOR_REWARD_DISTRIBUTOR = process.env.VALIDATOR_REWARD_DISTRIBUTOR || "0x0000000000000000000000000000000000000000";
  const START_TIME = process.env.START_TIME || Math.floor(Date.now() / 1000) + 86400; // Default: 24 hours from now

  console.log("📋 Deployment Parameters:");
  console.log("  BAK Token Address:", BAK_TOKEN_ADDRESS);
  console.log("  Validator Reward Distributor:", VALIDATOR_REWARD_DISTRIBUTOR);
  console.log("  Start Time:", new Date(START_TIME * 1000).toISOString());

  // Validate addresses
  if (BAK_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ BAK_TOKEN_ADDRESS environment variable not set");
  }
  if (VALIDATOR_REWARD_DISTRIBUTOR === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ VALIDATOR_REWARD_DISTRIBUTOR environment variable not set");
  }

  // Deploy the contract
  const TimeLock = await hre.ethers.getContractFactory("BrainArkValidatorTimeLock");
  const timeLock = await TimeLock.deploy(
    BAK_TOKEN_ADDRESS,
    VALIDATOR_REWARD_DISTRIBUTOR,
    START_TIME
  );

  await timeLock.waitForDeployment();
  const contractAddress = await timeLock.getAddress();

  console.log("✅ BrainArkValidatorTimeLock deployed to:", contractAddress);

  // Display contract information
  console.log("\n📊 Contract Details:");
  const lockParams = await timeLock.getLockParameters();
  console.log("  Total Locked Amount:", hre.ethers.formatEther(lockParams.totalLocked), "BAK");
  console.log("  Annual Release Amount:", hre.ethers.formatEther(lockParams.annualRelease), "BAK");
  console.log("  Monthly Release Amount:", hre.ethers.formatEther(lockParams.monthlyRelease), "BAK");
  console.log("  Lock Duration:", lockParams.lockDuration.toString(), "seconds (30 years)");
  console.log("  Start Time:", new Date(Number(lockParams.startTimestamp) * 1000).toISOString());
  console.log("  End Time:", new Date(Number(lockParams.endTimestamp) * 1000).toISOString());

  // Display projected releases
  const projectedReleases = await timeLock.getProjectedReleases();
  console.log("\n🗓️ Release Schedule:");
  console.log("  Total Months:", projectedReleases.totalMonths.toString());
  console.log("  Projected Total Release:", hre.ethers.formatEther(projectedReleases.projectedTotal), "BAK");

  console.log("\n💡 Next Steps:");
  console.log("1. Transfer 400M BAK tokens to the contract:", contractAddress);
  console.log("2. Verify the contract deployment");
  console.log("3. Set up monitoring for automated releases");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    bakTokenAddress: BAK_TOKEN_ADDRESS,
    validatorRewardDistributor: VALIDATOR_REWARD_DISTRIBUTOR,
    startTime: START_TIME,
    deploymentTime: Math.floor(Date.now() / 1000),
    network: hre.network.name,
    deployer: await timeLock.owner()
  };

  console.log("\n📝 Deployment completed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Transaction hash will be displayed above ⬆️");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });