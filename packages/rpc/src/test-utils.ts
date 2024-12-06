import type { AztecAddress, ContractInstanceWithAddress, ContractArtifact, Fr } from '@aztec/aztec.js';
import { randomBytes } from '@aztec/foundation/crypto';
import {
  computeContractAddressFromInstance,
  computeContractClassId,
  getContractClassFromArtifact,
  SerializableContractInstance,
} from '@aztec/circuits.js';

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
