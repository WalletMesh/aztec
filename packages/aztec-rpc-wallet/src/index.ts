/**
 * @module @walletmesh/aztec-rpc-wallet
 *
 * This module provides a JSON-RPC implementation for interacting with Aztec Network.
 * It enables communication between dApps and wallets through a standardized interface.
 */

/**
 * Provider class for dApps to interact with Aztec wallets
 * @see AztecProvider
 */
export { AztecProvider } from './provider.js';

/**
 * Operation builder for chaining RPC method calls
 * @see AztecOperationBuilder
 */
export { AztecOperationBuilder } from './operation.js';

/**
 * Wallet implementation that handles RPC requests from dApps
 * @see AztecWallet
 */
export { AztecChainWallet as AztecWallet } from './wallet.js';

/**
 * Error handling utilities for RPC communication
 * @see AztecWalletError
 * @see AztecWalletErrorMap
 */
export { AztecWalletError, AztecWalletErrorMap } from './errors.js';

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
  /** Complete method map including all Aztec methods */
  AztecWalletMethodMap,
  /** Middleware type for processing RPC requests */
  AztecWalletMiddleware,
  /** Type for contract function calls */
  TransactionFunctionCall,
  /** Parameters for transaction requests */
  TransactionParams,
} from './types.js';
