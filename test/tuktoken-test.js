const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('TukToken', function () {
  let TukTokenFactory;
  let TukTokenInstance;

  before(async function () {
    TukTokenFactory = await ethers.getContractFactory('TukToken');
  });

  beforeEach(async function () {
    TukTokenInstance = await upgrades.deployProxy(TukTokenFactory, []);
    await TukTokenInstance.deployed();
  });

  it('Check token total supply', async () => {
    // Check if total supply is 2 billion
    expect(await TukTokenInstance.totalSupply()).to.be.equal(
      ethers.utils.parseEther('2000000000')
    );
  });
});
