import { AztecAddress, Contract, ContractFunctionInteraction } from '@aztec/aztec.js';
import type { Wallet } from '@aztec/aztec.js';
import type { ContractArtifact, FunctionAbi } from '@aztec/foundation/abi';

import { JSONRPCServer } from '@walletmesh/jsonrpc';
import type { JSONRPCMiddleware, JSONRPCRequest } from '@walletmesh/jsonrpc';

import type { AztecWalletRPCMethodMap } from './types.js';

export type AztecWalletRPCMiddleware = JSONRPCMiddleware<AztecWalletRPCMethodMap>;

/**
 * JSON-RPC interface to an Aztec Wallet.
 */
export class AztecWalletRPC extends JSONRPCServer<AztecWalletRPCMethodMap> {
  private wallet: Wallet;

  /**
   * Creates a new AztecWalletRPC instance.
   * @param wallet - The underlying Wallet instance.
   * @param sendResponse - A function to send JSON-RPC responses.
   */
  constructor(wallet: Wallet, sendResponse: (response: unknown) => Promise<void>) {
    super(sendResponse);
    this.wallet = wallet;
    this.registerMethods();
  }

  /**
   * Registers the JSON-RPC methods supported by this wallet.
   */
  private registerMethods() {
    this.registerMethod('aztec_connect', this.connect.bind(this));
    this.registerMethod('aztec_getAccount', this.getAccount.bind(this));
    this.registerMethod('aztec_sendTransaction', this.sendTransaction.bind(this));
    this.registerMethod('aztec_simulateTransaction', this.simulateTransaction.bind(this));
    this.registerMethod('aztec_registerContact', this.registerContact.bind(this));
    this.registerMethod('aztec_registerContract', this.registerContract.bind(this));
  }

  /**
   * Handles the 'aztec_connect' JSON-RPC method.
   * @returns A boolean indicating the connection status.
   */
  private connect() {
    return true;
  }

  /**
   * Handles the 'aztec_getAccount' JSON-RPC method.
   * @returns The account address as a string.
   */
  private getAccount() {
    const accountAddress = this.wallet.getAddress().toString();
    return accountAddress;
  }

  /**
   * Handles the 'aztec_sendTransaction' JSON-RPC method.
   * @param params - The parameters for the transaction.
   * @param params.contractAddress - The address of the contract to interact with.
   * @param params.functionAbi - The ABI of the function to call.
   * @param params.args - The arguments to pass to the function.
   * @returns The transaction hash as a string.
   */
  private async sendTransaction(params: {
    contractAddress: string;
    functionAbi: FunctionAbi;
    args: unknown[];
  }): Promise<string> {
    const { contractAddress, functionAbi, args } = params;
    const addr = AztecAddress.fromString(contractAddress);
    const interaction = new ContractFunctionInteraction(this.wallet, addr, functionAbi, args);
    const sentTx = interaction.send();
    return (await sentTx.getTxHash()).toString();
  }

  /**
   * Handles the 'aztec_simulateTransaction' JSON-RPC method.
   * @param params - The parameters for simulating the transaction.
   * @param params.contractAddress - The address of the contract to interact with.
   * @param params.functionAbi - The ABI of the function to simulate.
   * @param params.args - The arguments to pass to the function.
   * @returns The result of the transaction simulation.
   */
  private async simulateTransaction(params: {
    contractAddress: string;
    functionAbi: FunctionAbi;
    args: unknown[];
  }): Promise<unknown> {
    const { contractAddress, functionAbi, args } = params;
    const addr = AztecAddress.fromString(contractAddress);
    const interaction = new ContractFunctionInteraction(this.wallet, addr, functionAbi, args);
    const result = interaction.simulate();
    return result;
  }

  /**
   * Registers a contact in the user's PXE.
   * @param params - The parameters for registering the contact.
   * @returns A boolean indicating the registration status.
   */
  private async registerContact(params: { contact: string }): Promise<boolean> {
    const { contact } = params;
    const addr = AztecAddress.fromString(contact);
    try {
      await this.wallet.registerContact(addr);
      return true;
    } catch (error) {
      console.error('Error registering contact', error);
      return false;
    }
  }

  /**
   * Registers a contract in the user's PXE.
   * @param params - The parameters for registering the contract.
   * @returns A boolean indicating the registration status.
   */
  private async registerContract(params: {
    contractArtifact: ContractArtifact;
    contractAddress: string;
  }): Promise<boolean> {
    const { contractArtifact, contractAddress } = params;
    const addr = AztecAddress.fromString(contractAddress);
    try {
      const contract = await Contract.at(addr, contractArtifact, this.wallet);
      await this.wallet.registerContract(contract);
      return true;
    } catch (error) {
      console.error('Error registering contract', error);
      return false;
    }
  }
}
