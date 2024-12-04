import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { AztecProviderRPC, type AztecWalletRPCMethodMap, type TransactionParams } from './index.js';
import type { JSONRPCResponse, JSONRPCRequest } from '@walletmesh/jsonrpc';
import { FunctionType } from '@aztec/foundation/abi';
import type { FunctionAbi, ContractArtifact } from '@aztec/foundation/abi';
import { AztecAddress } from '@aztec/aztec.js';

describe('AztecProviderRPC', () => {
  let provider: AztecProviderRPC;
  let sendRequestFn: Mock;
  let lastRequest: JSONRPCRequest<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap>;

  beforeEach(() => {
    sendRequestFn = vi.fn().mockImplementation((request) => {
      lastRequest = request;
      // Immediately respond with the result
      const response: JSONRPCResponse<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap> = {
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
      provider.receiveResponse(response);
    });
    provider = new AztecProviderRPC(sendRequestFn);
  });

  describe('connect', () => {
    it('should send connect request', async () => {
      const result = await provider.connect();
      expect(result).toBe(true);
      expect(lastRequest.method).toBe('aztec_connect');
    });
  });

  describe('getAccount', () => {
    it('should retrieve account address', async () => {
      const result = await provider.getAccount();
      expect(typeof result).toBe('string');
      expect(lastRequest.method).toBe('aztec_getAccount');
    });
  });

  describe('sendTransaction', () => {
    it('should send a single transaction request', async () => {
      const mockFunctionAbi: FunctionAbi = {
        name: 'test',
        parameters: [],
        returnTypes: [{ kind: 'boolean' }],
      } as unknown as FunctionAbi;

      const transaction: TransactionParams = {
        contractAddress: AztecAddress.random().toString(),
        functionAbi: mockFunctionAbi,
        args: [],
      };

      const result = await provider.sendTransaction(transaction);

      expect(result).toBe('0x123');
      expect(lastRequest.method).toBe('aztec_sendTransaction');
      expect(lastRequest.params).toEqual(transaction);
    });

    it('should send multiple transactions in a single request', async () => {
      const mockFunctionAbi: FunctionAbi = {
        name: 'test',
        parameters: [],
        returnTypes: [{ kind: 'boolean' }],
      } as unknown as FunctionAbi;

      const transactions: TransactionParams[] = [
        {
          contractAddress: AztecAddress.random().toString(),
          functionAbi: mockFunctionAbi,
          args: [],
        },
        {
          contractAddress: AztecAddress.random().toString(),
          functionAbi: mockFunctionAbi,
          args: [],
        },
      ];

      const result = await provider.sendTransaction(transactions);

      expect(result).toBe('0x123');
      expect(lastRequest.method).toBe('aztec_sendTransaction');
      expect(lastRequest.params).toEqual(transactions);
    });
  });

  describe('simulateTransaction', () => {
    it('should simulate transaction', async () => {
      const mockFunctionAbi: FunctionAbi = {
        name: 'test',
        parameters: [],
        returnTypes: [{ kind: 'boolean' }],
      } as unknown as FunctionAbi;

      const result = await provider.simulateTransaction({
        contractAddress: AztecAddress.random().toString(),
        functionAbi: mockFunctionAbi,
        args: [],
      });

      expect(result).toEqual({ success: true });
      expect(lastRequest.method).toBe('aztec_simulateTransaction');
    });
  });

  describe('registerContact', () => {
    it('should register contact', async () => {
      const mockContact = AztecAddress.random().toString();
      const result = await provider.registerContact(mockContact);

      expect(result).toBe(true);
      expect(lastRequest.method).toBe('aztec_registerContact');
    });
  });

  describe('registerContract', () => {
    it('should register contract', async () => {
      const mockContractArtifact = {} as ContractArtifact;
      const mockAddress = AztecAddress.random().toString();
      const result = await provider.registerContract(mockContractArtifact, mockAddress);

      expect(result).toBe(true);
      expect(lastRequest.method).toBe('aztec_registerContract');
    });
  });
});
