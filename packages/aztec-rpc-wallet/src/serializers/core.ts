import { Fr, AztecAddress, CompleteAddress, AuthWitness, TxHash } from '@aztec/aztec.js';
import { encodeBase64, decodeBase64 } from './types.js';
import type { TypeSerializer } from './types.js';

/**
 * Serializer for Fr (field element) values in the Aztec protocol.
 * Handles conversion of field elements to/from base64-encoded strings for RPC transport.
 * Field elements are fundamental to Aztec's cryptographic operations.
 */
export class FrSerializer implements TypeSerializer<Fr> {
  /**
   * Converts an Fr value to a base64-encoded string.
   * @param value - The field element to serialize
   * @returns Base64-encoded string representation
   */
  serialize(value: Fr): string {
    return encodeBase64(value.toString());
  }

  /**
   * Reconstructs an Fr value from a base64-encoded string.
   * @param data - The base64-encoded string to deserialize
   * @returns Reconstructed field element
   * @throws If the input string is not a valid field element representation
   */
  deserialize(data: string): Fr {
    return Fr.fromHexString(decodeBase64(data));
  }
}

/**
 * Serializer for Aztec protocol addresses.
 * Handles conversion of AztecAddress instances to/from base64-encoded strings.
 * Aztec addresses represent accounts and contracts in the protocol.
 */
export class AztecAddressSerializer implements TypeSerializer<AztecAddress> {
  /**
   * Converts an AztecAddress to a base64-encoded string.
   * @param value - The Aztec address to serialize
   * @returns Base64-encoded string representation
   */
  serialize(value: AztecAddress): string {
    return encodeBase64(value.toString());
  }

  /**
   * Reconstructs an AztecAddress from a base64-encoded string.
   * @param data - The base64-encoded string to deserialize
   * @returns Reconstructed Aztec address
   * @throws If the input string is not a valid address representation
   */
  deserialize(data: string): AztecAddress {
    return AztecAddress.fromString(decodeBase64(data));
  }
}

/**
 * Serializer for complete Aztec addresses that include additional metadata.
 * CompleteAddress extends AztecAddress with extra information needed for certain operations.
 */
export class CompleteAddressSerializer implements TypeSerializer<CompleteAddress> {
  /**
   * Converts a CompleteAddress to a base64-encoded string.
   * @param value - The complete address to serialize
   * @returns Base64-encoded string representation
   */
  serialize(value: CompleteAddress): string {
    return encodeBase64(value.toString());
  }

  /**
   * Reconstructs a CompleteAddress from a base64-encoded string.
   * @param data - The base64-encoded string to deserialize
   * @returns Reconstructed complete address
   * @throws If the input string is not a valid complete address representation
   */
  deserialize(data: string): CompleteAddress {
    return CompleteAddress.fromString(decodeBase64(data));
  }
}

/**
 * Serializer for authentication witnesses in the Aztec protocol.
 * AuthWitness values are used to prove transaction authorization.
 */
export class AuthWitnessSerializer implements TypeSerializer<AuthWitness> {
  /**
   * Converts an AuthWitness to a base64-encoded string.
   * @param value - The authentication witness to serialize
   * @returns Base64-encoded string representation
   */
  serialize(value: AuthWitness): string {
    return encodeBase64(value.toString());
  }

  /**
   * Reconstructs an AuthWitness from a base64-encoded string.
   * @param data - The base64-encoded string to deserialize
   * @returns Reconstructed authentication witness
   * @throws If the input string is not a valid auth witness representation
   */
  deserialize(data: string): AuthWitness {
    return AuthWitness.fromString(decodeBase64(data));
  }
}

/**
 * Serializer for transaction hashes in the Aztec protocol.
 * TxHash values uniquely identify transactions and are used for lookups and references.
 */
export class TxHashSerializer implements TypeSerializer<TxHash> {
  /**
   * Converts a TxHash to a base64-encoded string.
   * @param value - The transaction hash to serialize
   * @returns Base64-encoded string representation
   */
  serialize(value: TxHash): string {
    return encodeBase64(value.toString());
  }

  /**
   * Reconstructs a TxHash from a base64-encoded string.
   * @param data - The base64-encoded string to deserialize
   * @returns Reconstructed transaction hash
   * @throws If the input string is not a valid transaction hash representation
   */
  deserialize(data: string): TxHash {
    return TxHash.fromString(decodeBase64(data));
  }
}

/**
 * Pre-instantiated serializer instances for common Aztec types.
 * These singletons should be used instead of creating new instances
 * to ensure consistent serialization across the application.
 */
export const frSerializer = new FrSerializer();
export const aztecAddressSerializer = new AztecAddressSerializer();
export const completeAddressSerializer = new CompleteAddressSerializer();
export const authWitnessSerializer = new AuthWitnessSerializer();
export const txHashSerializer = new TxHashSerializer();
