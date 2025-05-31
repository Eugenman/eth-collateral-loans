import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Lending } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('Lending', () => {
  let lending: Lending;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const LendingFactory = await ethers.getContractFactory('Lending');
    lending = await LendingFactory.deploy();
    await lending.waitForDeployment();
  });

  it('should allow deposit of ETH as collateral', async () => {
    const deposit = ethers.parseEther('1');
    await expect(
      lending.connect(user1).depositCollateral({ value: deposit })
    ).to.changeEtherBalance(lending, deposit);

    const pos = await lending.positions(user1.address);
    expect(pos.collateral).to.equal(deposit);
    expect(pos.debt).to.equal(0);
  });

  it('should allow borrowing up to 66% of collateral', async () => {
    const deposit = ethers.parseEther('1');
    const borrow = ethers.parseEther('0.66');

    await lending.connect(user1).depositCollateral({ value: deposit });
    await expect(() => lending.connect(user1).borrow(borrow)).to.changeEtherBalance(user1, borrow);

    const pos = await lending.positions(user1.address);
    expect(pos.debt).to.equal(borrow);
  });

  it('should reject borrow beyond limit', async () => {
    const deposit = ethers.parseEther('1');
    const excessive = ethers.parseEther('0.8');

    await lending.connect(user1).depositCollateral({ value: deposit });

    await expect(lending.connect(user1).borrow(excessive)).to.be.revertedWith(
      'Exceeds borrow limit'
    );
  });

  it('should allow repayment and update debt', async () => {
    const deposit = ethers.parseEther('1');
    const borrow = ethers.parseEther('0.5');
    const repay = ethers.parseEther('0.2');

    await lending.connect(user1).depositCollateral({ value: deposit });
    await lending.connect(user1).borrow(borrow);
    await lending.connect(user1).repay({ value: repay });

    const pos = await lending.positions(user1.address);
    expect(pos.debt).to.equal(borrow - repay);
  });

  it('should refund excess on full repayment', async () => {
    const deposit = ethers.parseEther('1');
    const borrow = ethers.parseEther('0.5');
    const overpay = ethers.parseEther('1');

    await lending.connect(user1).depositCollateral({ value: deposit });
    await lending.connect(user1).borrow(borrow);

    await expect(() => lending.connect(user1).repay({ value: overpay })).to.changeEtherBalance(
      user1,
      borrow - overpay
    );
  });

  it('should allow withdrawing collateral if health ratio is safe', async () => {
    const deposit = ethers.parseEther('1');
    const borrow = ethers.parseEther('0.5');
    const withdraw = ethers.parseEther('0.25');

    await lending.connect(user1).depositCollateral({ value: deposit });
    await lending.connect(user1).borrow(borrow);

    await expect(() => lending.connect(user1).withdrawCollateral(withdraw)).to.changeEtherBalance(
      user1,
      withdraw
    );

    const pos = await lending.positions(user1.address);
    expect(pos.collateral).to.equal(deposit - withdraw);
  });

  it('should reject withdrawing if it violates collateral ratio', async () => {
    const deposit = ethers.parseEther('1');
    const borrow = ethers.parseEther('0.5');
    const withdraw = ethers.parseEther('0.6');

    await lending.connect(user1).depositCollateral({ value: deposit });
    await lending.connect(user1).borrow(borrow);

    await expect(lending.connect(user1).withdrawCollateral(withdraw)).to.be.revertedWith(
      'Cannot withdraw below required collateral'
    );
  });
});
