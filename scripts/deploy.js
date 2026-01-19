import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("YourTokenName"); 
  const token = await Token.deploy();

  await token.waitForDeployment();

  console.log("Token deployed to:", await token.getAddress());
  console.log("Deployed by:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});