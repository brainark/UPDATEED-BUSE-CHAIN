// Manual funding script - Run this in hardhat console
const deployerAddress = "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169";
const epoContract = "0xFf6bC094fcb89B818cc606E062872B34d7430F5D";
const airdropContract = "0x4b1D921DD73AcC1ef0cE180B48117C8fF2718f36";

// First, check if we can access the deployer account
const signers = await ethers.getSigners();
console.log("Available signers:", signers.map(s => s.address));

// Check which signer has the BAK balance
for (let i = 0; i < signers.length; i++) {
  const balance = await ethers.provider.getBalance(signers[i].address);
  if (balance > 0) {
    console.log(`Signer ${i} (${signers[i].address}): ${ethers.formatEther(balance)} BAK`);
  }
}

// If we find the right signer, use it to fund contracts
// Replace X with the correct signer index
// const signer = signers[X];
// const epoTx = await signer.sendTransaction({
//   to: epoContract,
//   value: ethers.parseEther("10000000") // 10M BAK
// });
// console.log("EPO funded:", epoTx.hash);

// const airdropTx = await signer.sendTransaction({
//   to: airdropContract,
//   value: ethers.parseEther("5000000") // 5M BAK
// });
// console.log("Airdrop funded:", airdropTx.hash);
