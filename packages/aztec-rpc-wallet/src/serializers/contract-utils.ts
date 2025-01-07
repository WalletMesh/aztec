import type { ContractClassWithId, PrivateFunction, PublicFunction } from '@aztec/circuits.js';
import { type ContractArtifact, type FunctionArtifact, FunctionSelector } from '@aztec/foundation/abi';
import { Fr } from '@aztec/aztec.js';

/**
 * Serializes a ContractClassWithId instance to a JSON string.
 * Handles the conversion of complex Aztec types (Fr, Buffer, FunctionSelector) to their string representations.
 *
 * The serialization process handles the following contract components:
 * - version: Contract class version number
 * - artifactHash: Fr value representing the hash of the contract artifact
 * - privateFunctions: Array of private function definitions with selectors and VK hashes
 * - publicFunctions: Array of public function definitions with selectors and bytecode
 * - packedBytecode: Buffer containing the contract's packed bytecode
 * - id: Fr value representing the contract class ID
 *
 * @param contract - The contract class with ID to serialize
 * @returns JSON string representation of the contract class
 * @throws If any contract components cannot be properly serialized
 */
export function serializeContractClassWithId(contract: ContractClassWithId): string {
  return JSON.stringify(contract, (key, value) => {
    let result = value;
    switch (key) {
      case 'version':
        result = value;
        break;
      case 'artifactHash':
        result = value.toString();
        break;
      case 'privateFunctions':
        result = value.map((fn: PrivateFunction) => ({
          selector: fn.selector.toString(),
          vkHash: fn.vkHash.toString(),
        }));
        break;
      case 'publicFunctions':
        result = value.map((fn: PublicFunction) => ({
          selector: fn.selector.toString(),
          bytecode: fn.bytecode.toString('hex'),
        }));
        break;
      case 'packedBytecode':
        result = value.toString('hex');
        break;
      case 'id':
        result = value.toString();
        break;
      default:
        console.warn(`serializeContractClassWithId: Unknown key: ${key}`);
        break;
    }
    return result;
  });
}

/**
 * Deserializes a JSON string into a ContractClassWithId instance.
 * Reconstructs complex Aztec types from their string representations.
 *
 * The deserialization process handles:
 * - version: Preserved as-is
 * - artifactHash: Reconstructed as Fr from hex string
 * - privateFunctions: Array of functions with:
 *   * selector: Reconstructed as FunctionSelector
 *   * vkHash: Reconstructed as Fr
 * - publicFunctions: Array of functions with:
 *   * selector: Reconstructed as FunctionSelector
 *   * bytecode: Reconstructed as Buffer
 * - packedBytecode: Reconstructed as Buffer from hex string
 * - id: Reconstructed as Fr from hex string
 *
 * @param json - The JSON string to deserialize, previously created by serializeContractClassWithId
 * @returns Reconstructed ContractClassWithId instance
 * @throws If the JSON string is malformed or contains invalid data
 */
export function deserializeContractClassWithId(json: string): ContractClassWithId {
  return JSON.parse(json, (key, value) => {
    switch (key) {
      case 'version':
        return value;
      case 'artifactHash':
        return Fr.fromHexString(value);
      case 'privateFunctions':
        return value.map((fn: { selector: string; vkHash: string }) => ({
          selector: FunctionSelector.fromString(fn.selector),
          vkHash: Fr.fromHexString(fn.vkHash),
        }));
      case 'publicFunctions':
        return value.map((fn: { selector: string; bytecode: string }) => ({
          selector: FunctionSelector.fromString(fn.selector),
          bytecode: Buffer.from(fn.bytecode, 'hex'),
        }));
      case 'packedBytecode':
        return Buffer.from(value, 'hex');
      case 'id':
        return Fr.fromHexString(value);
      default:
        console.warn(`deserializeContractClassWithId: Unknown key: ${key}`);
        break;
    }
    return value;
  });
}
