declare module '@openzeppelin/test-helpers' {
  export function expectRevert(promise: Promise<any>, reason?: string): Promise<void>;
  export function expectEvent(receipt: any, eventName: string, eventArgs?: any): void;
}
