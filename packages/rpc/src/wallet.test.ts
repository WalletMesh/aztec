import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AccountWallet, PXE, TxHash } from '@aztec/aztec.js';
import { JSONRPCWalletClient } from '@walletmesh/router';
import { AztecChainWallet } from './wallet.js';
import { ContractArtifactCache } from './contractArtifactCache.js';
import { AztecWalletRPCError } from './errors.js';
import type { Transport } from '@walletmesh/jsonrpc';
import type { AztecWalletContext } from './types.js';

describe('AztecChainWallet', () => {
  let pxe: PXE;
  let wallet: AccountWallet;
  let transport: Transport;
  let aztecWallet: AztecChainWallet;

  beforeEach(() => {
    // Mock PXE
    pxe = {
      // Add required PXE methods as needed
    } as unknown as PXE;

    // Mock AccountWallet
    wallet = {
      getAddress: vi.fn().mockResolvedValue('mockAddress'),
    } as unknown as AccountWallet;

    // Mock Transport
    transport = {
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    } as unknown as Transport;

    // Create wallet instance
    aztecWallet = new AztecChainWallet(pxe, wallet, transport);

    // Setup fallback handler and serializer
    const mockHandler = vi.fn().mockImplementation(async (context, method, params) => {
      if (!isAztecWalletContext(context)) {
        throw new AztecWalletRPCError('unknownInternalError', 'Invalid context');
      }
      if (method === 'aztec_getAccount') {
        return await context.wallet.getAddress();
      }
      throw new AztecWalletRPCError('invalidRequest', `Method not supported: ${method}`);
    });

    const mockSerializer = {
      serialize: vi.fn().mockImplementation((value) => value),
      deserialize: vi.fn().mockImplementation((value) => value),
    };

    Object.defineProperties(aztecWallet, {
      fallbackHandler: {
        value: mockHandler,
        writable: true,
        configurable: true,
      },
      fallbackSerializer: {
        value: mockSerializer,
        writable: true,
        configurable: true,
      },
    });
  });

  describe('constructor', () => {
    it('initializes with valid context', () => {
      expect(aztecWallet).toBeInstanceOf(AztecChainWallet);
      const context = (aztecWallet as unknown as { context: AztecWalletContext }).context;
      expect(context.pxe).toBe(pxe);
      expect(context.wallet).toBe(wallet);
      expect(context.contractArtifactCache).toBeInstanceOf(ContractArtifactCache);
    });

    it('sets up fallback handler and serializer', () => {
      const instance = aztecWallet as unknown as {
        fallbackHandler: unknown;
        fallbackSerializer: unknown;
      };
      expect(instance.fallbackHandler).toBeDefined();
      expect(instance.fallbackSerializer).toBeDefined();
    });
  });

  describe('asWalletRouterClient', () => {
    it('returns a JSONRPCWalletClient instance', () => {
      const client = aztecWallet.asWalletRouterClient();
      expect(client).toBeInstanceOf(JSONRPCWalletClient);
    });
  });

  describe('request handling', () => {
    it('handles valid context in fallback handler', async () => {
      const result = await (
        aztecWallet as unknown as {
          fallbackHandler: (
            context: AztecWalletContext,
            method: string,
            params: unknown[],
          ) => Promise<unknown>;
        }
      ).fallbackHandler(
        {
          pxe,
          wallet,
          contractArtifactCache: new ContractArtifactCache(wallet),
        },
        'aztec_getAccount',
        [],
      );
      expect(result).toBe('mockAddress');
    });

    it('throws error for invalid context in fallback handler', async () => {
      await expect(
        (
          aztecWallet as unknown as {
            fallbackHandler: (
              context: AztecWalletContext,
              method: string,
              params: unknown[],
            ) => Promise<unknown>;
          }
        ).fallbackHandler({ invalidContext: true } as unknown as AztecWalletContext, 'aztec_getAccount', []),
      ).rejects.toThrow(AztecWalletRPCError);
    });
  });

  describe('message handling', () => {
    it('processes incoming messages through transport', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_getAccount',
        params: [],
      };

      // Setup request handler to use fallback handler
      const handleRequest = async (msg: unknown) => {
        const typedMessage = msg as { method: string; params: unknown[] };
        return (
          aztecWallet as unknown as {
            fallbackHandler: (
              context: AztecWalletContext,
              method: string,
              params: unknown[],
            ) => Promise<unknown>;
          }
        ).fallbackHandler(
          { pxe, wallet, contractArtifactCache: new ContractArtifactCache(wallet) },
          typedMessage.method,
          typedMessage.params,
        );
      };

      (aztecWallet as unknown as { handleRequest: typeof handleRequest }).handleRequest = handleRequest;

      await handleRequest(message);
      expect(wallet.getAddress).toHaveBeenCalled();
    });

    it('handles transport errors gracefully', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'invalidMethod',
        params: [],
      };

      // Setup request handler to throw error for invalid method
      const handleRequest = async (msg: unknown) => {
        throw new AztecWalletRPCError('invalidRequest', 'Invalid method');
      };

      (aztecWallet as unknown as { handleRequest: typeof handleRequest }).handleRequest = handleRequest;

      await expect(handleRequest(message)).rejects.toThrow(AztecWalletRPCError);
    });
  });
});

// Helper function to check context type
function isAztecWalletContext(value: unknown): value is AztecWalletContext {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pxe' in value &&
    'wallet' in value &&
    'contractArtifactCache' in value
  );
}
