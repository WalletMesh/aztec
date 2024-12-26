import { JSONRPCNode } from '@walletmesh/jsonrpc';
import type { Transport } from '@walletmesh/jsonrpc';
import type { RouterMethodMap, RouterEventMap } from '@walletmesh/router';
import { AztecWalletRPCError } from './errors.js';
import type { AztecChainId } from './types.js';

/**
 * Provider for interacting with multiple Aztec chains through WalletMesh router.
 *
 * This class implements the client-side interface for dApps to communicate with Aztec wallets.
 * It handles:
 * - Connection management for multiple chains
 * - Session tracking
 * - Method calls with proper context
 * - Event handling for wallet state changes
 *
 * @example
 * ```typescript
 * // Create provider with transport
 * const provider = new AztecProviderRPC(transport);
 *
 * // Connect to chains
 * await provider.connect(['aztec:testnet', 'aztec:devnet']);
 *
 * // Get account address
 * const address = await provider.getAccount('aztec:testnet');
 *
 * // Send transaction
 * const txHash = await provider.sendTransaction('aztec:testnet', {
 *   functionCalls: [{
 *     contractAddress: "0x...",
 *     functionName: "transfer",
 *     args: [recipient, amount]
 *   }]
 * });
 * ```
 */
export class AztecProviderRPC extends JSONRPCNode<RouterMethodMap, RouterEventMap> {
  private sessionId?: string;
  private connectedChains: Set<AztecChainId>;
  private requestedChains: Set<AztecChainId>;

  constructor(transport: Transport) {
    super(transport);
    this.connectedChains = new Set();
    this.requestedChains = new Set();

    // Bind event handlers
    this.handleWalletStateChanged = this.handleWalletStateChanged.bind(this);
    this.handleSessionTerminated = this.handleSessionTerminated.bind(this);

    // Register event handlers
    this.on('wm_walletStateChanged', this.handleWalletStateChanged);
    this.on('wm_sessionTerminated', this.handleSessionTerminated);
  }

  /**
   * Handles wallet state change events from the router.
   * Updates the set of connected chains based on account availability.
   * @param params - Event parameters containing chain ID and changes
   */
  private handleWalletStateChanged(params: RouterEventMap['wm_walletStateChanged']): void {
    const { chainId, changes } = params;
    const aztecChainId = chainId as AztecChainId;

    // Only handle events for requested chains
    if (this.requestedChains.has(aztecChainId)) {
      if (changes.accounts && changes.accounts.length > 0) {
        this.connectedChains.add(aztecChainId);
        console.log('Chain connected:', aztecChainId);
      } else {
        this.connectedChains.delete(aztecChainId);
        console.log('Chain disconnected:', aztecChainId);
      }
      console.log('Connected chains:', Array.from(this.connectedChains));
    }
  }

  /**
   * Handles session termination events from the router.
   * Cleans up session state and connected chains.
   * @param params - Event parameters containing session ID
   */
  private handleSessionTerminated(params: RouterEventMap['wm_sessionTerminated']): void {
    const { sessionId } = params;
    if (sessionId === this.sessionId) {
      this.sessionId = undefined;
      this.connectedChains.clear();
      this.requestedChains.clear();
      console.log('Session terminated, all chains cleared');
    }
  }

  /**
   * Connects to one or more Aztec chains.
   * Requests permissions for basic operations on each chain.
   * @param chains - Array of chain IDs to connect to
   * @returns Session ID for the connection
   * @throws {AztecWalletRPCError} If connection fails or response is invalid
   */
  public async connect(chains: AztecChainId[]): Promise<string> {
    // Request connection with permissions for all chains
    const permissions: Record<string, string[]> = {};
    for (const chainId of chains) {
      permissions[chainId] = [
        'aztec_getAccount',
        'aztec_sendTransaction',
        'aztec_simulateTransaction',
        'aztec_registerContract',
        'aztec_registerContractClass',
        'aztec_registerSender',
      ];
    }

    const response = await this.callMethod('wm_connect', { permissions });
    if (typeof response === 'object' && response !== null && 'sessionId' in response) {
      this.sessionId = String(response.sessionId);
      // Track requested chains for permission checks
      this.requestedChains = new Set(chains);
      return this.sessionId;
    }
    throw new AztecWalletRPCError('invalidResponse', 'Invalid connect response format');
  }

  /**
   * Disconnects from all chains and terminates the session.
   * Cleans up all connection state.
   */
  public async disconnect(): Promise<void> {
    if (!this.sessionId) return;

    await this.callMethod('wm_disconnect', { sessionId: this.sessionId });
    this.sessionId = undefined;
    this.connectedChains.clear();
    this.requestedChains.clear();
  }

  /**
   * Gets the list of currently connected chain IDs.
   * @returns Array of connected chain IDs
   */
  public getSupportedChains(): AztecChainId[] {
    return Array.from(this.connectedChains);
  }

  /**
   * Gets the account address for the specified chain.
   * @param chainId - ID of the chain to query
   * @returns Account address as a string
   * @throws {AztecWalletRPCError} If chain not connected or response invalid
   */
  public async getAccount(chainId: AztecChainId): Promise<string> {
    const result = await this.callWithContext('aztec_getAccount', chainId);
    if (typeof result !== 'string') {
      throw new AztecWalletRPCError('invalidResponse', 'Expected string account address');
    }
    return result;
  }

  /**
   * Sends a transaction to the specified chain.
   * @param chainId - ID of the chain to send transaction to
   * @param params - Transaction parameters including function calls and optional auth witnesses
   * @returns Transaction hash
   * @throws {AztecWalletRPCError} If transaction fails or response invalid
   */
  public async sendTransaction(chainId: AztecChainId, params: Record<string, unknown>): Promise<string> {
    const result = await this.callWithContext('aztec_sendTransaction', chainId, params);
    if (typeof result !== 'string') {
      throw new AztecWalletRPCError('invalidResponse', 'Expected string transaction hash');
    }
    return result;
  }

  /**
   * Simulates a transaction without submitting it.
   * @param chainId - ID of the chain to simulate on
   * @param params - Transaction parameters to simulate
   * @returns Simulation result
   * @throws {AztecWalletRPCError} If simulation fails
   */
  public async simulateTransaction(chainId: AztecChainId, params: Record<string, unknown>): Promise<unknown> {
    return this.callWithContext('aztec_simulateTransaction', chainId, params);
  }

  /**
   * Registers a contract instance with the wallet.
   * @param chainId - ID of the chain where contract is deployed
   * @param params - Contract registration parameters
   * @throws {AztecWalletRPCError} If registration fails
   */
  public async registerContract(chainId: AztecChainId, params: Record<string, unknown>): Promise<void> {
    await this.callWithContext('aztec_registerContract', chainId, params);
  }

  /**
   * Registers a contract class with the wallet.
   * @param chainId - ID of the chain to register on
   * @param params - Contract class registration parameters
   * @throws {AztecWalletRPCError} If registration fails
   */
  public async registerContractClass(chainId: AztecChainId, params: Record<string, unknown>): Promise<void> {
    await this.callWithContext('aztec_registerContractClass', chainId, params);
  }

  /**
   * Registers a transaction sender with the wallet.
   * @param chainId - ID of the chain to register on
   * @param params - Sender registration parameters
   * @throws {AztecWalletRPCError} If registration fails
   */
  public async registerSender(chainId: AztecChainId, params: Record<string, unknown>): Promise<void> {
    await this.callWithContext('aztec_registerSender', chainId, params);
  }

  /**
   * Makes an RPC call with proper chain and session context.
   * @param method - RPC method name
   * @param chainId - Chain ID for context
   * @param params - Optional method parameters
   * @returns Method result
   * @throws {AztecWalletRPCError} If not connected or chain not supported
   */
  private async callWithContext(
    method: string,
    chainId: AztecChainId,
    params?: Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.sessionId) {
      throw new AztecWalletRPCError('notConnected');
    }

    if (!this.requestedChains.has(chainId)) {
      throw new AztecWalletRPCError('chainNotSupported', chainId);
    }

    // Include context in params
    const paramsWithContext = {
      ...params,
      sessionId: this.sessionId,
      chainId,
    };

    return this.callMethod(method, paramsWithContext);
  }
}
