import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EtherVeilVault contract...");

  // Get the contract factory
  const EtherVeilVault = await ethers.getContractFactory("EtherVeilVault");

  // Deploy the contract
  // You can set a fee collector address here (e.g., your own address)
  const feeCollector = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Replace with actual address
  
  const etherVeilVault = await EtherVeilVault.deploy(feeCollector);

  await etherVeilVault.waitForDeployment();

  const contractAddress = await etherVeilVault.getAddress();
  
  console.log("EtherVeilVault deployed to:", contractAddress);
  console.log("Fee collector set to:", feeCollector);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    feeCollector,
    deployer: await etherVeilVault.runner?.getAddress(),
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed successfully!");
  console.log("Contract address:", deploymentInfo.contractAddress);
  console.log("Network:", deploymentInfo.network.name, "Chain ID:", deploymentInfo.network.chainId);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
