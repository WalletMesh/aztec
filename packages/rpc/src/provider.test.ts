import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { AztecProviderRPC, type AztecWalletRPCMethodMap } from './index.js';
import type { JSONRPCResponse, JSONRPCRequest } from '@walletmesh/jsonrpc';
import { AztecAddress } from '@aztec/aztec.js';
import { Buffer32 } from '@aztec/foundation/buffer';
import { randomDeployedContract } from './test-utils.js';

type AztecJSONRPCRequest = JSONRPCRequest<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap>;
type AztecJSONRPCResponse = JSONRPCResponse<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap>;

describe('AztecProviderRPC', () => {
  let provider: AztecProviderRPC;
  let sendRequestFn: Mock;

  beforeEach(() => {
    // Create a mock send function that simulates responses
    sendRequestFn = vi.fn().mockImplementation((request) => {
      // Simulate response based on request method
      const response: AztecJSONRPCResponse = {
        jsonrpc: '2.0',
        id: request.id,
        result:
          request.method === 'aztec_getAccount'
            ? AztecAddress.random().toString()
            : request.method === 'aztec_sendTransaction'
              ? '0x123'
              : request.method === 'aztec_simulateTransaction'
                ? { success: true }
                : true,
      };
      // Send response back to provider
      provider.receiveResponse(response);
    });

    provider = new AztecProviderRPC(sendRequestFn);
  });

  describe('connect', () => {
    it('should send connect request', async () => {
      const result = await provider.connect();
      expect(result).toBe(true);
      expect(sendRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'aztec_connect',
        }),
      );
    });
  });

  describe('registerContract', () => {
    it('should register contract with serialization', async () => {
      const { artifact, instance } = randomDeployedContract();

      const result = await provider.registerContract(instance.address.toString(), instance, artifact);

      expect(result).toBe(true);
      expect(sendRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'aztec_registerContract',
          params: expect.objectContaining({
            serialized: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('getAccount', () => {
    it('should get account address', async () => {
      const mockAddress = AztecAddress.random().toString();
      sendRequestFn.mockImplementationOnce((request) => {
        provider.receiveResponse({
          jsonrpc: '2.0',
          id: request.id,
          result: mockAddress,
        });
      });

      const result = await provider.getAccount();
      expect(result).toBe(mockAddress);
      expect(sendRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'aztec_getAccount',
        }),
      );
    });
  });

  describe('simulateTransaction', () => {
    it('should simulate transaction', async () => {
      const mockResult = { success: true };
      const params = {
        contractAddress: AztecAddress.random().toString(),
        functionName: 'test',
        args: [1, 2, 3],
      };

      sendRequestFn.mockImplementationOnce((request) => {
        provider.receiveResponse({
          jsonrpc: '2.0',
          id: request.id,
          result: mockResult,
        });
      });

      const result = await provider.simulateTransaction(params);
      expect(result).toEqual(mockResult);
      expect(sendRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'aztec_simulateTransaction',
          params,
        }),
      );
    });
  });

  describe('registerContact', () => {
    it('should register contact', async () => {
      const contact = AztecAddress.random().toString();

      sendRequestFn.mockImplementationOnce((request) => {
        provider.receiveResponse({
          jsonrpc: '2.0',
          id: request.id,
          result: true,
        });
      });

      const result = await provider.registerContact(contact);
      expect(result).toBe(true);
      expect(sendRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'aztec_registerContact',
          params: { contact },
        }),
      );
    });
  });

  describe('registerContractClass', () => {
    it('should register contract class with serialization', async () => {
      const { artifact } = randomDeployedContract();

      const result = await provider.registerContractClass(artifact);

      expect(result).toBe(true);
      expect(sendRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'aztec_registerContractClass',
          params: expect.objectContaining({
            serialized: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('sendTransaction', () => {
    it('should send transactions with proper serialization', async () => {
      const mockTxHash = Buffer32.random();
      sendRequestFn.mockImplementationOnce((request) => {
        provider.receiveResponse({
          jsonrpc: '2.0',
          id: request.id,
          result: mockTxHash,
        });
      });

      const params = {
        functionCalls: [
          {
            contractAddress: AztecAddress.random().toString(),
            functionName: 'test',
            args: [1, 2, 3],
          },
        ],
        authwit: ['mockAuthWit'],
      };

      const result = await provider.sendTransaction(params);
      expect(result).toBe(mockTxHash);
      expect(sendRequestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'aztec_sendTransaction',
          params,
        }),
      );
    });
  });
});
