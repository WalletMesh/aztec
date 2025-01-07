import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from './types.js';
import { encodeBase64, decodeBase64 } from './types.js';
import { aztecAddressSerializer, frSerializer } from './core.js';
import { SerializableContractInstance } from '@aztec/circuits.js';
import { ContractArtifactSchema } from '@aztec/foundation/abi';
import { serializeContractClassWithId, deserializeContractClassWithId } from './contract-utils.js';

/**
 * Serializer for the aztec_getContractInstance RPC method.
 * Handles serialization of contract instance queries and results between JSON-RPC format and native Aztec types.
 * Used to retrieve deployed contract instances by their address.
 */
export class AztecGetContractInstanceSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractInstance']['params'],
      AztecWalletMethodMap['aztec_getContractInstance']['result']
    >
{
  params = {
    /**
     * Serializes contract instance query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the contract address to look up
     * @returns Serialized address data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractInstance']['params'],
    ): JSONRPCSerializedData => {
      const { address } = value;
      return {
        method,
        serialized: encodeBase64(aztecAddressSerializer.serialize(address)),
      };
    },
    /**
     * Deserializes contract instance query parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized address data
     * @returns Deserialized query parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractInstance']['params'] => {
      const address = aztecAddressSerializer.deserialize(decodeBase64(data.serialized));
      return { address };
    },
  };

  result = {
    /**
     * Serializes the contract instance query result.
     * @param method - The RPC method name
     * @param value - The contract instance data including address and state
     * @returns Serialized contract instance data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractInstance']['result'],
    ): JSONRPCSerializedData => {
      const serializable = new SerializableContractInstance(value);
      const { address } = value;

      return {
        method,
        serialized: encodeBase64(
          JSON.stringify({
            instance: serializable.toBuffer().toString('hex'),
            address: aztecAddressSerializer.serialize(address),
          }),
        ),
      };
    },
    /**
     * Deserializes the contract instance query result.
     * @param method - The RPC method name
     * @param data - The serialized contract instance data
     * @returns Deserialized contract instance
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractInstance']['result'] => {
      const { instance, address } = JSON.parse(decodeBase64(data.serialized));
      const baseInstance = SerializableContractInstance.fromBuffer(Buffer.from(instance, 'hex'));
      const deserializedAddress = aztecAddressSerializer.deserialize(address);
      return baseInstance.withAddress(deserializedAddress);
    },
  };
}

/**
 * Serializer for the aztec_getContractClass RPC method.
 * Handles serialization of contract class queries and results between JSON-RPC format and native Aztec types.
 * Used to retrieve contract class definitions by their ID.
 */
export class AztecGetContractClassSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractClass']['params'],
      AztecWalletMethodMap['aztec_getContractClass']['result']
    >
{
  params = {
    /**
     * Serializes contract class query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the class ID to look up
     * @returns Serialized class ID data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClass']['params'],
    ): JSONRPCSerializedData => {
      const { id } = value;
      return {
        method,
        serialized: encodeBase64(frSerializer.serialize(id)),
      };
    },
    /**
     * Deserializes contract class query parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized class ID data
     * @returns Deserialized query parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractClass']['params'] => {
      const id = frSerializer.deserialize(decodeBase64(data.serialized));
      return { id };
    },
  };

  result = {
    /**
     * Serializes the contract class query result.
     * @param method - The RPC method name
     * @param value - The contract class definition with its ID
     * @returns Serialized contract class data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClass']['result'],
    ): JSONRPCSerializedData => {
      const serialized = serializeContractClassWithId(value);
      return {
        method,
        serialized: encodeBase64(JSON.stringify(serialized)),
      };
    },
    /**
     * Deserializes the contract class query result.
     * @param method - The RPC method name
     * @param data - The serialized contract class data
     * @returns Deserialized contract class with ID
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractClass']['result'] => {
      const parsed = JSON.parse(decodeBase64(data.serialized));
      return deserializeContractClassWithId(parsed);
    },
  };
}

/**
 * Serializer for the aztec_getContractArtifact RPC method.
 * Handles serialization of contract artifact queries and results between JSON-RPC format and native Aztec types.
 * Used to retrieve contract artifacts (ABI, bytecode, etc.) by their ID.
 */
export class AztecGetContractArtifactSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractArtifact']['params'],
      AztecWalletMethodMap['aztec_getContractArtifact']['result']
    >
{
  params = {
    /**
     * Serializes contract artifact query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the artifact ID to look up
     * @returns Serialized artifact ID data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractArtifact']['params'],
    ): JSONRPCSerializedData => {
      const { id } = value;
      return {
        method,
        serialized: encodeBase64(frSerializer.serialize(id)),
      };
    },
    /**
     * Deserializes contract artifact query parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized artifact ID data
     * @returns Deserialized query parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractArtifact']['params'] => {
      const id = frSerializer.deserialize(decodeBase64(data.serialized));
      return { id };
    },
  };

  result = {
    /**
     * Serializes the contract artifact query result.
     * @param method - The RPC method name
     * @param value - The contract artifact data
     * @returns Serialized contract artifact
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractArtifact']['result'],
    ): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(value)),
      };
    },
    /**
     * Deserializes the contract artifact query result.
     * @param method - The RPC method name
     * @param data - The serialized artifact data
     * @returns Deserialized contract artifact
     * @throws If the data doesn't match the contract artifact schema
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractArtifact']['result'] => {
      return ContractArtifactSchema.parse(JSON.parse(decodeBase64(data.serialized)));
    },
  };
}

/**
 * Serializer for the aztec_registerContract RPC method.
 * Handles serialization of contract registration requests between JSON-RPC format and native Aztec types.
 * Used to register new contract instances with optional artifacts.
 */
export class AztecRegisterContractSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_registerContract']['params'],
      AztecWalletMethodMap['aztec_registerContract']['result']
    >
{
  params = {
    /**
     * Serializes contract registration parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing contract instance and optional artifact
     * @returns Serialized registration data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_registerContract']['params'],
    ): JSONRPCSerializedData => {
      const { instance, artifact } = value;
      const serializable = new SerializableContractInstance(instance);

      const serializedInstance = {
        instance: Buffer.from(serializable.toBuffer()).toString('base64'),
        address: aztecAddressSerializer.serialize(instance.address),
      };

      const serializedArtifact = artifact ? JSON.stringify(artifact) : undefined;

      return {
        method,
        serialized: encodeBase64(
          JSON.stringify({
            instance: serializedInstance,
            artifact: serializedArtifact,
          }),
        ),
      };
    },
    /**
     * Deserializes contract registration parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized registration data
     * @returns Deserialized registration parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_registerContract']['params'] => {
      const { instance, artifact } = JSON.parse(decodeBase64(data.serialized));
      const { instance: instanceBuffer, address } = instance;
      const baseInstance = SerializableContractInstance.fromBuffer(Buffer.from(instanceBuffer, 'base64'));
      const deserializedAddress = aztecAddressSerializer.deserialize(address);
      return {
        instance: baseInstance.withAddress(deserializedAddress),
        artifact: artifact ? JSON.parse(artifact) : undefined,
      };
    },
  };

  result = {
    /**
     * Serializes the contract registration result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of registration
     * @returns Serialized result
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_registerContract']['result'],
    ): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(value)),
      };
    },
    /**
     * Deserializes the contract registration result.
     * @param method - The RPC method name
     * @param data - The serialized result data
     * @returns Boolean indicating success
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_registerContract']['result'] => {
      return JSON.parse(decodeBase64(data.serialized));
    },
  };
}

/**
 * Pre-instantiated serializer instances for Aztec contract-related RPC methods.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecGetContractInstanceSerializer = new AztecGetContractInstanceSerializer();
export const aztecGetContractClassSerializer = new AztecGetContractClassSerializer();
export const aztecGetContractArtifactSerializer = new AztecGetContractArtifactSerializer();
export const aztecRegisterContractSerializer = new AztecRegisterContractSerializer();
