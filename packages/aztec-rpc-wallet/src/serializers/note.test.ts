import { describe, expect, it } from 'vitest';
import { Fr, AztecAddress, ExtendedNote } from '@aztec/aztec.js';
import { type IncomingNotesFilter, NoteStatus, TxHash, UniqueNote } from '@aztec/circuit-types';
import {
  aztecGetIncomingNotesSerializer,
  aztecAddNoteSerializer,
  aztecAddNullifiedNoteSerializer,
} from './note.js';

describe('Note Serializers', () => {
  describe('aztec_getIncomingNotes', () => {
    const METHOD = 'aztec_getIncomingNotes';

    it('should serialize and deserialize params', () => {
      const filter: IncomingNotesFilter = {
        txHash: TxHash.random(),
        contractAddress: AztecAddress.random(),
        storageSlot: Fr.random(),
        owner: AztecAddress.random(),
        status: NoteStatus.ACTIVE,
        siloedNullifier: Fr.random(),
        scopes: [AztecAddress.random()],
      };
      const params = { filter };
      const serialized = aztecGetIncomingNotesSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetIncomingNotesSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.filter.txHash?.toString()).toBe(filter.txHash?.toString());
      expect(deserialized.filter.contractAddress?.toString()).toBe(filter.contractAddress?.toString());
      expect(deserialized.filter.storageSlot?.toString()).toBe(filter.storageSlot?.toString());
      expect(deserialized.filter.owner?.toString()).toBe(filter.owner?.toString());
      expect(deserialized.filter.status).toBe(filter.status);
      expect(deserialized.filter.siloedNullifier?.toString()).toBe(filter.siloedNullifier?.toString());
      expect(deserialized.filter.scopes?.map((a) => a.toString())).toEqual(
        filter.scopes?.map((a) => a.toString()),
      );
    });

    it('should serialize and deserialize result', () => {
      const result = [UniqueNote.random(), UniqueNote.random()];

      const serialized = aztecGetIncomingNotesSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetIncomingNotesSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.map((n) => n.toString())).toEqual(result.map((n) => n.toString()));
    });
  });

  describe('aztec_addNote', () => {
    const METHOD = 'aztec_addNote';

    it('should serialize and deserialize params', () => {
      const note = ExtendedNote.random();
      const params = { note };

      const serialized = aztecAddNoteSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNoteSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.note.toBuffer().toString('hex')).toBe(note.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', () => {
      const result = true;

      const serialized = aztecAddNoteSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNoteSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });

  describe('aztec_addNullifiedNote', () => {
    const METHOD = 'aztec_addNullifiedNote';

    it('should serialize and deserialize params', () => {
      const note = ExtendedNote.random();
      const params = { note };

      const serialized = aztecAddNullifiedNoteSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNullifiedNoteSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.note.toBuffer().toString('hex')).toBe(note.toBuffer().toString('hex'));
    });

    it('should serialize and deserialize result', () => {
      const result = true;

      const serialized = aztecAddNullifiedNoteSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecAddNullifiedNoteSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toBe(result);
    });
  });
});
