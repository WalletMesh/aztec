import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AztecOperationBuilder } from './operation.js';
import { AztecProvider } from './provider.js';
import { AztecWalletError } from './errors.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { AztecChainId } from './types.js';

describe('AztecOperationBuilder', () => {
  let provider: AztecProvider;
  let transport: JSONRPCTransport;
  const chainId = 'aztec:testnet' as AztecChainId;

  beforeEach(() => {
    transport = {
      send: vi.fn().mockResolvedValue(undefined),
    };
    provider = new AztecProvider(transport);

    // Mock private properties in a type-safe way
    Object.defineProperty(provider, 'sessionId', {
      get: vi.fn().mockReturnValue('test-session'),
    });
    Object.defineProperty(provider, 'requestedChains', {
      value: new Set([chainId]),
    });
  });

  describe('single operations', () => {
    it('should execute a single method call', async () => {
      const mockResult = '0x123';
      vi.spyOn(provider, 'executeCall').mockResolvedValue(mockResult);

      const result = await new AztecOperationBuilder(chainId, provider).call('aztec_getAccount').execute();

      expect(result).toBe(mockResult);
      expect(provider.executeCall).toHaveBeenCalledWith(chainId, 'aztec_getAccount', undefined);
    });

    it('should execute a single method call with params', async () => {
      const mockResult = '0xtx';
      const mockParams = {
        functionCalls: [
          {
            contractAddress: '0x123',
            functionName: 'transfer',
            args: ['0x456', 100],
          },
        ],
      };
      vi.spyOn(provider, 'executeCall').mockResolvedValue(mockResult);

      const result = await new AztecOperationBuilder(chainId, provider)
        .call('aztec_sendTransaction', mockParams)
        .execute();

      expect(result).toBe(mockResult);
      expect(provider.executeCall).toHaveBeenCalledWith(chainId, 'aztec_sendTransaction', mockParams);
    });

    it('should throw on invalid result type', async () => {
      vi.spyOn(provider, 'executeCall').mockResolvedValue(123); // Number instead of string

      await expect(
        new AztecOperationBuilder(chainId, provider).call('aztec_getAccount').execute(),
      ).rejects.toThrow(AztecWalletError);
    });
  });

  describe('bulk operations', () => {
    it('should execute multiple method calls', async () => {
      const mockResults = ['0x123', ['0x456', '0x789'], 42];
      vi.spyOn(provider, 'executeBulkCall').mockResolvedValue(mockResults);

      const results = await new AztecOperationBuilder(chainId, provider)
        .call('aztec_getAccount')
        .call('aztec_getSenders')
        .call('aztec_getBlockNumber')
        .execute();

      expect(results).toEqual(mockResults);
      expect(provider.executeBulkCall).toHaveBeenCalledWith(chainId, [
        { method: 'aztec_getAccount' },
        { method: 'aztec_getSenders' },
        { method: 'aztec_getBlockNumber' },
      ]);
    });

    it('should execute multiple method calls with params', async () => {
      const mockResults = ['0xtx1', '0xtx2'];
      const mockParams1 = {
        functionCalls: [
          {
            contractAddress: '0x123',
            functionName: 'transfer',
            args: ['0x456', 100],
          },
        ],
      };
      const mockParams2 = {
        functionCalls: [
          {
            contractAddress: '0x789',
            functionName: 'mint',
            args: ['0xabc', 200],
          },
        ],
      };
      vi.spyOn(provider, 'executeBulkCall').mockResolvedValue(mockResults);

      const results = await new AztecOperationBuilder(chainId, provider)
        .call('aztec_sendTransaction', mockParams1)
        .call('aztec_sendTransaction', mockParams2)
        .execute();

      expect(results).toEqual(mockResults);
      expect(provider.executeBulkCall).toHaveBeenCalledWith(chainId, [
        { method: 'aztec_sendTransaction', params: mockParams1 },
        { method: 'aztec_sendTransaction', params: mockParams2 },
      ]);
    });

    it('should throw on invalid result type in bulk call', async () => {
      vi.spyOn(provider, 'executeBulkCall').mockResolvedValue(['0x123', 456]); // Number instead of string

      await expect(
        new AztecOperationBuilder(chainId, provider)
          .call('aztec_getAccount')
          .call('aztec_getAccount')
          .execute(),
      ).rejects.toThrow(AztecWalletError);
    });
  });

  describe('error handling', () => {
    it('should throw on empty operation chain', async () => {
      await expect(new AztecOperationBuilder(chainId, provider).execute()).rejects.toThrow(AztecWalletError);
    });

    it('should preserve immutability between calls', () => {
      const builder = new AztecOperationBuilder(chainId, provider);
      const builderWithOneCall = builder.call('aztec_getAccount');
      const builderWithTwoCalls = builderWithOneCall.call('aztec_getBlockNumber');

      // Each builder should have its own independent calls array
      expect(Object.getOwnPropertyDescriptor(builder, 'calls')?.value).toHaveLength(0);
      expect(Object.getOwnPropertyDescriptor(builderWithOneCall, 'calls')?.value).toHaveLength(1);
      expect(Object.getOwnPropertyDescriptor(builderWithTwoCalls, 'calls')?.value).toHaveLength(2);
    });
  });
});
