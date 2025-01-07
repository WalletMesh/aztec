import { PrivateExecutionResult, TxProvingResult } from '@aztec/circuit-types';
import type {
  CountedContractClassLog,
  CountedPublicExecutionRequest,
  NoteAndSlot,
  PublicExecutionRequest,
} from '@aztec/circuit-types';
import type {
  ClientIvcProof,
  PrivateCircuitPublicInputs,
  PrivateKernelTailCircuitPublicInputs,
} from '@aztec/circuits.js';
import { Fr } from '@aztec/aztec.js';

/**
 * Interface representing the serialized form of a private execution result.
 * Contains all data needed to reconstruct a PrivateExecutionResult instance.
 */
interface SerializedPrivateExecutionResultData {
  acir: string;
  vk: string;
  partialWitness: [number, string][];
  publicInputs: PrivateCircuitPublicInputs;
  noteHashLeafIndexMap: [string, string][];
  newNotes: NoteAndSlot[];
  noteHashNullifierCounterMap: [number, number][];
  returnValues: string[];
  nestedExecutions: SerializedPrivateExecutionResultData[];
  enqueuedPublicFunctionCalls: CountedPublicExecutionRequest[];
  publicTeardownFunctionCall: PublicExecutionRequest;
  contractClassLogs: CountedContractClassLog[];
}

/**
 * Extends PrivateExecutionResult to add serialization capabilities.
 * Provides methods to convert private execution results to/from JSON format for RPC transport.
 */
export class SerializablePrivateExecutionResult extends PrivateExecutionResult {
  /**
   * Creates a SerializablePrivateExecutionResult from a PrivateExecutionResult instance.
   * @param result - The PrivateExecutionResult to convert
   * @returns A new SerializablePrivateExecutionResult instance
   */
  static from(result: PrivateExecutionResult): SerializablePrivateExecutionResult {
    return new SerializablePrivateExecutionResult(
      result.acir,
      result.vk,
      result.partialWitness,
      result.publicInputs,
      result.noteHashLeafIndexMap,
      result.newNotes,
      result.noteHashNullifierCounterMap,
      result.returnValues,
      result.nestedExecutions,
      result.enqueuedPublicFunctionCalls,
      result.publicTeardownFunctionCall,
      result.contractClassLogs,
    );
  }

  /**
   * Converts the execution result to a JSON-serializable format.
   * Handles conversion of complex types like Buffers, Maps, and nested execution results.
   * @returns The serialized execution result data
   */
  toJSON(): SerializedPrivateExecutionResultData {
    return {
      acir: this.acir.toString('base64'),
      vk: this.vk.toString('base64'),
      partialWitness: Array.from(this.partialWitness.entries()),
      publicInputs: this.publicInputs,
      noteHashLeafIndexMap: Array.from(this.noteHashLeafIndexMap.entries()).map(([k, v]) => [
        k.toString(),
        v.toString(),
      ]),
      newNotes: this.newNotes,
      noteHashNullifierCounterMap: Array.from(this.noteHashNullifierCounterMap.entries()),
      returnValues: this.returnValues.map((fr: Fr) => fr.toString()),
      nestedExecutions: this.nestedExecutions.map((exec: PrivateExecutionResult) =>
        exec instanceof SerializablePrivateExecutionResult
          ? exec.toJSON()
          : new SerializablePrivateExecutionResult(
              exec.acir,
              exec.vk,
              exec.partialWitness,
              exec.publicInputs,
              exec.noteHashLeafIndexMap,
              exec.newNotes,
              exec.noteHashNullifierCounterMap,
              exec.returnValues,
              exec.nestedExecutions,
              exec.enqueuedPublicFunctionCalls,
              exec.publicTeardownFunctionCall,
              exec.contractClassLogs,
            ).toJSON(),
      ),
      enqueuedPublicFunctionCalls: this.enqueuedPublicFunctionCalls,
      publicTeardownFunctionCall: this.publicTeardownFunctionCall,
      contractClassLogs: this.contractClassLogs,
    };
  }

  /**
   * Creates a SerializablePrivateExecutionResult from JSON data.
   * @param json - JSON string or pre-parsed data object
   * @returns A new SerializablePrivateExecutionResult instance
   */
  static fromJSON(json: string | SerializedPrivateExecutionResultData): SerializablePrivateExecutionResult {
    const data: SerializedPrivateExecutionResultData = typeof json === 'string' ? JSON.parse(json) : json;

    return new SerializablePrivateExecutionResult(
      Buffer.from(data.acir, 'base64'),
      Buffer.from(data.vk, 'base64'),
      new Map(data.partialWitness),
      data.publicInputs,
      new Map(data.noteHashLeafIndexMap.map(([k, v]) => [BigInt(k), BigInt(v)])),
      data.newNotes,
      new Map(data.noteHashNullifierCounterMap),
      data.returnValues.map((str: string) => Fr.fromString(str)),
      data.nestedExecutions.map((exec: SerializedPrivateExecutionResultData) =>
        SerializablePrivateExecutionResult.fromJSON(exec),
      ),
      data.enqueuedPublicFunctionCalls,
      data.publicTeardownFunctionCall,
      data.contractClassLogs,
    );
  }

  /**
   * Compares this execution result with another for equality.
   * @param other - The execution result to compare against
   * @returns True if the execution results are equivalent
   */
  equals(other: PrivateExecutionResult): boolean {
    const thisJson = JSON.stringify(SerializablePrivateExecutionResult.from(this).toJSON());
    const otherJson = JSON.stringify(SerializablePrivateExecutionResult.from(other).toJSON());
    return thisJson === otherJson;
  }

  toComparable(): SerializedPrivateExecutionResultData {
    return JSON.parse(JSON.stringify(this.toJSON()));
  }
}

/**
 * Interface representing the serialized form of a transaction proving result.
 * Contains the private execution result, public inputs, and client IVC proof.
 */
interface SerializedTxProvingResultData {
  privateExecutionResult: ReturnType<SerializablePrivateExecutionResult['toJSON']>;
  publicInputs: PrivateKernelTailCircuitPublicInputs;
  clientIvcProof: ClientIvcProof;
}

/**
 * Extends TxProvingResult to add serialization capabilities.
 * Provides methods to convert transaction proving results to/from JSON format for RPC transport.
 */
export class SerializableTxProvingResult extends TxProvingResult {
  /**
   * Creates a SerializableTxProvingResult from a TxProvingResult instance.
   * @param result - The TxProvingResult to convert
   * @returns A new SerializableTxProvingResult instance
   */
  static from(result: TxProvingResult): SerializableTxProvingResult {
    return new SerializableTxProvingResult(
      result.privateExecutionResult,
      result.publicInputs,
      result.clientIvcProof,
    );
  }

  /**
   * Converts the proving result to a JSON-serializable format.
   * @returns The serialized proving result data
   */
  toJSON(): SerializedTxProvingResultData {
    return {
      privateExecutionResult: SerializablePrivateExecutionResult.from(this.privateExecutionResult).toJSON(),
      publicInputs: this.publicInputs,
      clientIvcProof: this.clientIvcProof,
    };
  }

  /**
   * Creates a SerializableTxProvingResult from JSON data.
   * @param json - JSON string or pre-parsed data object
   * @returns A new SerializableTxProvingResult instance
   */
  static fromJSON(json: string | SerializedTxProvingResultData): SerializableTxProvingResult {
    const data: SerializedTxProvingResultData = typeof json === 'string' ? JSON.parse(json) : json;

    return new SerializableTxProvingResult(
      SerializablePrivateExecutionResult.fromJSON(data.privateExecutionResult),
      data.publicInputs,
      data.clientIvcProof,
    );
  }

  /**
   * Compares this proving result with another for equality.
   * @param other - The proving result to compare against
   * @returns True if the proving results are equivalent
   */
  equals(other: TxProvingResult): boolean {
    const thisJson = JSON.stringify(SerializableTxProvingResult.from(this).toJSON());
    const otherJson = JSON.stringify(SerializableTxProvingResult.from(other).toJSON());
    return thisJson === otherJson;
  }

  toComparable(): SerializedTxProvingResultData {
    return JSON.parse(JSON.stringify(this.toJSON()));
  }
}

/**
 * Utility function to compare two PrivateExecutionResult instances for equality.
 * @param a - First execution result
 * @param b - Second execution result
 * @returns True if the execution results are equivalent
 */
export function comparePrivateExecutionResults(
  a: PrivateExecutionResult,
  b: PrivateExecutionResult,
): boolean {
  return SerializablePrivateExecutionResult.from(a).equals(b);
}

/**
 * Utility function to compare two TxProvingResult instances for equality.
 * @param a - First proving result
 * @param b - Second proving result
 * @returns True if the proving results are equivalent
 */
export function compareTxProvingResults(a: TxProvingResult, b: TxProvingResult): boolean {
  return SerializableTxProvingResult.from(a).equals(b);
}
