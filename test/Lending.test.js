const Lending = artifacts.require('Lending');
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const BN = require('bn.js');
const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-bn')(BN));

contract('Lending', accounts => {
  let lending;
  const [owner, user1, user2] = accounts;

  beforeEach(async () => {
    lending = await Lending.new();
  });

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
