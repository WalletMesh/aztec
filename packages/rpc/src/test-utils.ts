import type { AztecAddress, ContractInstanceWithAddress, ContractArtifact, Fr } from '@aztec/aztec.js';
import { randomBytes } from '@aztec/foundation/crypto';
import {
  computeContractAddressFromInstance,
  computeContractClassId,
  getContractClassFromArtifact,
  SerializableContractInstance,
} from '@aztec/circuits.js';

import type { AztecProviderRPC } from './provider.js';
import type { RouterEventMap } from '@walletmesh/router';

export const randomContractArtifact = (): ContractArtifact => ({
  name: randomBytes(4).toString('hex'),
  functions: [],
  outputs: {
    structs: {},
    globals: {},
  },
  fileMap: {},
  storageLayout: {},
  notes: {},
});

export const randomContractInstanceWithAddress = (
  opts: { contractClassId?: Fr } = {},
  address?: AztecAddress,
): ContractInstanceWithAddress => {
  const instance = SerializableContractInstance.random(opts);
  return instance.withAddress(address ?? computeContractAddressFromInstance(instance));
};

export const randomDeployedContract = () => {
  const artifact = randomContractArtifact();
  const contractClassId = computeContractClassId(getContractClassFromArtifact(artifact));
  return { artifact, instance: randomContractInstanceWithAddress({ contractClassId }) };
};

/**
 * Helper function to emit events directly to a provider for testing
 */
export function emitProviderEvent<K extends keyof RouterEventMap>(
  provider: AztecProviderRPC,
  event: K,
  params: RouterEventMap[K],
): void {
  // Send event through transport to trigger proper event handling
  provider.receiveMessage({
    jsonrpc: '2.0',
    event,
    params,
  });
}
