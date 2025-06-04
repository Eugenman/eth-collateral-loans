// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Lending is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    struct Position {
        uint256 collateral; // in ETH
        uint256 debt;       // in ETH
    }

    mapping(address => Position) public positions;

    uint256 public constant COLLATERAL_FACTOR = 150; // 150%
    uint256 public constant BASE = 100;

    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event CollateralFactorUpdated(uint256 newFactor);

    constructor() {}

    // --- Deposit ETH as collateral ---
    function depositCollateral() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Deposit must be > 0");
        positions[msg.sender].collateral = positions[msg.sender].collateral.add(msg.value);

        emit Deposited(msg.sender, msg.value);
    }

    // --- Borrow ETH based on collateral ---
    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        Position storage pos = positions[msg.sender];

        require(pos.collateral > 0, "No collateral deposited");

        uint256 maxBorrow = pos.collateral.mul(BASE).div(COLLATERAL_FACTOR);
        require(pos.debt.add(amount) <= maxBorrow, "Exceeds borrow limit");

        pos.debt = pos.debt.add(amount);
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Borrowed(msg.sender, amount);
    }

    // --- Repay debt ---
    function repay() external payable nonReentrant whenNotPaused {
        Position storage pos = positions[msg.sender];
        require(pos.debt > 0, "No outstanding debt");

        uint256 repayAmount = msg.value;
        if (repayAmount > pos.debt) {
            uint256 excess = repayAmount.sub(pos.debt);
            pos.debt = 0;
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Transfer failed");
        } else {
            pos.debt = pos.debt.sub(repayAmount);
        }

        emit Repaid(msg.sender, repayAmount);
    }

    // --- Withdraw unlocked collateral ---
    function withdrawCollateral(uint256 amount) external nonReentrant whenNotPaused {
        Position storage pos = positions[msg.sender];
        require(amount > 0, "Amount must be > 0");
        require(pos.collateral >= amount, "Not enough collateral");

        uint256 remainingCollateral = pos.collateral.sub(amount);
        uint256 maxBorrow = remainingCollateral.mul(BASE).div(COLLATERAL_FACTOR);
        require(pos.debt <= maxBorrow, "Cannot withdraw below required collateral");

        pos.collateral = pos.collateral.sub(amount);
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // --- View borrowable amount ---
    function getMaxBorrow(address user) external view returns (uint256) {
        Position memory pos = positions[user];
        return pos.collateral.mul(BASE).div(COLLATERAL_FACTOR).sub(pos.debt);
    }

    // --- Admin functions ---
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Fallback to receive ETH ---
    receive() external payable {
        this.depositCollateral{value: msg.value}();
    }
}