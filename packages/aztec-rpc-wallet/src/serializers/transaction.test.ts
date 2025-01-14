import { describe, expect, it } from 'vitest';
import { AztecAddress, TxHash, Tx } from '@aztec/aztec.js';

import { PrivateExecutionResult, TxProvingResult } from '@aztec/circuit-types';
import {
  aztecCreateTxExecutionRequestSerializer,
  aztecSendTxSerializer,
  aztecGetTxEffectSerializer,
  aztecGetTxReceiptSerializer,
  aztecSimulateTxSerializer,
  aztecProveTxSerializer,
} from './transaction.js';
import { TxExecutionRequest } from '@aztec/aztec.js';

import { comparePrivateExecutionResults, compareTxProvingResults } from './transaction-utils.js';

describe('Transaction Serializers', () => {
  describe('aztec_createTxExecutionRequest', () => {
    const METHOD = 'aztec_createTxExecutionRequest';

    it('should serialize and deserialize params', () => {
      // Create a request using random() and convert to plain object
      const request = TxExecutionRequest.random();
      const params = { exec: JSON.parse(JSON.stringify(request)) };

      const serialized = aztecCreateTxExecutionRequestSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecCreateTxExecutionRequestSerializer.params.deserialize(METHOD, serialized);
      expect(JSON.stringify(deserialized.exec)).toBe(JSON.stringify(params.exec));
    });

    it('should serialize and deserialize result', () => {
      const result = TxExecutionRequest.random();

      const serialized = aztecCreateTxExecutionRequestSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecCreateTxExecutionRequestSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.toString()).toBe(result.toString());
    });
  });

  describe('aztec_getTxEffect', () => {
    const METHOD = 'aztec_getTxEffect';

    it('should serialize and deserialize params', () => {
      const txHash = TxHash.random();
      const params = { txHash };

      const serialized = aztecGetTxEffectSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetTxEffectSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txHash.toString()).toBe(txHash.toString());
    });
  });

  describe('aztec_getTxReceipt', () => {
    const METHOD = 'aztec_getTxReceipt';

    it('should serialize and deserialize params', () => {
      const txHash = TxHash.random();
      const params = { txHash };

      const serialized = aztecGetTxReceiptSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetTxReceiptSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txHash.toString()).toBe(txHash.toString());
    });
  });

  describe('aztec_sendTx', () => {
    const METHOD = 'aztec_sendTx';

    it('should serialize and deserialize params', () => {
      const tx = Tx.random();
      const params = { tx };

      const serialized = aztecSendTxSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecSendTxSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.tx.toBuffer().toString('hex')).toBe(tx.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', () => {
      const result = TxHash.random();

      const serialized = aztecSendTxSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecSendTxSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.toString()).toBe(result.toString());
    });
  });

  describe('aztec_simulateTx', () => {
    const METHOD = 'aztec_simulateTx';

    it('should serialize and deserialize params', () => {
      const params = {
        txRequest: TxExecutionRequest.random(),
        simulatePublic: true,
        msgSender: AztecAddress.random(),
        skipTxValidation: false,
        enforceFeePayment: true,
        profile: false,
      };

      const serialized = aztecSimulateTxSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecSimulateTxSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txRequest.toString()).toBe((params.txRequest as TxExecutionRequest).toString());
      expect(deserialized.simulatePublic).toBe(params.simulatePublic);
      expect(deserialized.msgSender?.toString()).toBe(params.msgSender.toString());
      expect(deserialized.skipTxValidation).toBe(params.skipTxValidation);
      expect(deserialized.enforceFeePayment).toBe(params.enforceFeePayment);
      expect(deserialized.profile).toBe(params.profile);
    });
  });

  describe('aztec_proveTx', () => {
    const METHOD = 'aztec_proveTx';

    it('should serialize and deserialize params', () => {
      const txRequest = TxExecutionRequest.random();
      const privateExecutionResult = PrivateExecutionResult.random();
      const params = { txRequest, privateExecutionResult };

      const serialized = aztecProveTxSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecProveTxSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.txRequest.toString()).toBe(txRequest.toString());
      expect(
        comparePrivateExecutionResults(privateExecutionResult, deserialized.privateExecutionResult),
      ).toBe(true);
    });

    it('should serialize and deserialize result', () => {
      const result = TxProvingResult.random();

      const serialized = aztecProveTxSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecProveTxSerializer.result.deserialize(METHOD, serialized);
      expect(compareTxProvingResults(result, deserialized)).toBe(true);
    });
  });
});
