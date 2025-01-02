import type { AztecWalletMethodMap } from './types.js';
import type { AztecChainId } from './types.js';
import type { AztecProviderRPC } from './provider.js';
import { AztecWalletRPCError } from './errors.js';

/**
 * Type helper to extract return type from method map
 */
type MethodResult<M extends keyof AztecWalletMethodMap> = AztecWalletMethodMap[M]['result'];

/**
 * Type helper to extract params type from method map
 */
type MethodParams<M extends keyof AztecWalletMethodMap> = AztecWalletMethodMap[M]['params'];

/**
 * Type guard to check if a value matches expected method result type
 * @param method - The method name to check against
 * @param value - The value to validate
 * @returns True if value matches expected type
 */
function isValidMethodResult<M extends keyof AztecWalletMethodMap>(
  method: M,
  value: unknown,
): value is MethodResult<M> {
  // Add specific type checks based on method
  switch (method) {
    case 'aztec_getAccount':
    case 'aztec_getAddress':
      return typeof value === 'string';
    case 'aztec_sendTransaction':
      return typeof value === 'string';
    case 'aztec_getBlockNumber':
    case 'aztec_getChainId':
    case 'aztec_getVersion':
    case 'aztec_getProvenBlockNumber':
      return typeof value === 'number';
    case 'aztec_connect':
    case 'aztec_registerContract':
    case 'aztec_registerContractClass':
    case 'aztec_registerSender':
    case 'aztec_isContractClassPubliclyRegistered':
    case 'aztec_isContractPubliclyDeployed':
    case 'aztec_isContractInitialized':
    case 'aztec_addCapsule':
    case 'aztec_addNote':
    case 'aztec_addNullifiedNote':
    case 'aztec_removeSender':
      return typeof value === 'boolean';
    case 'aztec_getContracts':
    case 'aztec_getScopes':
    case 'aztec_getSenders':
    case 'aztec_getRegisteredAccounts':
      return Array.isArray(value);
    default:
      // For complex types, we trust the router's type checking
      return true;
  }
}

/**
 * Represents a single method call in an operation
 */
type OperationCall<M extends keyof AztecWalletMethodMap = keyof AztecWalletMethodMap> = {
  readonly method: M;
  readonly params?: MethodParams<M>;
};

/**
 * Helper type for tracking operation results
 */
type OperationResults<T extends readonly OperationCall[]> = {
  readonly [K in keyof T]: T[K] extends OperationCall<infer M> ? MethodResult<M> : never;
};

/**
 * Helper type for tuple concatenation with proper readonly constraints
 */
type Concat<T extends readonly unknown[], U extends readonly unknown[]> = readonly [...T, ...U];

/**
 * Helper type for operation execution result
 */
type ExecuteResult<T extends readonly OperationCall[]> = T extends readonly []
  ? never
  : T extends readonly [OperationCall<infer M>]
    ? MethodResult<M>
    : OperationResults<T>;

/**
 * Builder for chaining Aztec RPC method calls
 */
export class AztecOperationBuilder<T extends readonly OperationCall[] = readonly []> {
  constructor(
    private readonly chainId: AztecChainId,
    private readonly provider: AztecProviderRPC,
    private readonly calls: T = [] as unknown as T,
  ) {}

  /**
   * Add a method call to the operation chain
   * @param method - The method to call
   * @param params - Optional parameters for the method
   * @returns Updated builder instance
   */
  public call<M extends keyof AztecWalletMethodMap>(
    method: M,
    params?: MethodParams<M>,
  ): AztecOperationBuilder<Concat<T, readonly [OperationCall<M>]>> {
    const newCall: OperationCall<M> = { method, params };
    return new AztecOperationBuilder(this.chainId, this.provider, [...this.calls, newCall] as Concat<
      T,
      readonly [OperationCall<M>]
    >);
  }

  /**
   * Execute the operation chain
   * @returns Single result for one call, array of results for multiple calls
   * @throws {AztecWalletRPCError} If result validation fails
   */
  public async execute(): Promise<ExecuteResult<T>> {
    if (this.calls.length === 0) {
      throw new AztecWalletRPCError('invalidRequest', 'No operations to execute');
    }

    if (this.calls.length === 1) {
      const [call] = this.calls;
      const result = await this.provider.executeCall(this.chainId, call.method, call.params);

      if (!isValidMethodResult(call.method, result)) {
        throw new AztecWalletRPCError('invalidResponse', `Invalid result type for method ${call.method}`);
      }

      return result as ExecuteResult<T>;
    }

    const results = await this.provider.executeBulkCall(this.chainId, [...this.calls] as OperationCall[]);

    // Validate each result matches its expected type
    for (let i = 0; i < this.calls.length; i++) {
      const call = this.calls[i];
      if (!isValidMethodResult(call.method, results[i])) {
        throw new AztecWalletRPCError(
          'invalidResponse',
          `Invalid result type for method ${call.method} at index ${i}`,
        );
      }
    }

    return results as ExecuteResult<T>;
  }
}
