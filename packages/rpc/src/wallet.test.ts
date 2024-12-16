import { describe, it, expect, beforeEach, vi } from 'vitest';

import { GasFees } from '@aztec/circuits.js';
import { Buffer32 } from '@aztec/foundation/buffer';
import {
  AuthWitness,
  AztecAddress,
  Contract,
  type PXE,
  type TxExecutionRequest,
  type Wallet,
} from '@aztec/aztec.js';

import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

import type { TxProvingResult, TxSimulationResult } from '@aztec/circuit-types';

import {
  AztecWalletRPC,
  AztecWalletRPCErrorMap,
  type AztecWalletContext,
  type AztecWalletRPCMethodMap,
  type TransactionParams,
} from './index.js';
import { randomDeployedContract } from './test-utils.js';
import { registerContractClassSerializer, registerContractSerializer } from './utils.js';

describe('AztecWalletRPC', () => {
  let mockWallet: Wallet;
  let sendResponseFn: (response: unknown) => Promise<void>;
  let walletRPC: AztecWalletRPC;
  let context: AztecWalletContext;

  beforeEach(() => {
    mockWallet = {
      getAddress: vi.fn(),
      registerContact: vi.fn(),
      registerContract: vi.fn(),
      registerContractClass: vi.fn(),
      createTxExecutionRequest: vi.fn(),
      simulateTx: vi.fn(),
      proveTx: vi.fn(),
      sendTx: vi.fn(),
      getCurrentBaseFees: vi.fn(),
      getContractInstance: vi.fn(),
      getContractArtifact: vi.fn(),
    } as unknown as Wallet;

    context = {
      pxe: {} as unknown as PXE,
    };

    sendResponseFn = vi.fn().mockResolvedValue(undefined);
    walletRPC = new AztecWalletRPC(mockWallet, sendResponseFn);
  });

  describe('aztec_connect', () => {
    it('should handle connection request', async () => {
      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_connect'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_connect',
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
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
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 1,
          result: mockAddress.toString(),
        });
    });
  });

  describe('aztec_sendTransaction', () => {
    it('should handle sending a single transaction', async () => {
      const mockTxHash = Buffer32.random();
      const { artifact, instance } = randomDeployedContract();
      const address = instance.address;

      vi.spyOn(mockWallet, 'getCurrentBaseFees').mockResolvedValue(GasFees.random());
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(artifact);

      const mockRequest = vi.fn().mockResolvedValue({});
      const mockContract = {
        methods: {
          increment: vi.fn().mockReturnValue({
            request: mockRequest,
          }),
        },
      };
      vi.spyOn(Contract, 'at').mockResolvedValue(mockContract as unknown as Contract);

      // Add mocks for simulateTx, proveTx, and sendTx
      const mockSimulatedTx = { privateExecutionResult: {} };
      vi.spyOn(mockWallet, 'createTxExecutionRequest').mockResolvedValue({} as unknown as TxExecutionRequest);
      vi.spyOn(mockWallet, 'simulateTx').mockResolvedValue(mockSimulatedTx as unknown as TxSimulationResult);
      vi.spyOn(mockWallet, 'proveTx').mockResolvedValue({
        toTx: vi.fn().mockReturnValue({}),
      } as unknown as TxProvingResult);
      vi.spyOn(mockWallet, 'sendTx').mockResolvedValue(mockTxHash);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_sendTransaction',
        params: {
          functionCalls: [
            {
              contractAddress: address.toString(),
              functionName: 'increment',
              args: [1],
            },
          ],
        },
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 1,
          result: mockTxHash.toString(),
        });
    });

    it('should handle sending multiple transactions', async () => {
      const mockTxHash = Buffer32.random();
      const { instance, artifact } = randomDeployedContract();

      vi.spyOn(mockWallet, 'getCurrentBaseFees').mockResolvedValue(GasFees.random());
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(artifact);

      const mockRequest = vi.fn().mockResolvedValue({});
      const mockContract = {
        methods: {
          increment: vi.fn().mockReturnValue({
            request: mockRequest,
          }),
        },
      };
      vi.spyOn(Contract, 'at').mockResolvedValue(mockContract as unknown as Contract);

      // Add mocks for simulateTx, proveTx, and sendTx
      const mockSimulatedTx = { privateExecutionResult: {} };
      vi.spyOn(mockWallet, 'createTxExecutionRequest').mockResolvedValue({} as unknown as TxExecutionRequest);
      vi.spyOn(mockWallet, 'simulateTx').mockResolvedValue(mockSimulatedTx as unknown as TxSimulationResult);
      vi.spyOn(mockWallet, 'proveTx').mockResolvedValue({
        toTx: vi.fn().mockReturnValue({}),
      } as unknown as TxProvingResult);
      vi.spyOn(mockWallet, 'sendTx').mockResolvedValue(mockTxHash);

      const transactions: TransactionParams = {
        functionCalls: [
          {
            contractAddress: AztecAddress.random().toString(),
            functionName: 'increment',
            args: [1],
          },
          {
            contractAddress: AztecAddress.random().toString(),
            functionName: 'increment',
            args: [2],
          },
        ],
      };

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 2,
        method: 'aztec_sendTransaction',
        params: transactions,
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 2,
          result: mockTxHash.toString(),
        });
    });

    it('should handle sending a transaction with an authwit', async () => {
      const mockTxHash = Buffer32.random();
      const { instance, artifact } = randomDeployedContract();

      // Mock wallet methods
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(artifact);
      vi.spyOn(mockWallet, 'getCurrentBaseFees').mockResolvedValue(GasFees.random());

      const mockRequest = vi.fn().mockResolvedValue({
        /* mock the function call request data */
      });
      const mockContract = {
        methods: {
          increment: vi.fn().mockReturnValue({
            send: vi.fn().mockResolvedValue({
              getTxHash: vi.fn().mockResolvedValue(mockTxHash),
            }),
            request: mockRequest,
          }),
        },
      };
      vi.spyOn(Contract, 'at').mockResolvedValue(mockContract as unknown as Contract);

      // Add mocks for simulateTx, proveTx, and sendTx
      const mockSimulatedTx = { privateExecutionResult: {} };
      vi.spyOn(mockWallet, 'createTxExecutionRequest').mockResolvedValue({} as unknown as TxExecutionRequest);
      vi.spyOn(mockWallet, 'simulateTx').mockResolvedValue(mockSimulatedTx as unknown as TxSimulationResult);
      vi.spyOn(mockWallet, 'proveTx').mockResolvedValue({
        toTx: vi.fn().mockReturnValue({}),
      } as unknown as TxProvingResult);
      vi.spyOn(mockWallet, 'sendTx').mockResolvedValue(mockTxHash);

      const authwit = AuthWitness.random();
      const contractAddress = AztecAddress.random().toString();

      const transaction: TransactionParams = {
        functionCalls: [
          {
            contractAddress,
            functionName: 'increment',
            args: [1],
          },
        ],
        authwits: [authwit.toString()],
      };

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 3,
        method: 'aztec_sendTransaction',
        params: transaction,
      };

      await walletRPC.receiveRequest(context, request);

      expect(mockWallet.createTxExecutionRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          authWitnesses: [AuthWitness.fromString(authwit.toString())],
        }),
      );

      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 3,
          result: mockTxHash.toString(),
        });
    });

    it('should handle multiple authwits', async () => {
      const mockTxHash = Buffer32.random();
      const { instance, artifact } = randomDeployedContract();

      // Mock wallet methods
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(artifact);
      vi.spyOn(mockWallet, 'getCurrentBaseFees').mockResolvedValue(GasFees.random());

      const mockRequest = vi.fn().mockResolvedValue({});
      const mockContract = {
        methods: {
          increment: vi.fn().mockReturnValue({
            request: mockRequest,
          }),
        },
      };
      vi.spyOn(Contract, 'at').mockResolvedValue(mockContract as unknown as Contract);

      // Add mocks for simulateTx, proveTx, and sendTx
      const mockSimulatedTx = { privateExecutionResult: {} };
      vi.spyOn(mockWallet, 'createTxExecutionRequest').mockResolvedValue({} as unknown as TxExecutionRequest);
      vi.spyOn(mockWallet, 'simulateTx').mockResolvedValue(mockSimulatedTx as unknown as TxSimulationResult);
      vi.spyOn(mockWallet, 'proveTx').mockResolvedValue({
        toTx: vi.fn().mockReturnValue({}),
      } as unknown as TxProvingResult);
      vi.spyOn(mockWallet, 'sendTx').mockResolvedValue(mockTxHash);

      const authwits = [AuthWitness.random(), AuthWitness.random()];
      const contractAddress = AztecAddress.random().toString();

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_sendTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_sendTransaction',
        params: {
          functionCalls: [
            {
              contractAddress,
              functionName: 'increment',
              args: [1],
            },
          ],
          authwits: authwits.map((a) => a.toString()),
        },
      };

      await walletRPC.receiveRequest(context, request);

      expect(mockWallet.createTxExecutionRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          // serialize & deserialize to match the output
          authWitnesses: expect.arrayContaining(authwits.map((a) => AuthWitness.fromString(a.toString()))),
        }),
      );
    });
  });

  describe('aztec_simulateTransaction', () => {
    it('should simulate transaction', async () => {
      const mockResult = { success: true };
      const { instance, artifact } = randomDeployedContract();

      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(artifact);

      vi.spyOn(Contract, 'at').mockResolvedValue({
        methods: {
          testFunction: vi.fn().mockReturnValue({
            simulate: vi.fn().mockResolvedValue(mockResult),
          }),
        },
      } as unknown as Contract);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: AztecAddress.random().toString(),
          functionName: 'testFunction',
          args: [],
        },
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
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

      await walletRPC.receiveRequest(context, request);
      expect(mockWallet.registerContact).toHaveBeenCalled();
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
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

      await walletRPC.receiveRequest(context, request);
      expect(mockWallet.registerContact).toHaveBeenCalled();
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 1,
          error: expect.objectContaining(AztecWalletRPCErrorMap.contactNotRegistered),
        });
    });
  });

  describe('aztec_registerContract', () => {
    it('should register contract successfully', async () => {
      const { artifact, instance } = randomDeployedContract();

      const serialized = registerContractSerializer.serialize({
        contractAddress: instance.address.toString(),
        contractInstance: instance,
        contractArtifact: artifact,
      });

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContract'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContract',
        params: serialized,
      };

      vi.spyOn(mockWallet, 'registerContract').mockResolvedValue(undefined);

      await walletRPC.receiveRequest(context, request);
      expect(mockWallet.registerContract).toHaveBeenCalledWith(
        expect.objectContaining({
          instance: expect.objectContaining({ address: instance.address }),
          artifact: expect.objectContaining({ name: artifact.name }),
        }),
      );
    });

    it('should handle registration failure', async () => {
      const mockError = new Error('Registration failed');

      const { artifact, instance } = randomDeployedContract();
      const contractAddress = instance.address.toString();

      const serialized = registerContractSerializer.serialize({
        contractAddress,
        contractInstance: instance,
        contractArtifact: artifact,
      });

      vi.spyOn(mockWallet, 'registerContract').mockRejectedValue(mockError);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContract'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContract',
        params: serialized,
      };

      await walletRPC.receiveRequest(context, request);
      expect(mockWallet.registerContract).toHaveBeenCalledWith(
        expect.objectContaining({
          instance: expect.objectContaining({ address: instance.address }),
          artifact: expect.objectContaining({ name: artifact.name }),
        }),
      );
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          error: expect.objectContaining(AztecWalletRPCErrorMap.contractInstanceNotRegistered),
          id: 1,
        });
    });
  });

  describe('aztec_registerContractClass', () => {
    it('should register contract class successfully', async () => {
      vi.spyOn(mockWallet, 'registerContractClass').mockResolvedValue(undefined);

      const { artifact } = randomDeployedContract();
      const serialized = registerContractClassSerializer.serialize({ contractArtifact: artifact });

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContractClass'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContractClass',
        params: serialized,
      };

      await walletRPC.receiveRequest(context, request);
      expect(mockWallet.registerContractClass).toHaveBeenCalledWith(
        expect.objectContaining({
          name: artifact.name,
        }),
      );
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 1,
          result: true,
        });
    });
  });

  describe('contract artifact handling', () => {
    it('should throw error when contract instance not registered', async () => {
      const address = AztecAddress.random();
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(undefined);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: address.toString(),
          functionName: 'test',
          args: [],
        },
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 1,
          error: expect.objectContaining({
            code: -32003,
            message: 'Contract instance not registered',
          }),
        });
    });

    it('should throw error when contract class not registered', async () => {
      const { instance } = randomDeployedContract();
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(undefined);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: instance.address.toString(),
          functionName: 'test',
          args: [],
        },
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        {
          jsonrpc: '2.0',
          id: 1,
          error: expect.objectContaining({
            code: -32004,
            message: 'Contract class not registered',
          }),
        });
    });

    it('should use cached contract artifact when available', async () => {
      const { instance, artifact } = randomDeployedContract();
      const address = instance.address;

      // First call should cache the artifact
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(artifact);

      // First request to cache the artifact
      const request1: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: address.toString(),
          functionName: 'test',
          args: [],
        },
      };

      // Mock the Contract.at and simulate implementation
      vi.spyOn(Contract, 'at').mockResolvedValue({
        methods: {
          test: vi.fn().mockReturnValue({
            simulate: vi.fn().mockResolvedValue({ success: true }),
          }),
        },
      } as unknown as Contract);

      await walletRPC.receiveRequest(context, request1);

      // Second request should use cached artifact
      const request2: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 2,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: address.toString(),
          functionName: 'test',
          args: [],
        },
      };

      await walletRPC.receiveRequest(context, request2);

      // getContractArtifact should only be called once since the second call uses the cache
      expect(mockWallet.getContractArtifact).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle unknown errors in registerContract', async () => {
      const { artifact, instance } = randomDeployedContract();
      vi.spyOn(mockWallet, 'registerContract').mockRejectedValue('unknown error');

      const serialized = registerContractSerializer.serialize({
        contractAddress: instance.address.toString(),
        contractInstance: instance,
        contractArtifact: artifact,
      });

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_registerContract'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_registerContract',
        params: serialized,
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        expect.objectContaining({
          error: expect.objectContaining(AztecWalletRPCErrorMap.contractInstanceNotRegistered),
        }),
      );
    });

    it('should handle contract cache miss and subsequent registration', async () => {
      const mockTxHash = Buffer32.random();
      const { artifact, instance } = randomDeployedContract();
      const address = instance.address;

      // First call returns undefined (cache miss), second call returns artifact
      vi.spyOn(mockWallet, 'getContractInstance')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(instance);

      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(artifact);
      vi.spyOn(mockWallet, 'getCurrentBaseFees').mockResolvedValue(GasFees.random());

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: address.toString(),
          functionName: 'test',
          args: [],
        },
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        expect.objectContaining({
          error: expect.objectContaining({
            code: -32003,
            message: 'Contract instance not registered',
          }),
        }),
      );
    });

    it('should handle missing contract artifact', async () => {
      const { instance } = randomDeployedContract();
      vi.spyOn(mockWallet, 'getContractInstance').mockResolvedValue(instance);
      vi.spyOn(mockWallet, 'getContractArtifact').mockResolvedValue(undefined);

      const request: JSONRPCRequest<AztecWalletRPCMethodMap, 'aztec_simulateTransaction'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_simulateTransaction',
        params: {
          contractAddress: instance.address.toString(),
          functionName: 'test',
          args: [],
        },
      };

      await walletRPC.receiveRequest(context, request);
      expect(sendResponseFn).toHaveBeenCalledWith(
        expect.objectContaining({ "pxe": expect.any(Object) }),
        request,
        expect.objectContaining({
          error: expect.objectContaining({
            code: -32004,
            message: 'Contract class not registered',
          }),
        }),
      );
    });
  });
});
