import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AztecProviderRPC } from './provider.js';
import { AztecWalletRPCError } from './errors.js';
import type { Transport } from '@walletmesh/jsonrpc';
import type { AztecChainId, AztecWalletMethodMap, TransactionParams } from './types.js';
import type { AztecAddress } from '@aztec/aztec.js';
import { mockAddress, mockContractInstance, mockContractArtifact } from './test-utils.js';

describe('AztecProviderRPC Error Handling', () => {
  let transport: Transport;
  let provider: AztecProviderRPC;
  const testChain: AztecChainId = 'aztec:testnet';

  beforeEach(() => {
    transport = {
      send: vi.fn().mockResolvedValue(undefined),
    };
    provider = new AztecProviderRPC(transport);
  });

  describe('Connection Errors', () => {
    it('should handle network errors', async () => {
      provider.callMethod = vi.fn().mockRejectedValue(new Error('Network error'));
      await expect(provider.connect([testChain])).rejects.toThrow('Network error');
    });

    it('should handle invalid chain IDs', async () => {
      provider.callMethod = vi.fn().mockResolvedValue({ sessionId: 'test' });
      await provider.connect([testChain]);

      await expect(
        provider
          .chain('invalid:chain' as AztecChainId)
          .call('aztec_getAccount')
          .execute(),
      ).rejects.toThrow(AztecWalletRPCError);
    });

    it('should handle session expiration', async () => {
      // First connect successfully
      provider.callMethod = vi.fn().mockResolvedValue({ sessionId: 'test' });
      await provider.connect([testChain]);

      // Then simulate session expiration
      Object.defineProperty(provider, 'sessionId', {
        get: vi.fn().mockReturnValue(undefined),
      });

      await expect(provider.chain(testChain).call('aztec_getAccount').execute()).rejects.toThrow(
        AztecWalletRPCError,
      );
    });
  });

  describe('Method Call Errors', () => {
    beforeEach(async () => {
      provider.callMethod = vi.fn().mockResolvedValue({ sessionId: 'test' });
      await provider.connect([testChain]);
    });

    it('should handle router errors', async () => {
      vi.spyOn(provider, 'callMethod').mockRejectedValue(new Error('Router error'));
      await expect(provider.chain(testChain).call('aztec_getAccount').execute()).rejects.toThrow(
        'Router error',
      );
    });

    it('should handle invalid method names', async () => {
      vi.spyOn(provider, 'executeCall').mockRejectedValue(
        new AztecWalletRPCError('invalidRequest', 'Method not supported'),
      );

      await expect(
        provider
          .chain(testChain)
          .call('invalid_method' as 'aztec_getAccount')
          .execute(),
      ).rejects.toThrow(AztecWalletRPCError);
    });

    it('should handle invalid parameter types', async () => {
      await expect(
        provider
          .chain(testChain)
          .call('aztec_sendTransaction', { invalid: 'params' } as unknown as TransactionParams)
          .execute(),
      ).rejects.toThrow(AztecWalletRPCError);
    });
  });

  describe('Contract Registration Errors', () => {
    beforeEach(async () => {
      provider.callMethod = vi.fn().mockResolvedValue({ sessionId: 'test' });
      await provider.connect([testChain]);
    });

    it('should handle invalid contract instance', async () => {
      const invalidInstance = {
        ...mockContractInstance('0x1234'),
        version: 'invalid' as unknown as 1,
      };

      await expect(
        provider.registerContract(testChain, {
          instance: invalidInstance,
          artifact: mockContractArtifact(),
        }),
      ).rejects.toThrow(AztecWalletRPCError);
    });

    it('should handle invalid contract artifact', async () => {
      const invalidArtifact = {
        ...mockContractArtifact(),
        name: 123 as unknown as string,
      };

      await expect(
        provider.registerContractClass(testChain, {
          artifact: invalidArtifact,
        }),
      ).rejects.toThrow(AztecWalletRPCError);
    });

    it('should handle invalid sender address', async () => {
      await expect(
        provider.registerSender(testChain, {
          sender: 'invalid' as unknown as AztecAddress,
        }),
      ).rejects.toThrow(AztecWalletRPCError);
    });
  });

  describe('Bulk Operation Errors', () => {
    beforeEach(async () => {
      provider.callMethod = vi.fn().mockResolvedValue({ sessionId: 'test' });
      await provider.connect([testChain]);
    });

    it('should handle partial failures', async () => {
      vi.spyOn(provider, 'callMethod').mockResolvedValue([
        '0x123', // Valid result
        new Error('Failed operation'), // Error result
      ]);

      await expect(
        provider.chain(testChain).call('aztec_getAccount').call('aztec_getAccount').execute(),
      ).rejects.toThrow(AztecWalletRPCError);
    });

    it('should handle empty operation chain', async () => {
      await expect(provider.chain(testChain).execute()).rejects.toThrow(AztecWalletRPCError);
    });

    it('should handle mixed operation types', async () => {
      vi.spyOn(provider, 'callMethod').mockResolvedValue([
        '0x123', // String result
        42, // Number result
      ]);

      await expect(
        provider
          .chain(testChain)
          .call('aztec_getAccount')
          .call('aztec_getAccount') // Expecting string but got number
          .execute(),
      ).rejects.toThrow(AztecWalletRPCError);
    });
  });
});
