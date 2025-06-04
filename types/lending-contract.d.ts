import { Contract } from 'web3-eth-contract';

declare module 'web3-eth-contract' {
  interface Contract {
    depositCollateral(options: { from: string; value: string }): Promise<any>;
    borrow(amount: string, options: { from: string }): Promise<any>;
    repay(options: { from: string; value: string }): Promise<any>;
    withdrawCollateral(amount: string, options: { from: string }): Promise<any>;
    positions(user: string): Promise<{
      collateral: string;
      debt: string;
    }>;
  }
}
