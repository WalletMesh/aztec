import type { AztecAddress, Fr, ContractArtifact, ContractInstanceWithAddress } from '@aztec/aztec.js';

/**
 * Creates a mock Fr field element for testing
 * Note: This is a simplified mock for testing only
 */
export function mockFr(value: bigint): Fr {
  return value as unknown as Fr;
}

/**
 * Creates a mock AztecAddress for testing
 * Note: This is a simplified mock for testing only
 */
export function mockAddress(value: string): AztecAddress {
  return value as unknown as AztecAddress;
}

/**
 * Creates a mock contract instance for testing
 * Note: This is a simplified mock for testing only
 */
export function mockContractInstance(address: string): ContractInstanceWithAddress {
  const instance = {
    address: mockAddress(address),
    contractClassId: mockFr(BigInt(1)),
    salt: mockFr(BigInt(2)),
    version: 1,
    deployer: mockAddress('0x1234567890123456789012345678901234567890'),
    initializationHash: mockFr(BigInt(3)),
    publicKeys: mockPublicKeys(),
  };
  return instance as unknown as ContractInstanceWithAddress;
}

/**
 * Creates mock public keys for testing
 * Note: This is a simplified mock for testing only
 */
function mockPublicKeys() {
  return {
    masterNullifierPublicKey: mockFr(BigInt(1)),
    masterIncomingViewingPublicKey: mockFr(BigInt(2)),
    masterOutgoingViewingPublicKey: mockFr(BigInt(3)),
    masterTaggingPublicKey: mockFr(BigInt(4)),
  };
}

/**
 * Creates a mock contract artifact for testing
 * Note: This is a simplified mock for testing only
 */
export function mockContractArtifact(): ContractArtifact {
  const artifact = {
    name: 'TestContract',
    functions: [],
    events: [],
    constants: [],
    outputs: {
      structs: {},
      globals: {},
    },
    storageLayout: {
      state: [],
      stateVars: {},
    },
    notes: {},
    fileMap: {},
  };
  return artifact as unknown as ContractArtifact;
}
