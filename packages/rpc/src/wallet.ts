import type { AccountWallet, PXE } from '@aztec/aztec.js';

import { JSONRPCNode, type Transport } from '@walletmesh/jsonrpc';
import { JSONRPCWalletClient } from '@walletmesh/router';

import type {
  AztecWalletMethodMap,
  AztecWalletContext,
  AztecWalletEventMap,
  AztecWalletRouterClient,
} from './types.js';
import { AztecWalletRPCError } from './errors.js';
import { AztecWalletSerializer } from './serializers.js';

import { ContractArtifactCache } from './contractArtifactCache.js';
import { handler } from './handlers.js';

/**
 * @module wallet
 *
 * This module provides the server-side implementation of the Aztec RPC interface.
 * It handles incoming RPC requests from dApps and executes them using an Aztec wallet instance.
 */

/**
 * Type guard to check if a value is an AztecWalletContext.
 * Ensures the context contains required wallet components.
 *
 * @param value - The value to check
 * @returns True if the value is a valid AztecWalletContext
 * @internal
 */
function isAztecWalletContext(value: unknown): value is AztecWalletContext {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pxe' in value &&
    'wallet' in value &&
    'contractArtifactCache' in value
  );
}

/**
 * JSON-RPC interface implementation for an Aztec Wallet.
 *
 * This class provides the core wallet functionality exposed through JSON-RPC:
 * - Handles incoming RPC requests from dApps
 * - Manages wallet state and context
 * - Executes operations through the underlying Aztec wallet
 * - Serializes responses back to JSON-RPC format
 *
 * The wallet supports operations like:
 * - Account management
 * - Transaction execution
 * - Contract interaction
 * - Note management
 * - Event logging
 *
 * @example
 * ```typescript
 * // Create wallet instance
 * const wallet = new AztecChainWallet(aztecWallet, transport);
 *
 * // Handle incoming RPC requests
 * transport.on('message', async (request) => {
 *   const response = await wallet.handleRequest(request);
 *   // Send response back to dApp
 * });
 * ```
 *
 * @public
 */
export class AztecChainWallet extends JSONRPCNode<
  AztecWalletMethodMap,
  AztecWalletEventMap,
  AztecWalletContext
> {
  private pxe: PXE;
  private wallet: AccountWallet;
  private contractArtifactCache: ContractArtifactCache;

  /**
   * Creates a new AztecWalletRPC instance.
   *
   * @param pxe - The PXE instance for the Aztec protocol
   * @param wallet - The underlying Aztec wallet instance that executes operations
   * @param transport - Transport layer for sending/receiving JSON-RPC messages
   *
   * The wallet instance sets up:
   * - Contract artifact caching
   * - Default request handlers
   * - Custom serialization for Aztec types
   */
  constructor(pxe: PXE, wallet: AccountWallet, transport: Transport) {
    const context: AztecWalletContext = {
      pxe,
      wallet,
      contractArtifactCache: new ContractArtifactCache(wallet),
    };
    super(transport, context);

    this.pxe = pxe;
    this.wallet = wallet;
    this.contractArtifactCache = context.contractArtifactCache;

    this.setFallbackHandler(async (handlerContext: AztecWalletContext, method, params) => {
      if (!isAztecWalletContext(handlerContext)) {
        throw new AztecWalletRPCError('unknownInternalError', 'Invalid context');
      }
      return await handler(handlerContext, method, params);
    });
    this.setFallbackSerializer(AztecWalletSerializer);
  }

  /**
   * Creates a client wrapper for use with WalletMesh router.
   * This enables the wallet to be used as a client in a routing setup.
   *
   * @returns Client interface for the wallet
   */
  asWalletRouterClient(): AztecWalletRouterClient {
    return new JSONRPCWalletClient(this);
  }
}
