import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AztecWalletRPC, type AztecWalletRPCMethodMap, type TransactionParams } from './index.js';

import type { SentTx, Wallet } from '@aztec/aztec.js';
import { AuthWitness, AztecAddress, Contract, ContractFunctionInteraction } from '@aztec/aztec.js';
import { getFunctionArtifact } from '@aztec/foundation/abi';
import type { FunctionAbi, ContractArtifact } from '@aztec/foundation/abi';
import { Buffer32 } from '@aztec/foundation/buffer';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

import { CounterContractArtifact } from '@aztec/noir-contracts.js';

import type { TxExecutionRequest } from '@aztec/aztec.js';
import type { TxProvingResult, TxSimulationResult } from '@aztec/circuit-types';

describe('AztecWalletRPC', () => {
  let mockWallet: Wallet;
  let sendResponseFn: (response: unknown) => Promise<void>;
  let walletRPC: AztecWalletRPC;

  beforeEach(() => {
    mockWallet = {
      getAddress: vi.fn(),
      registerContact: vi.fn(),
      registerContract: vi.fn(),
      createTxExecutionRequest: vi.fn(),
      simulateTx: vi.fn(),
      proveTx: vi.fn(),
      sendTx: vi.fn(),
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
    it('should handle sending a single transaction', async () => {
      const mockTxHash = Buffer32.fromString(
        '0x030b9756e03b43fd2601e77cc08ed6e6079f30a3556f3b7f58c3bc12f33c2858',
      );
      // Mock wallet methods
      vi.spyOn(mockWallet, 'createTxExecutionRequest').mockResolvedValue({} as unknown as TxExecutionRequest);
      vi.spyOn(mockWallet, 'simulateTx').mockResolvedValue({} as unknown as TxSimulationResult);
      vi.spyOn(mockWallet, 'proveTx').mockResolvedValue({
        toTx: vi.fn(() => mockTxHash),
      } as unknown as TxProvingResult);
      vi.spyOn(mockWallet, 'sendTx').mockResolvedValue(mockTxHash);

      const functionAbi: FunctionAbi = getFunctionArtifact(CounterContractArtifact, 'increment');

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_sendTransaction',
        params: {
          contractAddress: AztecAddress.random().toString(),
          functionAbi: functionAbi,
          args: [AztecAddress.random().toString(), AztecAddress.random().toString()],
        },
      };

      await walletRPC.receiveRequest(request);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 1,
        result: mockTxHash.toString(),
      });
    });

    it('should handle sending multiple transactions', async () => {
      const mockTxHash = Buffer32.fromString(
        '0x1e35b4f60f9c170f5fc3a942e9c69939c489c7d65bf6e7f89361c080131e049c',
      );
      // Mock wallet methods
      vi.spyOn(mockWallet, 'createTxExecutionRequest').mockResolvedValue({} as unknown as TxExecutionRequest);
      vi.spyOn(mockWallet, 'simulateTx').mockResolvedValue({} as unknown as TxSimulationResult);
      vi.spyOn(mockWallet, 'proveTx').mockResolvedValue({
        toTx: vi.fn(() => mockTxHash),
      } as unknown as TxProvingResult);
      vi.spyOn(mockWallet, 'sendTx').mockResolvedValue(mockTxHash);

      const functionAbi: FunctionAbi = getFunctionArtifact(CounterContractArtifact, 'increment');

      const transactions: TransactionParams[] = [
        {
          contractAddress: AztecAddress.random().toString(),
          functionAbi: functionAbi,
          args: [AztecAddress.random().toString(), AztecAddress.random().toString()],
        },
        {
          contractAddress: AztecAddress.random().toString(),
          functionAbi: functionAbi,
          args: [AztecAddress.random().toString(), AztecAddress.random().toString()],
        },
      ];

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 2,
        method: 'aztec_sendTransaction',
        params: transactions,
      };

      await walletRPC.receiveRequest(request);
      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 2,
        result: mockTxHash.toString(),
      });
    });

    it('should handle sending a transaction with an authwit', async () => {
      const mockTxHash = Buffer32.fromString(
        '0x5f2ee9d9b5079e2e96515ae1d228f33ecf50d06ac4471728016034503fa048a2',
      );
      // Mock wallet methods
      vi.spyOn(mockWallet, 'createTxExecutionRequest').mockResolvedValue({} as TxExecutionRequest);
      vi.spyOn(mockWallet, 'simulateTx').mockResolvedValue({} as TxSimulationResult);
      vi.spyOn(mockWallet, 'proveTx').mockResolvedValue({
        toTx: vi.fn(() => mockTxHash),
      } as unknown as TxProvingResult);
      vi.spyOn(mockWallet, 'sendTx').mockResolvedValue(mockTxHash);

      const functionAbi: FunctionAbi = getFunctionArtifact(CounterContractArtifact, 'increment');
      const authwit = AuthWitness.random();

      vi.spyOn(AuthWitness, 'fromString').mockReturnValueOnce(authwit);

      const transaction: TransactionParams = {
        contractAddress: AztecAddress.random().toString(),
        functionAbi: functionAbi,
        args: [AztecAddress.random().toString(), AztecAddress.random().toString()],
        authwit: authwit.toString(),
      };

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 3,
        method: 'aztec_sendTransaction',
        params: transaction,
      };

      await walletRPC.receiveRequest(request);

      expect(mockWallet.createTxExecutionRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          authWitnesses: [authwit],
        }),
      );

      expect(sendResponseFn).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        id: 3,
        result: mockTxHash.toString(),
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
      } as unknown as FunctionAbi;

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
