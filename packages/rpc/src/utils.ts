import type { JSONRPCSerializedData } from '@walletmesh/jsonrpc';
import type { ContractArtifact } from '@aztec/aztec.js';
import type { ContractInstance } from '@aztec/circuits.js';
import { SerializableContractInstance } from '@aztec/circuits.js';

/**
 * Deserializes a contract artifact from JSON-RPC serialized data.
 * @param data - The serialized data
 * @returns The deserialized contract artifact
 * @internal
 */
export function deserializeContractArtifact(data: JSONRPCSerializedData): ContractArtifact {
  return JSON.parse(atob(data.serialized));
}

/**
 * Serializes a contract artifact for JSON-RPC transmission.
 * @param contractArtifact - The contract artifact to serialize
 * @returns The serialized data
 * @internal
 */
export function serializeContractArtifact(contractArtifact: ContractArtifact): JSONRPCSerializedData {
  return {
    serialized: btoa(JSON.stringify(contractArtifact)),
  };
}

/**
 * Serializer for contract registration parameters.
 * @internal
 */
export const registerContractSerializer = {
  serialize: ({
    contractAddress,
    contractInstance,
    contractArtifact,
  }: {
    contractAddress: string;
    contractInstance: ContractInstance;
    contractArtifact?: ContractArtifact;
  }): JSONRPCSerializedData => {
    return {
      serialized: btoa(
        JSON.stringify({
          contractAddress,
          contractInstance: new SerializableContractInstance(contractInstance).toBuffer(),
          contractArtifact,
        }),
      ),
    };
  },
  deserialize: (
    data: JSONRPCSerializedData,
  ): { contractAddress: string; contractInstance: ContractInstance; contractArtifact?: ContractArtifact } => {
    const { contractAddress, contractInstance, contractArtifact } = JSON.parse(atob(data.serialized));
    return {
      contractAddress,
      contractInstance: SerializableContractInstance.fromBuffer(Buffer.from(contractInstance)),
      contractArtifact,
    };
  },
};

/**
 * Serializer for contract class registration parameters.
 * @internal
 */
export const registerContractClassSerializer = {
  serialize: ({ contractArtifact }: { contractArtifact: ContractArtifact }): JSONRPCSerializedData => {
    return { serialized: btoa(JSON.stringify(contractArtifact)) };
  },
  deserialize: (data: JSONRPCSerializedData): { contractArtifact: ContractArtifact } => {
    return { contractArtifact: JSON.parse(atob(data.serialized)) };
  },
};
