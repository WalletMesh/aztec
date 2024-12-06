import type { ContractArtifact, PXE } from '@aztec/aztec.js';
import type { ContractInstance } from '@aztec/circuits.js';
import type { JSONRPCMiddleware } from '@walletmesh/jsonrpc';

/**
 * Represents a single function call to a contract.
 * @public
 */
export type TransactionFunctionCall = {
  /** The address of the contract to interact with */
  contractAddress: string;
  /** The name of the function to call */
  functionName: string;
  /** The arguments to pass to the function */
  args: unknown[];
};

/**
 * Parameters for sending transactions.
 * @public
 */
export type TransactionParams = {
  /** Array of function calls to execute */
  functionCalls: TransactionFunctionCall[];
  /** Optional array of authorization witnesses for the transaction */
  authwits?: string[];
};

/**
 * A mapping of JSON-RPC methods to their parameters and return types for Aztec Wallets.
 * @public
 */
export type AztecWalletRPCMethodMap = {
  /**
   * Connects to the Aztec network.
   * @returns A boolean indicating if the connection was successful
   */
  aztec_connect: { result: boolean };

  /**
   * Gets the account address from the wallet.
   * @returns The account address as a string
   */
  aztec_getAccount: { result: string };

  /**
   * Sends transactions to the Aztec network.
   * @param params - The transactions to execute and optional authorization witnesses
   * @returns The transaction hash as a string
   */
  aztec_sendTransaction: {
    params: TransactionParams;
    result: string;
  };

  /**
   * Simulates a transaction without executing it.
   * @param params - The transaction to simulate
   * @returns The simulation result
   */
  aztec_simulateTransaction: {
    params: TransactionFunctionCall;
    result: unknown;
  };

  /**
   * Registers a contact in the user's PXE
   * @param params - The contact address to register
   * @returns True if registration was successful
   */
  aztec_registerContact: {
    params: { contact: string };
    result: boolean;
  };

  /**
   * Registers a contract instance in the user's PXE.
   * @param params - The contract details to register
   * @returns True if registration was successful
   */
  aztec_registerContract: {
    params: {
      contractAddress: string;
      contractInstance: ContractInstance;
      contractArtifact?: ContractArtifact;
    };
    result: boolean;
  };

  /**
   * Registers a contract class in the user's PXE.
   * @param params - The contract artifact to register
   * @returns True if registration was successful
   */
  aztec_registerContractClass: {
    params: {
      contractArtifact: ContractArtifact;
    };
    result: boolean;
  };
};

/**
 * Holds the context passed through RPC middleware.
 * @public
 */
export type AztecWalletContext = Record<string, unknown> & {
  /** The PXE instance for the wallet */
  pxe: PXE;
};

/**
 * Type for Aztec wallet RPC middleware.
 * @public
 */
export type AztecWalletRPCMiddleware = JSONRPCMiddleware<AztecWalletRPCMethodMap, AztecWalletContext>;
