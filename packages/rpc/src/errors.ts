import { JSONRPCError } from '@walletmesh/jsonrpc';
import type { JSONRPCErrorInterface } from '@walletmesh/jsonrpc';

/**
 * Map of error codes and messages for Aztec Wallet RPC errors.
 * @public
 */
export const AztecWalletRPCErrorMap: Record<string, { code: number; message: string }> = {
  unknownInternalError: { code: -32000, message: 'Unknown internal error' },
  refused: { code: -32001, message: 'User refused transaction' },
  walletNotConnected: { code: -32002, message: 'Wallet not connected' },
  contractInstanceNotRegistered: { code: -32003, message: 'Contract instance not registered' },
  contractClassNotRegistered: { code: -32004, message: 'Contract class not registered' },
  contactNotRegistered: { code: -32005, message: 'Contact not registered' },
};

/**
 * Custom error class for Aztec Wallet RPC errors.
 * @public
 */
export class AztecWalletRPCError extends JSONRPCError {
  /**
   * Creates a new AztecWalletRPCError.
   * @param err - The error type from AztecWalletRPCErrorMap
   * @param data - Optional additional error data
   */
  constructor(err: keyof typeof AztecWalletRPCErrorMap, data?: string) {
    super(AztecWalletRPCErrorMap[err].code, AztecWalletRPCErrorMap[err].message, data);
  }
}
