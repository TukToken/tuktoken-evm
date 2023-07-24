//SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title TukToken contract
 * @dev TUK token is the native token in the smart contract
 */
contract TukToken is
    ERC20Upgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    uint256 public constant TOTAL_SUPPLY = 2 * 10 ** 27; // target total supply of TUK is 2 billion

    function initialize() public initializer {
        __Ownable_init();
        ERC20Upgradeable.__ERC20_init("TukToken", "TUK");

        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @dev Allow the company to issue any amount of TUK to any wallet
     * - Only called by owner
     * @param _addr The address to mint token
     * @param _amount The amount to be minted
     */
    function mint(address _addr, uint256 _amount) external onlyOwner {
        _mint(_addr, _amount);
    }
}
