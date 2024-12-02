import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { AztecProviderRPC, type AztecWalletRPCMethodMap } from './index.js';
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
    it('should send transaction request', async () => {
      const mockFunctionAbi: FunctionAbi = {
        name: 'test',
        parameters: [],
        returnTypes: [{ kind: 'boolean' }],
        functionType: FunctionType.PRIVATE,
        isInternal: false,
        isStatic: false,
        isInitializer: false,
      };

      const result = await provider.sendTransaction(AztecAddress.random().toString(), mockFunctionAbi, []);

      expect(result).toBe('0x123');
      expect(lastRequest.method).toBe('aztec_sendTransaction');
    });
  });

  describe('simulateTransaction', () => {
    it('should simulate transaction', async () => {
      const mockFunctionAbi: FunctionAbi = {
        name: 'test',
        parameters: [],
        returnTypes: [{ kind: 'boolean' }],
      } as unknown as FunctionAbi;

      const result = await provider.simulateTransaction(
        AztecAddress.random().toString(),
        mockFunctionAbi,
        [],
      );

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
