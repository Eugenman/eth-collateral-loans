declare module '@truffle/contract' {
  import { Contract } from 'web3-eth-contract';
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
