//SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title Vesting contract
 * @dev Vesting contract
 */
contract Vesting is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IERC20Upgradeable public TUK;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 tgePercent;
        uint256 lockDuration;
        uint256 cliffDuration;
        uint256 vestingDuration;
        uint256 releasedAmount;
        uint256 initTime;
        uint256 lastUpdateTime;
    }

    mapping(address => VestingSchedule[]) public vestingSchedules;

    function initialize(address _tuk) public initializer {
        __Ownable_init();

        TUK = IERC20Upgradeable(_tuk);
    }

    /**
     * @dev Adds a vesting schedule for a recipient
     * - Only called by owner
     * @param recipient The address of the recipient
     * @param totalAmount The total amount to be vested
     * @param tgePercent The percentage of release after TGE
     * @param lockDuration The duration of the lock period
     * @param cliffDuration The duration of the cliff period
     * @param vestingDuration The duration of the vesting period
     * Ex; 6 months lock, monthly vest over 6 years
     * tgePercent = 0, lockDuration = 6 month(in sec), cliffDuration = 0 month(in sec), vestingDuration = 6 year(in sec)
     * Ex; 10% TGE, 2 month cliff, 4 month vesting
     * tgePercent = 10, lockDuration = 0 month(in sec), cliffDuration = 2 month(in sec), vestingDuration = 4 month(in sec)
     */
    function addVestingSchedule(
        address recipient,
        uint256 totalAmount,
        uint256 tgePercent,
        uint256 lockDuration,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient address");
        require(totalAmount > 0, "Invalid total amount");
        require(tgePercent <= 100, "Invalid TGE percentage");

        uint256 releaseAmount = (totalAmount * tgePercent) / 100;
        if (releaseAmount != 0) {
            TUK.transfer(recipient, releaseAmount);
        }

        vestingSchedules[recipient].push(
            VestingSchedule({
                totalAmount: totalAmount,
                tgePercent: tgePercent,
                lockDuration: lockDuration,
                cliffDuration: cliffDuration,
                vestingDuration: vestingDuration,
                releasedAmount: releaseAmount,
                initTime: block.timestamp,
                lastUpdateTime: block.timestamp
            })
        );
    }

    /**
     * @dev Claims a vested amount for a recipient
     * @param recipient The address of the recipient
     */
    function claim(address recipient) external nonReentrant {
        require(vestingSchedules[recipient].length > 0, "No vesting schedule found for the recipient");

        uint256 totalClaimAmount;
        for (uint256 i = 0; i < vestingSchedules[recipient].length; i++) {
            VestingSchedule storage vestingSchedule = vestingSchedules[recipient][i];
            
            uint256 vestedAmount = calculateVestedAmount(vestingSchedule);
            uint256 amountToClaim = vestedAmount - vestingSchedule.releasedAmount;

            if (amountToClaim == 0) continue;

            totalClaimAmount += amountToClaim;
            vestingSchedule.releasedAmount = vestedAmount;
            vestingSchedule.lastUpdateTime = block.timestamp;
        }

        require(totalClaimAmount > 0, "No amount to claim at the moment");

        TUK.transfer(recipient, totalClaimAmount);
    }

    /**
     * @dev Calculates the vested amount based on the vesting schedule
     * @param vestingSchedule The vesting schedule
     * @return The vested amount
     */
    function calculateVestedAmount(VestingSchedule storage vestingSchedule) internal view returns (uint256) {
        uint256 initialReleaseAmount = (vestingSchedule.totalAmount * vestingSchedule.tgePercent) / 100;
        uint256 vestingPeriod = vestingSchedule.lockDuration + vestingSchedule.cliffDuration + vestingSchedule.vestingDuration;
        if (block.timestamp < vestingSchedule.initTime + vestingSchedule.lockDuration + vestingSchedule.cliffDuration) {
            return initialReleaseAmount;
        } else if (block.timestamp >= vestingSchedule.initTime + vestingPeriod) {
            return vestingSchedule.totalAmount;
        } else {
            uint256 timeSinceLastUpdate = block.timestamp - vestingSchedule.initTime - vestingSchedule.lockDuration;
            uint256 totalVestingAmount = vestingSchedule.totalAmount - initialReleaseAmount;
            return (totalVestingAmount * timeSinceLastUpdate) / (vestingPeriod - vestingSchedule.lockDuration) + initialReleaseAmount;
        }
    }
}
