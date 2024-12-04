import type { ContractArtifact, FunctionAbi } from '@aztec/foundation/abi';

export type TransactionParams = {
  /** The address of the contract to interact with. */
  contractAddress: string;
  /** The ABI of the function to call. */
  functionAbi: FunctionAbi;
  /** The arguments to pass to the function. */
  args: unknown[];
  /** Optional authorization witness as a string. */
  authwit?: string;
};

/**
 * A mapping of JSON-RPC methods to their parameters and return types for Aztec Wallets.
 */
export type AztecWalletRPCMethodMap = {
  /**
   * Connects to the Aztec network.
   */
  aztec_connect: { params: null; result: boolean };

  /**
   * Retrieves the account address.
   */
  aztec_getAccount: { params: null; result: string };

  /**
   * Sends one or more transactions to the Aztec network.
   * @param params - A single transaction or an array of transactions.
   * @returns The transaction hash as a string.
   */
  aztec_sendTransaction: {
    params: TransactionParams | TransactionParams[];
    result: string; // Return the transaction hash
  };

  /**
   * Simulates a transaction on the Aztec network.
   */
  aztec_simulateTransaction: {
    params: TransactionParams;
    result: unknown; // Returns the result of the transaction
  };

  /**
   * Registers a contact in the user's PXE.
   */
  aztec_registerContact: {
    params: {
      contact: string;
    };
    result: boolean;
  };

  /**
   * Registers a contract in the user's PXE.
   */
  aztec_registerContract: {
    params: {
      contractArtifact: ContractArtifact;
      contractAddress: string;
    };
    result: boolean;
  };
};
