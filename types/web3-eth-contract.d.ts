import { PromiEvent, TransactionReceipt } from 'web3-core';

declare module 'web3-eth-contract' {
  interface Contract {
    depositCollateral(options?: any): PromiEvent<TransactionReceipt>;
    borrow(amount: string, options?: any): PromiEvent<TransactionReceipt>;
    repay(options?: any): PromiEvent<TransactionReceipt>;
    withdrawCollateral(amount: string, options?: any): PromiEvent<TransactionReceipt>;
    getMaxBorrow(user: string): Promise<string>;
    positions(user: string): Promise<{ collateral: string; debt: string }>;
    pause(options?: any): PromiEvent<TransactionReceipt>;
    unpause(options?: any): PromiEvent<TransactionReceipt>;
  }
}
