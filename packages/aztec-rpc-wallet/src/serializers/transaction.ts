import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from './types.js';
import { encodeBase64, decodeBase64 } from './types.js';
import { txHashSerializer } from './core.js';
import { TxEffect, TxSimulationResult, inBlockSchemaFor, type TxProvingResult } from '@aztec/circuit-types';
import { TxExecutionRequest, TxReceipt, Tx, AztecAddress } from '@aztec/aztec.js';

import { SerializablePrivateExecutionResult, SerializableTxProvingResult } from './transaction-utils.js';

/**
 * Serializer for the aztec_createTxExecutionRequest RPC method.
 * Handles serialization of transaction execution requests between JSON-RPC format and native Aztec types.
 */
export class AztecCreateTxExecutionRequestSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'],
      AztecWalletMethodMap['aztec_createTxExecutionRequest']['result']
    >
{
  params = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'],
    ): JSONRPCSerializedData => {
      const { exec } = value;
      return {
        method,
        serialized: encodeBase64(JSON.stringify(exec)),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'] => {
      const exec = JSON.parse(decodeBase64(data.serialized));
      return { exec };
    },
  };

  result = {
    serialize: (method: string, value: TxExecutionRequest): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(value.toString()),
      };
    },
    deserialize: (method: string, data: JSONRPCSerializedData): TxExecutionRequest => {
      return TxExecutionRequest.fromString(decodeBase64(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_proveTx RPC method.
 * Handles serialization of transaction proving requests and results between JSON-RPC format and native Aztec types.
 * Includes handling of private execution results and proving outcomes.
 */
export class AztecProveTxSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_proveTx']['params'],
      AztecWalletMethodMap['aztec_proveTx']['result']
    >
{
  params = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_proveTx']['params'],
    ): JSONRPCSerializedData => {
      const { txRequest, privateExecutionResult } = value;
      const serializablePrivateExecutionResult =
        SerializablePrivateExecutionResult.from(privateExecutionResult);
      return {
        method,
        serialized: encodeBase64(JSON.stringify([txRequest.toString(), serializablePrivateExecutionResult])),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_proveTx']['params'] => {
      const [txRequest, privateExecutionResult] = JSON.parse(decodeBase64(data.serialized));
      return {
        txRequest: TxExecutionRequest.fromString(txRequest),
        privateExecutionResult: SerializablePrivateExecutionResult.fromJSON(privateExecutionResult),
      };
    },
  };

  result = {
    serialize: (method: string, value: TxProvingResult): JSONRPCSerializedData => {
      const serializableTxProvingResult = SerializableTxProvingResult.from(value);
      return {
        method,
        serialized: encodeBase64(JSON.stringify(serializableTxProvingResult)),
      };
    },
    deserialize: (method: string, data: JSONRPCSerializedData): TxProvingResult => {
      return SerializableTxProvingResult.fromJSON(JSON.parse(decodeBase64(data.serialized)));
    },
  };
}

/**
 * Serializer for the aztec_sendTx RPC method.
 * Handles serialization of transaction sending requests and transaction hash results between JSON-RPC format and native Aztec types.
 */
export class AztecSendTxSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_sendTx']['params'],
      AztecWalletMethodMap['aztec_sendTx']['result']
    >
{
  params = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_sendTx']['params'],
    ): JSONRPCSerializedData => {
      const { tx } = value;
      return {
        method,
        serialized: encodeBase64(tx.toBuffer().toString('hex')),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_sendTx']['params'] => {
      const tx = Tx.fromBuffer(Buffer.from(decodeBase64(data.serialized), 'hex'));
      return { tx };
    },
  };

  result = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_sendTx']['result'],
    ): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(txHashSerializer.serialize(value)),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_sendTx']['result'] => {
      return txHashSerializer.deserialize(decodeBase64(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_getTxEffect RPC method.
 * Handles serialization of transaction effect queries and results between JSON-RPC format and native Aztec types.
 * Transaction effects represent the outcome and state changes caused by a transaction.
 */
export class AztecGetTxEffectSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getTxEffect']['params'],
      AztecWalletMethodMap['aztec_getTxEffect']['result']
    >
{
  params = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxEffect']['params'],
    ): JSONRPCSerializedData => {
      const { txHash } = value;
      return {
        method,
        serialized: encodeBase64(txHashSerializer.serialize(txHash)),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getTxEffect']['params'] => {
      const txHash = txHashSerializer.deserialize(decodeBase64(data.serialized));
      return { txHash };
    },
  };

  result = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxEffect']['result'],
    ): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(TxEffect.schema.parse(value))),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getTxEffect']['result'] => {
      return inBlockSchemaFor(TxEffect.schema).parse(JSON.parse(decodeBase64(data.serialized)));
    },
  };
}

/**
 * Serializer for the aztec_getTxReceipt RPC method.
 * Handles serialization of transaction receipt queries and results between JSON-RPC format and native Aztec types.
 * Transaction receipts contain detailed information about executed transactions.
 */
export class AztecGetTxReceiptSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getTxReceipt']['params'],
      AztecWalletMethodMap['aztec_getTxReceipt']['result']
    >
{
  params = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxReceipt']['params'],
    ): JSONRPCSerializedData => {
      const { txHash } = value;
      return {
        method,
        serialized: encodeBase64(txHashSerializer.serialize(txHash)),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getTxReceipt']['params'] => {
      const txHash = txHashSerializer.deserialize(decodeBase64(data.serialized));
      return { txHash };
    },
  };

  result = {
    serialize: (method: string, value: TxReceipt): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(TxReceipt.schema.parse(value))),
      };
    },
    deserialize: (method: string, data: JSONRPCSerializedData): TxReceipt => {
      return TxReceipt.schema.parse(JSON.parse(decodeBase64(data.serialized)));
    },
  };
}

/**
 * Serializer for the aztec_simulateTx RPC method.
 * Handles serialization of transaction simulation requests and results between JSON-RPC format and native Aztec types.
 * Supports simulation configuration including public simulation, custom sender, validation options, and profiling.
 */
export class AztecSimulateTxSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_simulateTx']['params'],
      AztecWalletMethodMap['aztec_simulateTx']['result']
    >
{
  params = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_simulateTx']['params'],
    ): JSONRPCSerializedData => {
      const { txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile } = value;
      return {
        method,
        serialized: encodeBase64(
          JSON.stringify([
            txRequest.toString(),
            simulatePublic,
            msgSender,
            skipTxValidation,
            enforceFeePayment,
            profile,
          ]),
        ),
      };
    },
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_simulateTx']['params'] => {
      const [txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile] = JSON.parse(
        decodeBase64(data.serialized),
      );
      return {
        txRequest: TxExecutionRequest.fromString(txRequest),
        simulatePublic,
        msgSender: msgSender ? AztecAddress.fromString(msgSender) : undefined,
        skipTxValidation,
        enforceFeePayment,
        profile,
      };
    },
  };

  result = {
    serialize: (method: string, value: TxSimulationResult): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(TxSimulationResult.schema.parse(value))),
      };
    },
    deserialize: (method: string, data: JSONRPCSerializedData): TxSimulationResult => {
      return TxSimulationResult.schema.parse(JSON.parse(decodeBase64(data.serialized)));
    },
  };
}

/**
 * Pre-instantiated serializer instances for each Aztec transaction-related RPC method.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecCreateTxExecutionRequestSerializer = new AztecCreateTxExecutionRequestSerializer();
export const aztecProveTxSerializer = new AztecProveTxSerializer();
export const aztecSendTxSerializer = new AztecSendTxSerializer();
export const aztecGetTxEffectSerializer = new AztecGetTxEffectSerializer();
export const aztecGetTxReceiptSerializer = new AztecGetTxReceiptSerializer();
export const aztecSimulateTxSerializer = new AztecSimulateTxSerializer();
