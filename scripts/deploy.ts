import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying Lending contract...');

  const Lending = await ethers.getContractFactory('Lending');
  const lending = await Lending.deploy();

  await lending.deployed();

  console.log(`✅ Lending deployed to: ${lending.address}`);
}

main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exitCode = 1;
});
