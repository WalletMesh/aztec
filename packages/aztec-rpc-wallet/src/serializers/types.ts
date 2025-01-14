import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';

/**
 * Base interface for type-specific serializers in the Aztec RPC wallet.
 * Provides a standardized way to convert Aztec-specific types to and from string representations
 * for network transmission. Each Aztec type (Fr, AztecAddress, etc.) implements this interface
 * to ensure consistent serialization across the RPC layer.
 *
 * @typeParam T - The Aztec type being serialized (e.g., Fr, AztecAddress, TxHash)
 */
export interface TypeSerializer<T> {
  /**
   * Converts a value to its string representation for network transmission.
   * Implementations should ensure the serialized form can be correctly deserialized
   * back to the original type.
   *
   * @param value - The Aztec type value to serialize
   * @returns A string representation suitable for network transmission
   */
  serialize(value: T): string;

  /**
   * Reconstructs a value from its string representation.
   * Implementations should validate the input string and throw appropriate errors
   * if the data cannot be correctly deserialized.
   *
   * @param data - The string data to deserialize, previously created by serialize()
   * @returns The reconstructed Aztec type value
   * @throws If the data is invalid or cannot be deserialized
   */
  deserialize(data: string): T;
}

// Re-export core JSON-RPC types from @walletmesh/jsonrpc
export type { JSONRPCSerializedData, JSONRPCSerializer };

/**
 * Helper function to encode data as base64 for safe network transmission.
 * Used throughout the serializers to ensure consistent encoding of binary data.
 *
 * @param data - The string data to encode
 * @returns Base64 encoded string
 */
export function encodeBase64(data: string): string {
  return btoa(data);
}

/**
 * Helper function to decode base64 data back to its original form.
 * Used throughout the serializers to decode data received over the network.
 *
 * @param data - The base64 encoded string to decode
 * @returns Original decoded string
 * @throws If the input is not valid base64
 */
export function decodeBase64(data: string): string {
  return atob(data);
}
