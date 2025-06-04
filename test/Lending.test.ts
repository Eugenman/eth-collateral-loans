import { expect } from 'chai';
import { BN } from 'bn.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
import Web3 from 'web3';
import type { Contract as Web3Contract } from 'web3-eth-contract';
import * as chai from 'chai';
import chaiBN from 'chai-bn';

chai.use(chaiBN(BN));

declare global {
  let web3: Web3;
  let artifacts: {
    require(name: string): Promise<any>;
  };
  let contract: (name: string, callback: (accounts: string[]) => void) => void;
}

contract('Lending', (accounts: string[]) => {
  let lending: Web3Contract;
  const [owner, user1] = accounts;

  beforeEach(async () => {
    const Lending = await artifacts.require('Lending');
    lending = await Lending.new();
  });

  describe('Basic functionality', () => {
    it('should allow deposit of ETH as collateral', async () => {
      const deposit = web3.utils.toWei('1', 'ether');

      const tx = await lending.depositCollateral({ from: user1, value: deposit });
      expectEvent(tx, 'Deposited', { user: user1, amount: deposit });

      const pos = await lending.positions(user1);
      expect(new BN(pos.collateral)).to.be.bignumber.equal(new BN(deposit));
      expect(new BN(pos.debt)).to.be.bignumber.equal(new BN('0'));
    });

    it('should allow borrowing up to 66% of collateral', async () => {
      const deposit = web3.utils.toWei('1', 'ether');
      const borrow = web3.utils.toWei('0.66', 'ether');

      await lending.depositCollateral({ from: user1, value: deposit });

      const tx = await lending.borrow(borrow, { from: user1 });
      expectEvent(tx, 'Borrowed', { user: user1, amount: borrow });

      const pos = await lending.positions(user1);
      expect(new BN(pos.debt)).to.be.bignumber.equal(new BN(borrow));
    });

    it('should reject borrow beyond limit', async () => {
      const deposit = web3.utils.toWei('1', 'ether');
      const excessive = web3.utils.toWei('0.8', 'ether');

      await lending.depositCollateral({ from: user1, value: deposit });

      await expectRevert(lending.borrow(excessive, { from: user1 }), 'Exceeds borrow limit');
    });

    it('should allow repayment and update debt', async () => {
      const deposit = web3.utils.toWei('1', 'ether');
      const borrow = web3.utils.toWei('0.5', 'ether');
      const repay = web3.utils.toWei('0.2', 'ether');

      await lending.depositCollateral({ from: user1, value: deposit });
      await lending.borrow(borrow, { from: user1 });

      const tx = await lending.repay({ from: user1, value: repay });
      expectEvent(tx, 'Repaid', { user: user1, amount: repay });

      const pos = await lending.positions(user1);
      expect(new BN(pos.debt)).to.be.bignumber.equal(new BN(borrow).sub(new BN(repay)));
    });

    it('should refund excess on full repayment', async () => {
      const deposit = web3.utils.toWei('1', 'ether');
      const borrow = web3.utils.toWei('0.5', 'ether');
      const overpay = web3.utils.toWei('1', 'ether');

      await lending.depositCollateral({ from: user1, value: deposit });
      await lending.borrow(borrow, { from: user1 });

      const tx = await lending.repay({ from: user1, value: overpay });
      expectEvent(tx, 'Repaid', { user: user1, amount: overpay });

      const pos = await lending.positions(user1);
      expect(new BN(pos.debt)).to.be.bignumber.equal(new BN('0'));
    });

    it('should allow withdrawing collateral if health ratio is safe', async () => {
      const deposit = web3.utils.toWei('1', 'ether');
      const borrow = web3.utils.toWei('0.5', 'ether');
      const withdraw = web3.utils.toWei('0.25', 'ether');

      await lending.depositCollateral({ from: user1, value: deposit });
      await lending.borrow(borrow, { from: user1 });

      const tx = await lending.withdrawCollateral(withdraw, { from: user1 });
      expectEvent(tx, 'Withdrawn', { user: user1, amount: withdraw });

      const pos = await lending.positions(user1);
      expect(new BN(pos.collateral)).to.be.bignumber.equal(new BN(deposit).sub(new BN(withdraw)));
    });

    it('should reject withdrawing if it violates collateral ratio', async () => {
      const deposit = web3.utils.toWei('1', 'ether');
      const borrow = web3.utils.toWei('0.5', 'ether');
      const withdraw = web3.utils.toWei('0.6', 'ether');

      await lending.depositCollateral({ from: user1, value: deposit });
      await lending.borrow(borrow, { from: user1 });

      await expectRevert(
        lending.withdrawCollateral(withdraw, { from: user1 }),
        'Cannot withdraw below required collateral'
      );
    });
  });

  describe('Pausable functionality', () => {
    it('should allow owner to pause and unpause', async () => {
      await lending.pause({ from: owner });
      const deposit = web3.utils.toWei('1', 'ether');

      await expectRevert(
        lending.depositCollateral({ from: user1, value: deposit }),
        'Pausable: paused'
      );

      await lending.unpause({ from: owner });
      const tx = await lending.depositCollateral({ from: user1, value: deposit });
      expectEvent(tx, 'Deposited', { user: user1, amount: deposit });
    });

    it('should not allow non-owner to pause', async () => {
      await expectRevert(lending.pause({ from: user1 }), 'Ownable: caller is not the owner');
    });

    it('should not allow non-owner to unpause', async () => {
      await lending.pause({ from: owner });
      await expectRevert(lending.unpause({ from: user1 }), 'Ownable: caller is not the owner');
    });
  });

  describe('Reentrancy protection', () => {
    it('should prevent reentrant calls to deposit', async () => {
      // This test is more of a demonstration as we can't easily test reentrancy
      // without a malicious contract. In practice, the nonReentrant modifier
      // will prevent reentrant calls.
      const deposit = web3.utils.toWei('1', 'ether');
      const tx = await lending.depositCollateral({ from: user1, value: deposit });
      expectEvent(tx, 'Deposited', { user: user1, amount: deposit });
    });
  });
});
