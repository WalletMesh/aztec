import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from './types.js';
import { encodeBase64, decodeBase64 } from './types.js';
import type { IncomingNotesFilter } from '@aztec/circuit-types';
import { UniqueNote } from '@aztec/circuit-types';
import { ExtendedNote } from '@aztec/aztec.js';

/**
 * Serializer for the aztec_getIncomingNotes RPC method.
 * Handles serialization of incoming note queries and results between JSON-RPC format and native Aztec types.
 * Used to retrieve notes that have been sent to an account but not yet processed.
 */
export class AztecGetIncomingNotesSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getIncomingNotes']['params'],
      AztecWalletMethodMap['aztec_getIncomingNotes']['result']
    >
{
  params = {
    /**
     * Serializes incoming notes filter parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing filter criteria for incoming notes
     * @returns Serialized filter data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getIncomingNotes']['params'],
    ): JSONRPCSerializedData => {
      const { filter } = value;
      return {
        method,
        serialized: encodeBase64(JSON.stringify(filter)),
      };
    },
    /**
     * Deserializes incoming notes filter parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized filter data
     * @returns Deserialized filter parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getIncomingNotes']['params'] => {
      const filter = JSON.parse(decodeBase64(data.serialized)) as IncomingNotesFilter;
      return { filter };
    },
  };

  result = {
    /**
     * Serializes the incoming notes query result.
     * @param method - The RPC method name
     * @param value - Array of unique notes matching the filter criteria
     * @returns Serialized note array
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getIncomingNotes']['result'],
    ): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(value.map((n) => n.toString()))),
      };
    },
    /**
     * Deserializes the incoming notes query result.
     * @param method - The RPC method name
     * @param data - The serialized note array data
     * @returns Array of deserialized unique notes
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getIncomingNotes']['result'] => {
      return JSON.parse(decodeBase64(data.serialized)).map((n: string) => UniqueNote.fromString(n));
    },
  };
}

/**
 * Serializer for the aztec_addNote RPC method.
 * Handles serialization of note addition requests between JSON-RPC format and native Aztec types.
 * Used to add new notes to an account's note tree.
 */
export class AztecAddNoteSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_addNote']['params'],
      AztecWalletMethodMap['aztec_addNote']['result']
    >
{
  params = {
    /**
     * Serializes note addition parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the note to add
     * @returns Serialized note data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_addNote']['params'],
    ): JSONRPCSerializedData => {
      const { note } = value;
      return {
        method,
        serialized: encodeBase64(note.toBuffer().toString('hex')),
      };
    },
    /**
     * Deserializes note addition parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized note data
     * @returns Deserialized note parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_addNote']['params'] => {
      const note = ExtendedNote.fromBuffer(Buffer.from(decodeBase64(data.serialized), 'hex'));
      return { note };
    },
  };

  result = {
    /**
     * Serializes the note addition result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of the note addition
     * @returns Serialized result
     */
    serialize: (method: string, value: boolean): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(value)),
      };
    },
    /**
     * Deserializes the note addition result.
     * @param method - The RPC method name
     * @param data - The serialized result data
     * @returns Boolean indicating success
     */
    deserialize: (method: string, data: JSONRPCSerializedData): boolean => {
      return JSON.parse(decodeBase64(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_addNullifiedNote RPC method.
 * Handles serialization of nullified note addition requests between JSON-RPC format and native Aztec types.
 * Used to mark notes as spent/nullified in the note tree.
 */
export class AztecAddNullifiedNoteSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_addNullifiedNote']['params'],
      AztecWalletMethodMap['aztec_addNullifiedNote']['result']
    >
{
  params = {
    /**
     * Serializes nullified note addition parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the nullified note to add
     * @returns Serialized note data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_addNullifiedNote']['params'],
    ): JSONRPCSerializedData => {
      const { note } = value;
      return {
        method,
        serialized: encodeBase64(note.toBuffer().toString('hex')),
      };
    },
    /**
     * Deserializes nullified note addition parameters from RPC transport.
     * @param method - The RPC method name
     * @param data - The serialized note data
     * @returns Deserialized note parameters
     */
    deserialize: (
      method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_addNullifiedNote']['params'] => {
      const note = ExtendedNote.fromBuffer(Buffer.from(decodeBase64(data.serialized), 'hex'));
      return { note };
    },
  };

  result = {
    /**
     * Serializes the nullified note addition result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of the nullified note addition
     * @returns Serialized result
     */
    serialize: (method: string, value: boolean): JSONRPCSerializedData => {
      return {
        method,
        serialized: encodeBase64(JSON.stringify(value)),
      };
    },
    /**
     * Deserializes the nullified note addition result.
     * @param method - The RPC method name
     * @param data - The serialized result data
     * @returns Boolean indicating success
     */
    deserialize: (method: string, data: JSONRPCSerializedData): boolean => {
      return JSON.parse(decodeBase64(data.serialized));
    },
  };
}

/**
 * Pre-instantiated serializer instances for Aztec note-related RPC methods.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecGetIncomingNotesSerializer = new AztecGetIncomingNotesSerializer();
export const aztecAddNoteSerializer = new AztecAddNoteSerializer();
export const aztecAddNullifiedNoteSerializer = new AztecAddNullifiedNoteSerializer();
