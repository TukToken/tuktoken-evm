const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

async function advanceBlock() {
  return ethers.provider.send("evm_mine", [])
}

async function advanceTime(time) {
  await ethers.provider.send("evm_increaseTime", [time])
}

async function advanceTimeAndBlock(time) {
  await advanceTime(time)
  await advanceBlock()
}

describe('Vesting', function () {
  let TukTokenFactory, VestingFactory;
  let TukTokenInstance, VestingInstance;
  let owner, addr1, addr2, addrs;
  const monthToSec = 30 * 24 * 60 * 60;

  before(async function () {
    TukTokenFactory = await ethers.getContractFactory('TukToken');
    VestingFactory = await ethers.getContractFactory('Vesting');
  });

  beforeEach(async function () {
    [owner, alice, bob, ...addrs] = await ethers.getSigners();

    TukTokenInstance = await upgrades.deployProxy(TukTokenFactory, []);
    await TukTokenInstance.deployed();

    VestingInstance = await upgrades.deployProxy(VestingFactory, [
      TukTokenInstance.address,
    ]);
    await VestingInstance.deployed();

    // transfer 2B TUK to Vesting
    await TukTokenInstance.transfer(
      VestingInstance.address,
      ethers.utils.parseEther('2000000000')
    );
  });

  it('Check token amount in vesting contract', async () => {
    // Check if total supply is 2 billion
    expect(
      await TukTokenInstance.balanceOf(VestingInstance.address)
    ).to.be.equal(ethers.utils.parseEther('2000000000'));
  });

  context("Test lock and vesting (no TGE, no cliff period)", function () {
    beforeEach(async function () {
      // Add new vesting schedule for alice (24K vest, 24 months lock, monthly vest over 2 years)
      await VestingInstance.addVestingSchedule(alice.address, ethers.utils.parseEther('24000'), 0, 24 * monthToSec, 0, 24 * monthToSec);
    });

    it('Test add vesting schedule', async () => {
      const vestingSchedule = await VestingInstance.vestingSchedules(alice.address, 0);
      expect(vestingSchedule.totalAmount).to.be.equal(ethers.utils.parseEther('24000'));
      expect(vestingSchedule.lockDuration).to.be.equal(24 * monthToSec);
      expect(vestingSchedule.vestingDuration).to.be.equal(24 * monthToSec);
    });

    it('Test revert when claim before lock period', async () => {
      await expect(VestingInstance.claim(alice.address)).to.be.revertedWith("No amount to claim at the moment");
    });

    it('Test claim after lock period', async () => {
      // claim 25 month later
      await advanceTimeAndBlock(25 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.within(ethers.utils.parseEther('999'), ethers.utils.parseEther('1001'));

      // claim after another 1 month
      await advanceTimeAndBlock(1 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.within(ethers.utils.parseEther('1999'), ethers.utils.parseEther('2001'));

      // claim after vesting period
      await advanceTimeAndBlock(22 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther('24000'));
    });
  });

  context("Test TGE, cliff and vesting", function () {
    beforeEach(async function () {
      // Add new vesting schedule for alice (10K vest, 10% TGE, 2 month cliff, 4 month vesting)
      await VestingInstance.addVestingSchedule(alice.address, ethers.utils.parseEther('10000'), 10, 0, 2 * monthToSec, 4 * monthToSec);
    });

    it('Test add vesting schedule', async () => {
      const vestingSchedule = await VestingInstance.vestingSchedules(alice.address, 0);
      expect(vestingSchedule.totalAmount).to.be.equal(ethers.utils.parseEther('10000'));
      expect(vestingSchedule.cliffDuration).to.be.equal(2 * monthToSec);
      expect(vestingSchedule.vestingDuration).to.be.equal(4 * monthToSec);
    });

    it('Test check if initial amount is transferred', async () => {
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther('1000'));
    });

    it('Test revert when claim before cliff period', async () => {
      await expect(VestingInstance.claim(alice.address)).to.be.revertedWith("No amount to claim at the moment");
      await advanceTimeAndBlock(1 * monthToSec);
      await expect(VestingInstance.claim(alice.address)).to.be.revertedWith("No amount to claim at the moment");
    });

    it('Test claim after claim period', async () => {
      // claim 3 month later, vestedAmount = (9000 / 6 month * 3 month) + 1000
      await advanceTimeAndBlock(3 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.within(ethers.utils.parseEther('5500'), ethers.utils.parseEther('5501'));

      // claim after another 1 month
      await advanceTimeAndBlock(1 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.within(ethers.utils.parseEther('7000'), ethers.utils.parseEther('7001'));

      // claim after vesting period
      await advanceTimeAndBlock(2 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther('10000'));
    });
  });

  context("Test with multiple vesting schedules", function () {
    beforeEach(async function () {
      // Add new vesting schedule for alice
      // First - 24K vest, 24 months lock, monthly vest over 2 years
      // Second - 24K vest, 24 months cliff, monthly vest over 2 years
      await VestingInstance.addVestingSchedule(alice.address, ethers.utils.parseEther('24000'), 0, 24 * monthToSec, 0, 24 * monthToSec);
      await VestingInstance.addVestingSchedule(alice.address, ethers.utils.parseEther('24000'), 0, 0, 24 * monthToSec, 24 * monthToSec);
    });

    it('Test add vesting schedule', async () => {
      const vestingSchedule1 = await VestingInstance.vestingSchedules(alice.address, 0);
      expect(vestingSchedule1.totalAmount).to.be.equal(ethers.utils.parseEther('24000'));
      expect(vestingSchedule1.lockDuration).to.be.equal(24 * monthToSec);
      expect(vestingSchedule1.vestingDuration).to.be.equal(24 * monthToSec);

      const vestingSchedule2 = await VestingInstance.vestingSchedules(alice.address, 1);
      expect(vestingSchedule2.totalAmount).to.be.equal(ethers.utils.parseEther('24000'));
      expect(vestingSchedule2.cliffDuration).to.be.equal(24 * monthToSec);
      expect(vestingSchedule2.vestingDuration).to.be.equal(24 * monthToSec);
    });

    it('Test claim after lock and cliff period', async () => {
      // claim 25 month later - vested amount = 1000 + (24K / 48 month) * 25 month
      await advanceTimeAndBlock(25 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.within(ethers.utils.parseEther('13500'), ethers.utils.parseEther('13501'));

      // claim after vesting period - vested amount = 24K + 24K
      await advanceTimeAndBlock(23 * monthToSec);
      await VestingInstance.claim(alice.address);
      expect(await TukTokenInstance.balanceOf(alice.address)).to.be.equal(ethers.utils.parseEther('48000'));
    });
  });
});
