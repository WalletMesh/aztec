import { JSONRPCNode } from '@walletmesh/jsonrpc';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { RouterMethodMap, RouterEventMap } from '@walletmesh/router';
import { AztecWalletError } from './errors.js';
import type { AztecChainId, AztecWalletMethodMap, TransactionParams } from './types.js';
import { AztecOperationBuilder } from './operation.js';

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
 * const provider = new AztecProvider(transport);
 *
 * // Connect to chains
 * await provider.connect(['aztec:testnet', 'aztec:devnet']);
 *
 * // Single operation using convenience method
 * const address = await provider.getAccount('aztec:testnet');
 *
 * // Single operation using chain builder
 * const txHash = await provider.chain('aztec:testnet')
 *   .call('aztec_sendTransaction', {
 *     functionCalls: [{
 *       contractAddress: "0x...",
 *       functionName: "transfer",
 *       args: [recipient, amount]
 *     }]
 *   })
 *   .execute();
 *
 * // Multiple operations in one call
 * const [account, contracts, blockNumber] = await provider
 *   .chain('aztec:testnet')
 *   .call('aztec_getAccount')
 *   .call('aztec_getContracts')
 *   .call('aztec_getBlockNumber')
 *   .execute();
 * ```
 */
/**
 * Default permissions requested when connecting to chains
 */
const DEFAULT_PERMISSIONS = [
  // Basic operations
  'aztec_connect',
  'aztec_getAccount',
  'aztec_getAddress',

  // Transaction operations
  'aztec_sendTransaction',
  'aztec_simulateTransaction',
  'aztec_getTxReceipt',
  'aztec_getTxEffect',

  // Contract operations
  'aztec_registerContract',
  'aztec_registerContractClass',
  'aztec_getContracts',
  'aztec_getContractInstance',
  'aztec_getContractClass',

  // Chain info
  'aztec_getBlockNumber',
  'aztec_getChainId',
  'aztec_getNodeInfo',
  'aztec_getCurrentBaseFees',

  // Notes and events
  'aztec_getIncomingNotes',
  'aztec_getUnencryptedLogs',
  'aztec_getEncryptedEvents',
] as const;

export class AztecProvider extends JSONRPCNode<RouterMethodMap, RouterEventMap> {
  private sessionId?: string;
  private connectedChains: Set<AztecChainId>;
  private requestedChains: Set<AztecChainId>;

  constructor(transport: JSONRPCTransport) {
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
   * Creates a new operation builder for chaining method calls
   * @param chainId - The chain to execute operations on
   * @returns A new operation builder instance
   */
  public chain(chainId: AztecChainId): AztecOperationBuilder {
    return new AztecOperationBuilder(chainId, this);
  }

  /**
   * Execute a single method call via wm_call
   * @param chainId - The chain to execute on
   * @param method - The method to call
   * @param params - Optional method parameters
   * @returns The method result
   * @throws {AztecWalletError} If not connected or chain not supported
   */
  public async executeCall<M extends keyof AztecWalletMethodMap>(
    chainId: AztecChainId,
    method: M,
    params?: AztecWalletMethodMap[M]['params'],
  ): Promise<AztecWalletMethodMap[M]['result']> {
    if (!this.sessionId) {
      throw new AztecWalletError('notConnected');
    }

    if (!this.requestedChains.has(chainId)) {
      throw new AztecWalletError('chainNotSupported', chainId);
    }

    const result = await this.callMethod('wm_call', {
      chainId,
      sessionId: this.sessionId,
      call: {
        method: String(method),
        params,
      },
    });

    return result as AztecWalletMethodMap[M]['result'];
  }

  /**
   * Execute multiple method calls via wm_bulkCall
   * @param chainId - The chain to execute on
   * @param calls - Array of method calls to execute
   * @returns Array of results in the same order as the calls
   * @throws {AztecWalletError} If not connected or chain not supported
   */
  public async executeBulkCall(
    chainId: AztecChainId,
    calls: Array<{
      method: keyof AztecWalletMethodMap;
      params?: unknown;
    }>,
  ): Promise<unknown[]> {
    if (!this.sessionId) {
      throw new AztecWalletError('notConnected');
    }

    if (!this.requestedChains.has(chainId)) {
      throw new AztecWalletError('chainNotSupported', chainId);
    }

    const results = await this.callMethod('wm_bulkCall', {
      chainId,
      sessionId: this.sessionId,
      calls: calls.map(({ method, params }) => ({
        method: String(method),
        params,
      })),
    });

    return results as unknown[];
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
   * @throws {AztecWalletError} If connection fails or response is invalid
   */
  public async connect(chains: AztecChainId[]): Promise<string> {
    // Request connection with permissions for all chains
    const permissions: Record<string, string[]> = {};
    for (const chainId of chains) {
      permissions[chainId] = [...DEFAULT_PERMISSIONS];
    }

    const response = await this.callMethod('wm_connect', { permissions });
    if (!response || typeof response !== 'object' || !('sessionId' in response)) {
      throw new AztecWalletError('invalidResponse', 'Invalid connect response format');
    }

    this.sessionId = String(response.sessionId);
    this.requestedChains = new Set(chains);
    return this.sessionId;
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
   * @throws {AztecWalletError} If chain not connected or response invalid
   */
  public async getAccount(chainId: AztecChainId): Promise<string> {
    return this.chain(chainId).call('aztec_getAccount').execute();
  }

  /**
   * Sends a transaction to the specified chain.
   * @param chainId - ID of the chain to send transaction to
   * @param params - Transaction parameters including function calls and optional auth witnesses
   * @returns Transaction hash
   * @throws {AztecWalletError} If transaction fails or response invalid
   */
  public async sendTransaction(chainId: AztecChainId, params: TransactionParams): Promise<string> {
    return this.chain(chainId).call('aztec_sendTransaction', params).execute();
  }

  /**
   * Simulates a transaction without submitting it.
   * @param chainId - ID of the chain to simulate on
   * @param params - Transaction parameters to simulate
   * @returns Simulation result
   * @throws {AztecWalletError} If simulation fails
   */
  public async simulateTransaction(
    chainId: AztecChainId,
    params: TransactionParams['functionCalls'][0],
  ): Promise<unknown> {
    return this.chain(chainId).call('aztec_simulateTransaction', params).execute();
  }

  /**
   * Registers a contract instance with the wallet.
   * @param chainId - ID of the chain where contract is deployed
   * @param params - Contract registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerContract(
    chainId: AztecChainId,
    params: AztecWalletMethodMap['aztec_registerContract']['params'],
  ): Promise<void> {
    await this.chain(chainId).call('aztec_registerContract', params).execute();
  }

  /**
   * Registers a contract class with the wallet.
   * @param chainId - ID of the chain to register on
   * @param params - Contract class registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerContractClass(
    chainId: AztecChainId,
    params: AztecWalletMethodMap['aztec_registerContractClass']['params'],
  ): Promise<void> {
    await this.chain(chainId).call('aztec_registerContractClass', params).execute();
  }

  /**
   * Registers a transaction sender with the wallet.
   * @param chainId - ID of the chain to register on
   * @param params - Sender registration parameters
   * @throws {AztecWalletError} If registration fails
   */
  public async registerSender(
    chainId: AztecChainId,
    params: AztecWalletMethodMap['aztec_registerSender']['params'],
  ): Promise<void> {
    await this.chain(chainId).call('aztec_registerSender', params).execute();
  }
}
