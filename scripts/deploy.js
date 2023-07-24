const { ethers, upgrades } = require('hardhat');

async function main() {
  // const TukTokenFactory = await ethers.getContractFactory('TukToken');
  // const proxy = await upgrades.deployProxy(TukTokenFactory, []);
  // await proxy.deployed();
  // console.log(`TukTokenProxy deployed to: `, proxy.address);

  const VestingFactory = await ethers.getContractFactory('Vesting');
  const vestingProxy = await upgrades.deployProxy(VestingFactory, ["0xA1AAae2751097aB6a823bd663Ff13eb51A94c479"]);
  await vestingProxy.deployed();
  console.log(`VestingProxy deployed to: `, vestingProxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
