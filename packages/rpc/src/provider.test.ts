import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AztecProviderRPC } from './provider.js';
import { AztecWalletRPCError } from './errors.js';
import type { Transport } from '@walletmesh/jsonrpc';
import type { RouterMethodMap, RouterEventMap } from '@walletmesh/router';
import type { AztecChainId } from './router-types.js';
import { emitProviderEvent } from './test-utils.js';

describe('AztecProviderRPC', () => {
  let transport: Transport<RouterMethodMap, RouterEventMap>;
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

    it('should connect to multiple chains', async () => {
      const sessionId = 'test-session';
      provider.callMethod = vi.fn().mockResolvedValueOnce({ sessionId });

      const chains: AztecChainId[] = [testChain, devChain];
      await provider.connect(chains);

      expect(provider.callMethod).toHaveBeenCalledWith(
        'wm_connect',
        expect.objectContaining({
          permissions: {
            [testChain]: expect.any(Array),
            [devChain]: expect.any(Array),
          },
        }),
      );
    });

    it('should handle invalid connect response', async () => {
      provider.callMethod = vi.fn().mockResolvedValueOnce({ invalid: 'response' });

      await expect(provider.connect([])).rejects.toThrow(AztecWalletRPCError);
    });

    it('should disconnect from all chains', async () => {
      // First connect
      provider.callMethod = vi
        .fn()
        .mockResolvedValueOnce({ sessionId: 'test-session' })
        .mockResolvedValueOnce(null);

      await provider.connect([]);
      await provider.disconnect();

      expect(provider.callMethod).toHaveBeenLastCalledWith('wm_disconnect', { sessionId: 'test-session' });
      expect(provider.getSupportedChains()).toHaveLength(0);
    });

    it('should handle disconnect when not connected', async () => {
      // Create new provider without connecting
      const newProvider = new AztecProviderRPC(transport);
      await newProvider.disconnect();
      // Should not throw and should not call any methods
      expect(transport.send).not.toHaveBeenCalled();
    });
  });

  describe('Chain Management', () => {
    beforeEach(async () => {
      provider.callMethod = vi.fn().mockResolvedValueOnce({ sessionId: 'test-session' });
      await provider.connect([testChain]);
      expect(provider.getSupportedChains()).toHaveLength(0);
    });

    it('should handle chain connection events', async () => {
      // Simulate receiving a chain connection event through transport
      emitProviderEvent(provider, 'wm_walletStateChanged', {
        chainId: testChain,
        changes: { accounts: ['0x123'], networkId: 'testnet' },
      });
      // Verify chain was added
      const chains = provider.getSupportedChains();
      expect(chains).toContain(testChain);
    });

    it('should ignore events for unrequested chains', async () => {
      // Simulate receiving a chain connection event for an unrequested chain
      emitProviderEvent(provider, 'wm_walletStateChanged', {
        chainId: 'aztec:mainnet',
        changes: { accounts: ['0x123'], networkId: 'mainnet' },
      });
      // Verify chain was not added
      const chains = provider.getSupportedChains();
      expect(chains).not.toContain('aztec:mainnet');
    });

    it('should handle chain disconnection events', async () => {
      // First connect and verify initial state
      emitProviderEvent(provider, 'wm_walletStateChanged', {
        chainId: testChain,
        changes: { accounts: ['0x123'], networkId: 'testnet' },
      });
      expect(provider.getSupportedChains()).toContain(testChain);

      // Then disconnect and verify chain was removed
      emitProviderEvent(provider, 'wm_walletStateChanged', {
        chainId: testChain,
        changes: { networkId: 'testnet' },
      });
      expect(provider.getSupportedChains()).not.toContain(testChain);
    });

    it('should handle session expiration events', async () => {
      // First connect and verify initial state
      emitProviderEvent(provider, 'wm_walletStateChanged', {
        chainId: testChain,
        changes: { accounts: ['0x123'], networkId: 'testnet' },
      });
      expect(provider.getSupportedChains()).toContain(testChain);

      // Then expire session and verify all chains were cleared
      emitProviderEvent(provider, 'wm_sessionTerminated', {
        sessionId: 'test-session',
        reason: 'Session expired',
      });
      expect(provider.getSupportedChains()).toHaveLength(0);
    });

    it('should ignore session termination events for different sessions', async () => {
      // First connect and verify initial state
      emitProviderEvent(provider, 'wm_walletStateChanged', {
        chainId: testChain,
        changes: { accounts: ['0x123'], networkId: 'testnet' },
      });
      expect(provider.getSupportedChains()).toContain(testChain);

      // Then send termination event for different session
      emitProviderEvent(provider, 'wm_sessionTerminated', {
        sessionId: 'different-session',
        reason: 'Session expired',
      });
      // Verify chains are still connected
      expect(provider.getSupportedChains()).toContain(testChain);
    });
  });

  describe('Method Calls', () => {
    beforeEach(async () => {
      provider.callMethod = vi.fn().mockResolvedValueOnce({ sessionId: 'test-session' });
      await provider.connect([testChain]);
      emitProviderEvent(provider, 'wm_walletStateChanged', {
        chainId: testChain,
        changes: { accounts: ['0x123'], networkId: 'testnet' },
      });
    });

    it('should get account address', async () => {
      const address = '0x1234...';
      provider.callMethod = vi.fn().mockResolvedValueOnce(address);

      const result = await provider.getAccount(testChain);
      expect(result).toBe(address);
    });

    it('should handle invalid account response', async () => {
      provider.callMethod = vi.fn().mockResolvedValueOnce({ invalid: 'response' });

      await expect(provider.getAccount(testChain)).rejects.toThrow(AztecWalletRPCError);
    });

    it('should send transaction', async () => {
      const txHash = '0xabcd...';
      provider.callMethod = vi.fn().mockResolvedValueOnce(txHash);

      const result = await provider.sendTransaction(testChain, {
        to: '0x5678...',
        value: '1000',
      });
      expect(result).toBe(txHash);
    });

    it('should handle invalid transaction response', async () => {
      provider.callMethod = vi.fn().mockResolvedValueOnce({ invalid: 'response' });

      await expect(
        provider.sendTransaction(testChain, {
          to: '0x5678...',
          value: '1000',
        }),
      ).rejects.toThrow(AztecWalletRPCError);
    });

    it('should reject calls when not connected', async () => {
      // Create new provider without connecting
      const newProvider = new AztecProviderRPC(transport);
      await expect(newProvider.getAccount(testChain)).rejects.toThrow(AztecWalletRPCError);
    });

    it('should reject calls to unsupported chain', async () => {
      await expect(provider.getAccount('aztec:mainnet')).rejects.toThrow(AztecWalletRPCError);
    });

    it('should include session and chain in method calls', async () => {
      provider.callMethod = vi.fn().mockResolvedValueOnce('0x1234...');

      await provider.getAccount(testChain);

      expect(provider.callMethod).toHaveBeenCalledWith(
        'aztec_getAccount',
        expect.objectContaining({
          sessionId: 'test-session',
          chainId: testChain,
        }),
      );
    });

    it('should simulate transaction', async () => {
      const simulationResult = { success: true, gas: 1000 };
      provider.callMethod = vi.fn().mockResolvedValueOnce(simulationResult);

      const result = await provider.simulateTransaction(testChain, {
        to: '0x5678...',
        value: '1000',
      });
      expect(result).toEqual(simulationResult);
      expect(provider.callMethod).toHaveBeenCalledWith(
        'aztec_simulateTransaction',
        expect.objectContaining({
          sessionId: 'test-session',
          chainId: testChain,
          to: '0x5678...',
          value: '1000',
        }),
      );
    });

    it('should register contract', async () => {
      const contractParams = { address: '0x1234...', abi: [] };
      provider.callMethod = vi.fn().mockResolvedValueOnce(undefined);

      await provider.registerContract(testChain, contractParams);
      expect(provider.callMethod).toHaveBeenCalledWith(
        'aztec_registerContract',
        expect.objectContaining({
          sessionId: 'test-session',
          chainId: testChain,
          ...contractParams,
        }),
      );
    });

    it('should register contract class', async () => {
      const classParams = { name: 'TestContract', bytecode: '0x...' };
      provider.callMethod = vi.fn().mockResolvedValueOnce(undefined);

      await provider.registerContractClass(testChain, classParams);
      expect(provider.callMethod).toHaveBeenCalledWith(
        'aztec_registerContractClass',
        expect.objectContaining({
          sessionId: 'test-session',
          chainId: testChain,
          ...classParams,
        }),
      );
    });

    it('should register sender', async () => {
      const senderParams = { address: '0x5678...', type: 'EOA' };
      provider.callMethod = vi.fn().mockResolvedValueOnce(undefined);

      await provider.registerSender(testChain, senderParams);
      expect(provider.callMethod).toHaveBeenCalledWith(
        'aztec_registerSender',
        expect.objectContaining({
          sessionId: 'test-session',
          chainId: testChain,
          ...senderParams,
        }),
      );
    });
  });
});
