import type { ContractArtifact, FunctionAbi } from '@aztec/foundation/abi';

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
   * Sends a transaction to the Aztec network.
   */
  aztec_sendTransaction: {
    params: {
      contractAddress: string;
      functionAbi: FunctionAbi;
      args: unknown[];
    };
    result: string; // Return the transaction hash
  };

  /**
   * Simulates a transaction on the Aztec network.
   */
  aztec_simulateTransaction: {
    params: {
      contractAddress: string;
      functionAbi: FunctionAbi;
      args: unknown[];
    };
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
