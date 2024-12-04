import type { ContractArtifact, FunctionAbi } from '@aztec/foundation/abi';

import { JSONRPCClient } from '@walletmesh/jsonrpc';
import type { JSONRPCResponse } from '@walletmesh/jsonrpc';
import type { AztecWalletRPCMethodMap, TransactionParams } from './types.js';

/**
 * Provides an interface to interact with the Aztec Wallet over JSON-RPC.
 */
export class AztecProviderRPC {
  private client: JSONRPCClient<AztecWalletRPCMethodMap>;

  /**
   * Creates a new AztecProviderRPC instance.
   * @param sendRequest - A function to send JSON-RPC requests.
   */
  constructor(sendRequest: (request: unknown) => void) {
    this.client = new JSONRPCClient<AztecWalletRPCMethodMap>(sendRequest);
  }

  /**
   * Connects to the Aztec network.
   * @returns A boolean indicating the connection status.
   */
  async connect(): Promise<boolean> {
    return this.client.callMethod('aztec_connect');
  }

  /**
   * Retrieves the account address from the wallet.
   * @returns The account address as a string.
   */
  async getAccount(): Promise<string> {
    return this.client.callMethod('aztec_getAccount');
  }

  /**
   * Sends one or more transactions to the Aztec network.
   * @param params - A single transaction or an array of transactions.
   * @returns The transaction hash as a string.
   */
  async sendTransaction(params: TransactionParams | TransactionParams[]): Promise<string> {
    return this.client.callMethod('aztec_sendTransaction', params);
  }

  /**
   * Simulates a transaction on the Aztec network.
   * @param contractAddress - The contract address.
   * @param functionAbi - The function ABI.
   * @param args - The arguments for the function.
   * @returns The result of the transaction simulation.
   */
  async simulateTransaction(params: TransactionParams): Promise<unknown> {
    return this.client.callMethod('aztec_simulateTransaction', params);
  }

  /**
   * Receives a JSON-RPC response and processes it.
   * @param response - The JSON-RPC response to process.
   */
  public receiveResponse(
    response: JSONRPCResponse<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap>,
  ): void {
    this.client.receiveResponse(response);
  }

  /**
   * Registers a contact in the user's PXE.
   * @param contact - The contact to register.
   * @returns A boolean indicating the registration status.
   */
  async registerContact(contact: string): Promise<boolean> {
    return this.client.callMethod('aztec_registerContact', { contact });
  }

  /**
   * Registers a contract in the user's PXE.
   * @param contractArtifact - The contract artifact.
   * @param contractAddress - The contract address.
   * @returns A boolean indicating the registration status.
   */
  async registerContract(contractArtifact: ContractArtifact, contractAddress: string): Promise<boolean> {
    return this.client.callMethod('aztec_registerContract', { contractArtifact, contractAddress });
  }
}
