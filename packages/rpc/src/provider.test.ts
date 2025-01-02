import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AztecProviderRPC } from './provider.js';
import { AztecWalletRPCError } from './errors.js';
import type { Transport } from '@walletmesh/jsonrpc';
import type { RouterMethodMap, RouterEventMap } from '@walletmesh/router';
import type { AztecChainId } from './types.js';
import { mockAddress, mockContractInstance, mockContractArtifact } from './test-utils.js';

describe('AztecProviderRPC', () => {
  let transport: Transport;
  let provider: AztecProviderRPC;
  const testChain: AztecChainId = 'aztec:testnet';
  const devChain: AztecChainId = 'aztec:devnet';

  beforeEach(() => {
    transport = {
      send: vi.fn().mockResolvedValue(undefined),
    };
    provider = new AztecProviderRPC(transport);
  });

  describe('Connection Management', () => {
    it('should connect to chain', async () => {
      const sessionId = 'test-session';

      provider.callMethod = vi.fn().mockResolvedValueOnce({ sessionId });
      const response = await provider.connect(['aztec:testnet']);
      expect(response).toBe('test-session');

      expect(provider.callMethod).toHaveBeenCalledWith(
        'wm_connect',
        expect.objectContaining({
          permissions: {
            'aztec:testnet': expect.arrayContaining(['aztec_getAccount', 'aztec_sendTransaction']),
          },
        }),
      );
    });

    it('should handle invalid connect response', async () => {
      provider.callMethod = vi.fn().mockResolvedValueOnce({ invalid: 'response' });
      await expect(provider.connect([])).rejects.toThrow(AztecWalletRPCError);
    });

    it('should disconnect from all chains', async () => {
      provider.callMethod = vi
        .fn()
        .mockResolvedValueOnce({ sessionId: 'test-session' })
        .mockResolvedValueOnce(null);

      await provider.connect([]);
      await provider.disconnect();

      expect(provider.callMethod).toHaveBeenLastCalledWith('wm_disconnect', { sessionId: 'test-session' });
      expect(provider.getSupportedChains()).toHaveLength(0);
    });
  });

  describe('Method Calls', () => {
    beforeEach(async () => {
      // Setup session and chain
      Object.defineProperty(provider, 'sessionId', {
        get: vi.fn().mockReturnValue('test-session'),
      });
      Object.defineProperty(provider, 'requestedChains', {
        value: new Set([testChain]),
      });
    });

    it('should execute single method call', async () => {
      const mockResult = '0x123';
      vi.spyOn(provider, 'executeCall').mockResolvedValue(mockResult);

      const result = await provider.getAccount(testChain);
      expect(result).toBe(mockResult);
      expect(provider.executeCall).toHaveBeenCalledWith(testChain, 'aztec_getAccount', undefined);
    });

    it('should execute method call with params', async () => {
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

      const result = await provider.sendTransaction(testChain, mockParams);
      expect(result).toBe(mockResult);
      expect(provider.executeCall).toHaveBeenCalledWith(testChain, 'aztec_sendTransaction', mockParams);
    });

    it('should execute bulk method calls', async () => {
      const mockResults = ['0x123', ['0x456', '0x789'], 42];
      vi.spyOn(provider, 'executeBulkCall').mockResolvedValue(mockResults);

      const results = await provider
        .chain(testChain)
        .call('aztec_getAccount')
        .call('aztec_getSenders')
        .call('aztec_getBlockNumber')
        .execute();

      expect(results).toEqual(mockResults);
      expect(provider.executeBulkCall).toHaveBeenCalledWith(testChain, [
        { method: 'aztec_getAccount' },
        { method: 'aztec_getSenders' },
        { method: 'aztec_getBlockNumber' },
      ]);
    });

    it('should route method calls through wm_call', async () => {
      const mockResult = '0x123';
      vi.spyOn(provider, 'callMethod').mockResolvedValue(mockResult);

      await provider.executeCall(testChain, 'aztec_getAccount');

      expect(provider.callMethod).toHaveBeenCalledWith(
        'wm_call',
        expect.objectContaining({
          chainId: testChain,
          sessionId: 'test-session',
          call: {
            method: 'aztec_getAccount',
            params: undefined,
          },
        }),
      );
    });

    it('should route bulk calls through wm_bulkCall', async () => {
      const mockResults = ['0x123', '0x456'];
      vi.spyOn(provider, 'callMethod').mockResolvedValue(mockResults);

      await provider.executeBulkCall(testChain, [
        { method: 'aztec_getAccount' },
        { method: 'aztec_getBlockNumber' },
      ]);

      expect(provider.callMethod).toHaveBeenCalledWith(
        'wm_bulkCall',
        expect.objectContaining({
          chainId: testChain,
          sessionId: 'test-session',
          calls: [{ method: 'aztec_getAccount' }, { method: 'aztec_getBlockNumber' }],
        }),
      );
    });

    it('should validate method results', async () => {
      vi.spyOn(provider, 'executeCall').mockResolvedValue(123); // Number instead of string

      await expect(provider.chain(testChain).call('aztec_getAccount').execute()).rejects.toThrow(
        AztecWalletRPCError,
      );
    });

    it('should validate bulk results', async () => {
      vi.spyOn(provider, 'executeBulkCall').mockResolvedValue(['0x123', 456]); // Second result should be string

      await expect(
        provider.chain(testChain).call('aztec_getAccount').call('aztec_getAccount').execute(),
      ).rejects.toThrow(AztecWalletRPCError);
    });

    it('should handle registration methods', async () => {
      vi.spyOn(provider, 'executeCall').mockResolvedValue(true);

      const mockInstance = mockContractInstance('0x1234567890123456789012345678901234567890');
      const mockArtifact = mockContractArtifact();

      // Register contract
      await provider.registerContract(testChain, {
        instance: mockInstance,
        artifact: mockArtifact,
      });
      expect(provider.executeCall).toHaveBeenCalledWith(
        testChain,
        'aztec_registerContract',
        expect.objectContaining({
          instance: mockInstance,
          artifact: mockArtifact,
        }),
      );

      // Register contract class
      await provider.registerContractClass(testChain, {
        artifact: mockArtifact,
      });
      expect(provider.executeCall).toHaveBeenCalledWith(
        testChain,
        'aztec_registerContractClass',
        expect.objectContaining({
          artifact: mockArtifact,
        }),
      );

      // Register sender
      const senderAddress = mockAddress('0x1234567890123456789012345678901234567890');
      await provider.registerSender(testChain, {
        sender: senderAddress,
      });
      expect(provider.executeCall).toHaveBeenCalledWith(
        testChain,
        'aztec_registerSender',
        expect.objectContaining({
          sender: senderAddress,
        }),
      );
    });
  });
});
