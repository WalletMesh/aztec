import { describe, it, expect } from 'vitest';
import { deserializeContractArtifact, serializeContractArtifact } from './utils.js';
import { randomContractArtifact } from './test-utils.js';

describe('utils', () => {
  describe('contract artifact serialization', () => {
    it('should serialize and deserialize contract artifacts', () => {
      const artifact = randomContractArtifact();
      const serialized = serializeContractArtifact(artifact);
      const deserialized = deserializeContractArtifact(serialized);
      expect(deserialized).toEqual(artifact);
    });
  });
});
