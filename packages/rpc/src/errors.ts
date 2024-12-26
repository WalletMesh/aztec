import { JSONRPCError } from '@walletmesh/jsonrpc';
import type { JSONRPCErrorInterface } from '@walletmesh/jsonrpc';

/**
 * Enum of available Aztec Wallet RPC error types.
 * @public
 */
export const AztecWalletRPCErrorType = {
  unknownInternalError: 'unknownInternalError',
  refused: 'refused',
  walletNotConnected: 'walletNotConnected',
  contractInstanceNotRegistered: 'contractInstanceNotRegistered',
  contractClassNotRegistered: 'contractClassNotRegistered',
  senderNotRegistered: 'senderNotRegistered',
  invalidResponse: 'invalidResponse',
  notConnected: 'notConnected',
  chainNotSupported: 'chainNotSupported',
  invalidRequest: 'invalidRequest',
  invalidParams: 'invalidParams',
  permissionDenied: 'permissionDenied',
  sessionNotFound: 'sessionNotFound',
  sessionExpired: 'sessionExpired',
  transactionNotFound: 'transactionNotFound',
  blockNotFound: 'blockNotFound',
  authWitnessNotFound: 'authWitnessNotFound',
} as const;

/**
 * Type representing valid Aztec Wallet RPC error types.
 * @public
 */
export type AztecWalletRPCErrorType = (typeof AztecWalletRPCErrorType)[keyof typeof AztecWalletRPCErrorType];

/**
 * Map of error codes and messages for Aztec Wallet RPC errors.
 * @public
 */
export const AztecWalletRPCErrorMap: Record<AztecWalletRPCErrorType, { code: number; message: string }> = {
  unknownInternalError: { code: -32000, message: 'Unknown internal error' },
  refused: { code: -32001, message: 'User refused transaction' },
  walletNotConnected: { code: -32002, message: 'Wallet not connected' },
  contractInstanceNotRegistered: { code: -32003, message: 'Contract instance not registered' },
  contractClassNotRegistered: { code: -32004, message: 'Contract class not registered' },
  senderNotRegistered: { code: -32005, message: 'Sender not registered' },
  invalidResponse: { code: -32006, message: 'Invalid response format' },
  notConnected: { code: -32007, message: 'Not connected to any chain' },
  chainNotSupported: { code: -32008, message: 'Chain not supported' },
  invalidRequest: { code: -32009, message: 'Invalid request format' },
  invalidParams: { code: -32010, message: 'Invalid parameters' },
  permissionDenied: { code: -32011, message: 'Permission denied' },
  sessionNotFound: { code: -32012, message: 'Session not found' },
  sessionExpired: { code: -32013, message: 'Session expired' },
  transactionNotFound: { code: -32014, message: 'Transaction not found' },
  blockNotFound: { code: -32015, message: 'Block not found' },
  authWitnessNotFound: { code: -32016, message: 'Authorization witness not found' },
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
  constructor(err: AztecWalletRPCErrorType, data?: string) {
    super(AztecWalletRPCErrorMap[err].code, AztecWalletRPCErrorMap[err].message, data);
  }
}
