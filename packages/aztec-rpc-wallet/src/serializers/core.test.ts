import { describe, expect, it } from 'vitest';
import { Fr, AztecAddress, CompleteAddress, AuthWitness, TxHash } from '@aztec/aztec.js';
import {
  frSerializer,
  aztecAddressSerializer,
  completeAddressSerializer,
  authWitnessSerializer,
  txHashSerializer,
} from './core.js';

describe('Core Serializers', () => {
  describe('FrSerializer', () => {
    it('should serialize and deserialize Fr values', () => {
      const original = Fr.random();
      const serialized = frSerializer.serialize(original);
      const deserialized = frSerializer.deserialize(serialized);
      expect(deserialized.toString()).toBe(original.toString());
    });
  });

  describe('AztecAddressSerializer', () => {
    it('should serialize and deserialize AztecAddress values', () => {
      const original = AztecAddress.random();
      const serialized = aztecAddressSerializer.serialize(original);
      const deserialized = aztecAddressSerializer.deserialize(serialized);
      expect(deserialized.toString()).toBe(original.toString());
    });
  });

  describe('CompleteAddressSerializer', () => {
    it('should serialize and deserialize CompleteAddress values', () => {
      const original = CompleteAddress.random();
      const serialized = completeAddressSerializer.serialize(original);
      const deserialized = completeAddressSerializer.deserialize(serialized);
      expect(deserialized.toString()).toBe(original.toString());
    });
  });

  describe('AuthWitnessSerializer', () => {
    it('should serialize and deserialize AuthWitness values', () => {
      const original = AuthWitness.random();
      const serialized = authWitnessSerializer.serialize(original);
      const deserialized = authWitnessSerializer.deserialize(serialized);
      expect(deserialized.toString()).toBe(original.toString());
    });
  });

  describe('TxHashSerializer', () => {
    it('should serialize and deserialize TxHash values', () => {
      const original = TxHash.random();
      const serialized = txHashSerializer.serialize(original);
      const deserialized = txHashSerializer.deserialize(serialized);
      expect(deserialized.toString()).toBe(original.toString());
    });
  });
});
