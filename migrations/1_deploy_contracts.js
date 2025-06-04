const LendingContract = artifacts.require('Lending');

module.exports = async function (deployer) {
  await deployer.deploy(LendingContract);
};
