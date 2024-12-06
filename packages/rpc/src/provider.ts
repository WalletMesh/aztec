import type { ContractArtifact } from '@aztec/aztec.js';
import type { ContractInstance } from '@aztec/circuits.js';

import { JSONRPCClient } from '@walletmesh/jsonrpc';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

import type { AztecWalletRPCMethodMap, TransactionFunctionCall, TransactionParams } from './types.js';
import { registerContractClassSerializer, registerContractSerializer } from './utils.js';

/**
 * Client-side provider for interacting with an Aztec Wallet through JSON-RPC.
 * @public
 */
export class AztecProviderRPC extends JSONRPCClient<AztecWalletRPCMethodMap> {
  /**
   * Creates a new AztecProviderRPC instance
   * @param sendRequest - Function to send JSON-RPC requests
   */
  constructor(
    sendRequest: (
      request: JSONRPCRequest<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap>,
    ) => Promise<unknown>,
  ) {
    super(sendRequest);
    this.registerSerializers();
  }

  /**
   * Registers custom serializers for complex data types
   * @internal
   */
  private registerSerializers() {
    this.registerSerializer('aztec_registerContract', { params: registerContractSerializer });
    this.registerSerializer('aztec_registerContractClass', { params: registerContractClassSerializer });
  }

  /**
   * Connects to the Aztec network.
   * @returns True if connection successful
   */
  async connect(): Promise<boolean> {
    return this.callMethod('aztec_connect');
  }

  /**
   * Retrieves the account address from the wallet.
   * @returns The account address as a string
   */
  async getAccount(): Promise<string> {
    return this.callMethod('aztec_getAccount');
  }

  /**
   * Sends one or more transactions to the Aztec network.
   * @param params - The transactions to send and optional authorization witnesses
   * @returns The transaction hash as a string
   */
  async sendTransaction(params: TransactionParams): Promise<string> {
    return this.callMethod('aztec_sendTransaction', params);
  }

  /**
   * Simulates a transaction on the Aztec network.
   * @param params - The transaction function call to simulate
   * @returns The result of the transaction simulation
   */
  async simulateTransaction(params: TransactionFunctionCall): Promise<unknown> {
    return this.callMethod('aztec_simulateTransaction', params);
  }

  /**
   * Registers a contact in the user's PXE.
   * @param contact - The contact to register
   * @returns True if registration successful
   */
  async registerContact(contact: string): Promise<boolean> {
    return this.callMethod('aztec_registerContact', { contact });
  }

  /**
   * Registers a contract in the user's PXE.
   * @param contractAddress - The contract address
   * @param contractInstance - The contract instance
   * @param contractArtifact - Optional contract artifact
   * @returns True if registration successful
   */
  async registerContract(
    contractAddress: string,
    contractInstance: ContractInstance,
    contractArtifact?: ContractArtifact,
  ): Promise<boolean> {
    return this.callMethod('aztec_registerContract', {
      contractAddress,
      contractInstance,
      contractArtifact,
    });
  }

  /**
   * Registers a contract class in the user's PXE.
   * @param contractArtifact - The contract artifact
   * @returns True if registration successful
   */
  async registerContractClass(contractArtifact: ContractArtifact): Promise<boolean> {
    return this.callMethod('aztec_registerContractClass', { contractArtifact });
  }
}
