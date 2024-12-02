import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AztecWalletRPC, type AztecWalletRPCMethodMap } from './index.js';

import type { SentTx, Wallet } from '@aztec/aztec.js';
import { AztecAddress, Contract, ContractFunctionInteraction } from '@aztec/aztec.js';
import { FunctionType } from '@aztec/foundation/abi';
import type { FunctionAbi, ContractArtifact } from '@aztec/foundation/abi';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

describe('AztecWalletRPC', () => {
  let mockWallet: Wallet;
  let sendResponseFn: (response: unknown) => Promise<void>;
  let walletRPC: AztecWalletRPC;

  beforeEach(() => {
    mockWallet = {
      getAddress: vi.fn(),
      registerContact: vi.fn(),
      registerContract: vi.fn(),
    } as unknown as Wallet;

    sendResponseFn = vi.fn().mockResolvedValue(undefined);
    walletRPC = new AztecWalletRPC(mockWallet, sendResponseFn);
  });

  describe('aztec_connect', () => {
    it('should handle connection request', async () => {
      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_connect'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_connect',
        params: null,
      };

      await walletRPC.receiveRequest(request);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: true,
      });
    });
  });

  describe('aztec_getAccount', () => {
    it('should return wallet address', async () => {
      const mockAddress = AztecAddress.random();
      vi.spyOn(mockWallet, 'getAddress').mockReturnValue(mockAddress);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_getAccount'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_getAccount',
        params: null,
      };

      await walletRPC.receiveRequest(request);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: mockAddress.toString(),
      });
    });
  });

  describe('aztec_sendTransaction', () => {
    it('should handle transaction sending', async () => {
      const mockTxHash = { to0xString: () => '0x123' };
      const mockSentTx = {
        getTxHash: vi.fn().mockResolvedValue(mockTxHash),
      } as unknown as SentTx;

      vi.spyOn(ContractFunctionInteraction.prototype, 'send').mockReturnValue(mockSentTx);

      const mockFunctionAbi: FunctionAbi = {
        name: 'test',
        parameters: [],
        returnTypes: [{ kind: 'boolean' }],
        functionType: FunctionType.PRIVATE,
        isInternal: false,
        isStatic: false,
        isInitializer: false,
      };

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_sendTransaction',
        params: {
          contractAddress: AztecAddress.random().toString(),
          functionAbi: mockFunctionAbi,
          args: [],
        },
      };

      await walletRPC.receiveRequest(request);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: '0x123',
      });
    });
  });

  describe('aztec_simulateTransaction', () => {
    it('should simulate transaction', async () => {
      const mockResult = true;
      vi.spyOn(ContractFunctionInteraction.prototype, 'simulate').mockResolvedValue(mockResult);

      const mockFunctionAbi: FunctionAbi = {
        name: 'test',
        parameters: [],
        returnTypes: [],
        functionType: FunctionType.PRIVATE,
        isInternal: false,
        isStatic: false,
        isInitializer: false,
      };

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: AztecAddress.random().toString(),
          functionAbi: mockFunctionAbi,
          args: [],
        },
      };

      await walletRPC.receiveRequest(request);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: mockResult,
      });
    });
  });

  describe('aztec_registerContact', () => {
    it('should register contact successfully', async () => {
      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContact'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContact',
        params: {
          contact: AztecAddress.random().toString(),
        },
      };

      await walletRPC.receiveRequest(request);
      expect(mockWallet.registerContact).toHaveBeenCalled();
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: true,
      });
    });

    it('should handle registration failure', async () => {
      const mockError = new Error('Registration failed');
      vi.spyOn(mockWallet, 'registerContact').mockRejectedValue(mockError);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContact'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContact',
        params: {
          contact: AztecAddress.random().toString(),
        },
      };

      await walletRPC.receiveRequest(request);
      expect(mockWallet.registerContact).toHaveBeenCalled();
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: false,
      });
    });
  });

  describe('aztec_registerContract', () => {
    it('should register contract successfully', async () => {
      const mockContractArtifact = {} as ContractArtifact;
      const mockContract = {} as Contract;

      vi.spyOn(Contract, 'at').mockResolvedValue(mockContract);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContract'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContract',
        params: {
          contractArtifact: mockContractArtifact,
          contractAddress: AztecAddress.random().toString(),
        },
      };

      await walletRPC.receiveRequest(request);
      expect(mockWallet.registerContract).toHaveBeenCalledWith(mockContract);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: true,
      });
    });

    it('should handle registration failure', async () => {
      const mockError = new Error('Registration failed');
      const mockContractArtifact = {} as ContractArtifact;
      const mockContract = {} as Contract;

      vi.spyOn(Contract, 'at').mockResolvedValue(mockContract);
      vi.spyOn(mockWallet, 'registerContract').mockRejectedValue(mockError);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContract'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContract',
        params: {
          contractArtifact: mockContractArtifact,
          contractAddress: AztecAddress.random().toString(),
        },
      };

      await walletRPC.receiveRequest(request);
      expect(mockWallet.registerContract).toHaveBeenCalledWith(mockContract);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: false,
      });
    });

    it('should handle contract instantiation failure', async () => {
      const mockError = new Error('Contract creation failed');
      const mockContractArtifact = {} as ContractArtifact;

      vi.spyOn(Contract, 'at').mockRejectedValue(mockError);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContract'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContract',
        params: {
          contractArtifact: mockContractArtifact,
          contractAddress: AztecAddress.random().toString(),
        },
      };

      await walletRPC.receiveRequest(request);
      expect(mockWallet.registerContract).not.toHaveBeenCalled();
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: false,
      });
    });
  });
});
