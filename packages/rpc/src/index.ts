/**
 * @module @walletmesh/aztec-rpc
 *
 * This module provides a JSON-RPC implementation for interacting with Aztec Network.
 * It enables communication between dApps and wallets through a standardized interface.
 */

/**
 * Provider class for dApps to interact with Aztec wallets
 * @see AztecProviderRPC
 */
export { AztecProviderRPC } from './provider.js';

/**
 * Operation builder for chaining RPC method calls
 * @see AztecOperationBuilder
 */
export { AztecOperationBuilder } from './operation.js';

/**
 * Wallet implementation that handles RPC requests from dApps
 * @see AztecWalletRPC
 */
export { AztecChainWallet as AztecWalletRPC } from './wallet.js';

/**
 * Error handling utilities for RPC communication
 * @see AztecWalletRPCError
 * @see AztecWalletRPCErrorMap
 */
export { AztecWalletRPCError, AztecWalletRPCErrorMap } from './errors.js';

/**
 * Type definitions for RPC interfaces
 */
export type {
  /** Chain identifier type */
  AztecChainId,
  /** Context passed through RPC middleware */
  AztecWalletContext,
  /** Event map for wallet events */
  AztecWalletEventMap,
  /** Method map defining available RPC methods */
  AztecWalletBaseMethodMap as AztecWalletRPCMethodMap,
  /** Complete method map including all Aztec methods */
  AztecWalletMethodMap,
  /** Middleware type for processing RPC requests */
  AztecWalletMiddleware as AztecWalletRPCMiddleware,
  /** Type for contract function calls */
  TransactionFunctionCall,
  /** Parameters for transaction requests */
  TransactionParams,
} from './types.js';
