import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from './types.js';
import { encodeBase64, decodeBase64 } from './types.js';
import type { EventMetadataDefinition } from '@aztec/circuit-types';
import { ExtendedUnencryptedL2Log, TxHash, LogId } from '@aztec/circuit-types';
import { Point, AztecAddress } from '@aztec/aztec.js';
import { EventSelector, AbiTypeSchema } from '@aztec/foundation/abi';
import type { LogFilter } from '@aztec/aztec.js';

/**
 * Serializer for the aztec_getUnencryptedLogs RPC method.
 * Handles serialization of unencrypted log queries and results between JSON-RPC format and native Aztec types.
 * Supports filtering logs by transaction hash, block range, and contract address.
 */
export class AztecGetUnencryptedLogsSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getUnencryptedLogs']['params'],
      AztecWalletMethodMap['aztec_getUnencryptedLogs']['result']
    >
{
  params = {
    /**
     * Serializes log filter parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The filter parameters including txHash, block range, and contract address
     * @returns Serialized filter data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getUnencryptedLogs']['params'],
    ): JSONRPCSerializedData => {
      const { filter } = value;
      return {
        method,
        serialized: encodeBase64(
          JSON.stringify({
            txHash: filter.txHash?.toString(),
            fromBlock: filter.fromBlock,
            toBlock: filter.toBlock,
            afterLog: filter.afterLog?.toString(),
            contractAddress: filter.contractAddress?.toString(),
          }),
        ),
      };
    },
    /**
     * Deserializes log filter parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized filter data
     * @returns Deserialized filter parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getUnencryptedLogs']['params'] => {
      const parsed = JSON.parse(decodeBase64(data.serialized));
      const filter: LogFilter = {
        txHash: parsed.txHash ? TxHash.fromString(parsed.txHash) : undefined,
        fromBlock: parsed.fromBlock,
        toBlock: parsed.toBlock,
        afterLog: parsed.afterLog ? LogId.fromString(parsed.afterLog) : undefined,
        contractAddress: parsed.contractAddress ? AztecAddress.fromString(parsed.contractAddress) : undefined,
      };
      return { filter };
    },
  };

  result = {
    /**
     * Serializes unencrypted log results for RPC transport.
     * @param method - The RPC method name
     * @param value - The log results including logs array and maxLogsHit flag
     * @returns Serialized log data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getUnencryptedLogs']['result'],
    ): JSONRPCSerializedData => {
      const serializedLogs = value.logs.map((log) => log.toString());
      return {
        method,
        serialized: encodeBase64(JSON.stringify({ serializedLogs, maxLogsHit: value.maxLogsHit })),
      };
    },
    /**
     * Deserializes unencrypted log results from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized log data
     * @returns Deserialized log results
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getUnencryptedLogs']['result'] => {
      const { serializedLogs, maxLogsHit } = JSON.parse(decodeBase64(data.serialized));
      return {
        logs: serializedLogs.map((log: string) => ExtendedUnencryptedL2Log.fromString(log)),
        maxLogsHit,
      };
    },
  };
}

/**
 * Serializer for the aztec_getEncryptedEvents RPC method.
 * Handles serialization of encrypted event queries and results between JSON-RPC format and native Aztec types.
 * Supports querying events with viewing keys for decryption.
 */
export class AztecGetEncryptedEventsSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getEncryptedEvents']['params'],
      AztecWalletMethodMap['aztec_getEncryptedEvents']['result']
    >
{
  params = {
    /**
     * Serializes encrypted event query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The query parameters including event metadata, range, and viewing keys
     * @returns Serialized query data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getEncryptedEvents']['params'],
    ): JSONRPCSerializedData => {
      const { event, from, limit, vpks } = value;
      return {
        method,
        serialized: encodeBase64(
          JSON.stringify({
            event: {
              eventSelector: event.eventSelector.toString(),
              abiType: {
                kind: event.abiType.kind,
              },
              fieldNames: event.fieldNames,
            },
            from,
            limit,
            vpks: vpks?.map((p) => p.toString()),
          }),
        ),
      };
    },
    /**
     * Deserializes encrypted event query parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized query data
     * @returns Deserialized query parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getEncryptedEvents']['params'] => {
      const { event: serializedEvent, from, limit, vpks } = JSON.parse(decodeBase64(data.serialized));
      const event: EventMetadataDefinition = {
        eventSelector: EventSelector.fromString(serializedEvent.eventSelector),
        abiType: {
          kind: serializedEvent.abiType.kind,
        },
        fieldNames: serializedEvent.fieldNames,
      };
      return {
        event,
        from,
        limit,
        vpks: vpks?.map((p: string) => Point.fromString(p)),
      };
    },
  };

  /**
   * Handles serialization of encrypted event results.
   * Note: The result type is generic (T[]) based on the event's ABI type definition.
   * Currently handles results as unknown[] until proper ABI-based deserialization is implemented.
   */
  result = {
    serialize: (method: string, value: unknown[]): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(value)),
      };
    },
    deserialize: (method: string, data: JSONRPCSerializedData): unknown[] => {
      return JSON.parse(decodeBase64(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_getUnencryptedEvents RPC method.
 * Handles serialization of unencrypted event queries and results between JSON-RPC format and native Aztec types.
 * Supports querying events by event selector and pagination parameters.
 */
export class AztecGetUnencryptedEventsSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getUnencryptedEvents']['params'],
      AztecWalletMethodMap['aztec_getUnencryptedEvents']['result']
    >
{
  params = {
    /**
     * Serializes unencrypted event query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The query parameters including event metadata and range
     * @returns Serialized query data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getUnencryptedEvents']['params'],
    ): JSONRPCSerializedData => {
      const { event, from, limit } = value;
      return {
        method,
        serialized: encodeBase64(
          JSON.stringify({
            event: {
              eventSelector: event.eventSelector.toString(),
              abiType: {
                kind: event.abiType.kind,
              },
              fieldNames: event.fieldNames,
            },
            from,
            limit,
          }),
        ),
      };
    },
    /**
     * Deserializes unencrypted event query parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized query data
     * @returns Deserialized query parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getUnencryptedEvents']['params'] => {
      const { event: serializedEvent, from, limit } = JSON.parse(decodeBase64(data.serialized));
      const event: EventMetadataDefinition = {
        eventSelector: EventSelector.fromString(serializedEvent.eventSelector),
        abiType: {
          kind: serializedEvent.abiType.kind,
        },
        fieldNames: serializedEvent.fieldNames,
      };
      return {
        event,
        from,
        limit,
      };
    },
  };

  /**
   * Handles serialization of unencrypted event results.
   * Note: The result type is generic (T[]) based on the event's ABI type definition.
   * Currently handles results as unknown[] until proper ABI-based deserialization is implemented.
   */
  result = {
    serialize: (method: string, value: unknown[]): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(value)),
      };
    },
    deserialize: (method: string, data: JSONRPCSerializedData): unknown[] => {
      return JSON.parse(decodeBase64(data.serialized));
    },
  };
}

/**
 * Pre-instantiated serializer instances for each Aztec log/event-related RPC method.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecGetUnencryptedLogsSerializer = new AztecGetUnencryptedLogsSerializer();
export const aztecGetEncryptedEventsSerializer = new AztecGetEncryptedEventsSerializer();
export const aztecGetUnencryptedEventsSerializer = new AztecGetUnencryptedEventsSerializer();
