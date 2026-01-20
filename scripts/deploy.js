const hre = require("hardhat");

async function main() {
  console.log("Deploying AliyaToken...");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  const AliyaToken = await hre.ethers.getContractFactory("AliyaToken");
  const aliyaToken = await AliyaToken.deploy(deployer.address);

  await aliyaToken.waitForDeployment();

  const address = await aliyaToken.getAddress();
  console.log("AliyaToken deployed to:", address);
  console.log("Token name:", await aliyaToken.name());
  console.log("Token symbol:", await aliyaToken.symbol());
  console.log("Total supply:", hre.ethers.formatEther(await aliyaToken.totalSupply()), "ATK");
  console.log("Owner balance:", hre.ethers.formatEther(await aliyaToken.balanceOf(deployer.address)), "ATK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });