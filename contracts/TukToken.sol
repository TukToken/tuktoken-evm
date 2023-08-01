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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        ERC20Upgradeable.__ERC20_init("TukToken", "TUK");

        _mint(msg.sender, TOTAL_SUPPLY);
    }
}
