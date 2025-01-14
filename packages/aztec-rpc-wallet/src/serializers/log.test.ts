import { describe, expect, it } from 'vitest';
import { Point, AztecAddress } from '@aztec/aztec.js';
import { EventSelector } from '@aztec/foundation/abi';
import type { AbiType } from '@aztec/foundation/abi';
import {
  ExtendedUnencryptedL2Log,
  type GetUnencryptedLogsResponse,
  type LogFilter,
  LogId,
  TxHash,
} from '@aztec/circuit-types';
import {
  aztecGetUnencryptedLogsSerializer,
  aztecGetEncryptedEventsSerializer,
  aztecGetUnencryptedEventsSerializer,
} from './log.js';

describe('Log Serializers', () => {
  describe('aztec_getUnencryptedLogs', () => {
    const METHOD = 'aztec_getUnencryptedLogs';

    it('should serialize and deserialize params', () => {
      const filter: LogFilter = {
        txHash: TxHash.random(),
        fromBlock: 0,
        toBlock: 100,
        afterLog: LogId.random(),
        contractAddress: AztecAddress.random(),
      };

      const params = { filter };

      const serialized = aztecGetUnencryptedLogsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetUnencryptedLogsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.filter.contractAddress?.toString()).toBe(filter.contractAddress?.toString());
      expect(deserialized.filter.txHash?.toString()).toBe(filter.txHash?.toString());
      expect(deserialized.filter.fromBlock).toBe(filter.fromBlock);
      expect(deserialized.filter.toBlock).toBe(filter.toBlock);
      expect(deserialized.filter.afterLog?.toString()).toBe(filter.afterLog?.toString());
    });

    it('should serialize and deserialize result', () => {
      const result: GetUnencryptedLogsResponse = {
        logs: [ExtendedUnencryptedL2Log.random()],
        maxLogsHit: false,
      };

      const serialized = aztecGetUnencryptedLogsSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetUnencryptedLogsSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.logs[0].toString()).toBe(result.logs[0].toString());
      expect(deserialized.logs.length).toBe(result.logs.length);
      expect(deserialized.maxLogsHit).toBe(result.maxLogsHit);
    });
  });

  describe('aztec_getEncryptedEvents', () => {
    const METHOD = 'aztec_getEncryptedEvents';

    it('should serialize and deserialize params', () => {
      const event = {
        eventSelector: EventSelector.fromString('0x12345678'),
        abiType: {
          kind: 'field',
        } as AbiType,
        fieldNames: ['field1', 'field2'],
      };
      const params = {
        event,
        from: 0,
        limit: 10,
        vpks: [Point.random(), Point.random()],
      };

      const serialized = aztecGetEncryptedEventsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetEncryptedEventsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.event.eventSelector.toString()).toBe(event.eventSelector.toString());
      expect(deserialized.event.abiType).toEqual(event.abiType);
      expect(deserialized.event.fieldNames).toEqual(event.fieldNames);
      expect(deserialized.from).toBe(params.from);
      expect(deserialized.limit).toBe(params.limit);
      expect(deserialized.vpks?.map((p) => p.toString())).toEqual(params.vpks.map((p) => p.toString()));
    });
  });

  describe('aztec_getUnencryptedEvents', () => {
    const METHOD = 'aztec_getUnencryptedEvents';

    it('should serialize and deserialize params', () => {
      const event = {
        eventSelector: EventSelector.fromString('0x12345678'),
        abiType: {
          kind: 'field',
        } as AbiType,
        fieldNames: ['field1', 'field2'],
      };
      const params = {
        event,
        from: 0,
        limit: 10,
      };

      const serialized = aztecGetUnencryptedEventsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetUnencryptedEventsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.event.eventSelector.toString()).toBe(event.eventSelector.toString());
      expect(deserialized.event.abiType).toEqual(event.abiType);
      expect(deserialized.event.fieldNames).toEqual(event.fieldNames);
      expect(deserialized.from).toBe(params.from);
      expect(deserialized.limit).toBe(params.limit);
    });
  });
});
