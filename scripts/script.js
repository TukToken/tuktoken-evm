const { ethers, upgrades } = require('hardhat');

async function main() {
  const creator = "0xa311d206eb0e0b1873a1587be3867b8c196f8a79";
  // const TukTokenFactory = await ethers.getContractFactory('TukToken');

  const VestingInstance = await ethers.getContractAt('Vesting', "0x11eFD188478dEEdB9F829407E8c9113578F40346");
  // 1K vest, 10% TGE, 120s cliff, 180s vesting
  // await VestingInstance.addVestingSchedule(creator, ethers.utils.parseEther('1000'), 10, 0, 120, 180);
  await VestingInstance.claim(creator);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
