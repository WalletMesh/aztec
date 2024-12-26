/**
 * @module serializers
 *
 * This module provides serialization and deserialization functionality for Aztec RPC data types.
 * It handles conversion between native Aztec types and JSON-RPC compatible formats for network transmission.
 *
 * The serialization process:
 * 1. Converts complex Aztec types (Fr, AztecAddress, etc.) to string representations
 * 2. Encodes data using base64 for safe transmission
 * 3. Maintains type safety through TypeScript generics
 *
 * The deserialization process:
 * 1. Decodes base64 data
 * 2. Reconstructs native Aztec types from string representations
 * 3. Validates data using Zod schemas where applicable
 */

import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';

import {
  ContractClassWithIdSchema,
  ContractInstanceWithAddressSchema,
  GasFees,
  NodeInfoSchema,
  ProtocolContractAddressesSchema,
} from '@aztec/circuits.js';

import type { EventMetadataDefinition, IncomingNotesFilter, PXEInfo } from '@aztec/circuit-types';
import {
  inBlockSchemaFor,
  GetUnencryptedLogsResponseSchema,
  TxEffect,
  TxProvingResult,
  TxSimulationResult,
  UniqueNote,
} from '@aztec/circuit-types';

import type { LogFilter, PartialAddress } from '@aztec/aztec.js';

import { AbiTypeSchema, ContractArtifactSchema, EventSelector } from '@aztec/foundation/abi';
import { AbiDecodedSchema } from '@aztec/foundation/schemas';

import {
  AuthWitness,
  AztecAddress,
  CompleteAddress,
  ExtendedNote,
  Fr,
  L2Block,
  Point,
  TxHash,
  SiblingPath,
  TxExecutionRequest,
  TxReceipt,
} from '@aztec/aztec.js';

import type { AztecWalletMethodMap } from './types.js';

/**
 * Serializes/deserializes RPC method parameters.
 * Handles conversion between native types and network-safe formats.
 *
 * @param method - RPC method name
 * @param value - Value to convert (parameters or serialized data)
 * @param serialize - True to serialize, false to deserialize
 * @returns Converted value
 */
export function paramsSerde<M extends keyof AztecWalletMethodMap, P = AztecWalletMethodMap[M]['params']>(
  method: M,
  value: P | JSONRPCSerializedData,
  serialize: boolean,
): JSONRPCSerializedData | P {
  switch (method) {
    case 'aztec_setScopes': {
      if (serialize) {
        const { scopes } = value as AztecWalletMethodMap['aztec_setScopes']['params'];
        const result: JSONRPCSerializedData = {
          method,
          serialized: atob(JSON.stringify(scopes.map((s) => s.toString()))),
        };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const scopes = JSON.parse(btoa(data.serialized)).map((s: string) => AztecAddress.fromString(s));
      return { scopes } as P;
    }
    case 'aztec_isL1ToL2MessageSynced': {
      if (serialize) {
        const { l1ToL2Message } = value as AztecWalletMethodMap['aztec_isL1ToL2MessageSynced']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(l1ToL2Message.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const l1ToL2Message = Fr.fromHexString(btoa(data.serialized));
      return { l1ToL2Message } as P;
    }
    case 'aztec_getL1ToL2MembershipWitness': {
      if (serialize) {
        const { contractAddress, messageHash, secret } =
          value as AztecWalletMethodMap['aztec_getL1ToL2MembershipWitness']['params'];
        const serialized = atob(
          JSON.stringify([contractAddress.toString(), messageHash.toString(), secret.toString()]),
        );
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const [contractAddress, messageHash, secret] = JSON.parse(btoa(data.serialized));
      return {
        contractAddress: AztecAddress.fromString(contractAddress),
        messageHash: Fr.fromHexString(messageHash),
        secret: Fr.fromHexString(secret),
      } as P;
    }
    case 'aztec_addCapsule': {
      if (serialize) {
        const { capsule } = value as AztecWalletMethodMap['aztec_addCapsule']['params'];
        const result: JSONRPCSerializedData = {
          method,
          serialized: atob(JSON.stringify(capsule.map((c) => c.toString()))),
        };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const capsule = JSON.parse(btoa(data.serialized)).map((c: string) => Fr.fromHexString(c));
      return { capsule } as P;
    }
    case 'aztec_registerAccount': {
      if (serialize) {
        const { secretKey, partialAddress } =
          value as AztecWalletMethodMap['aztec_registerAccount']['params'];
        const serialized = atob(JSON.stringify([secretKey.toString(), partialAddress]));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const [secretKey, partialAddress] = JSON.parse(btoa(data.serialized));
      return {
        secretKey: Fr.fromHexString(secretKey),
        partialAddress: Fr.fromHexString(partialAddress) as PartialAddress,
      } as P;
    }
    case 'aztec_addAuthWitness': {
      if (serialize) {
        const { authWitness } = value as AztecWalletMethodMap['aztec_addAuthWitness']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(authWitness.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const authWitness = AuthWitness.fromString(btoa(data.serialized));
      return { authWitness } as P;
    }
    case 'aztec_getAuthWitness': {
      if (serialize) {
        const { messageHash } = value as AztecWalletMethodMap['aztec_getAuthWitness']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(messageHash.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const messageHash = Fr.fromHexString(btoa(data.serialized));
      return { messageHash } as P;
    }
    case 'aztec_createAuthWit': {
      if (serialize) {
        const { intent } = value as AztecWalletMethodMap['aztec_createAuthWit']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(intent.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const intent = Fr.fromHexString(btoa(data.serialized));
      return { intent } as P;
    }
    case 'aztec_registerSender': {
      if (serialize) {
        const { sender } = value as AztecWalletMethodMap['aztec_registerSender']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(sender.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const sender = AztecAddress.fromString(btoa(data.serialized));
      return { sender } as P;
    }
    case 'aztec_removeSender': {
      if (serialize) {
        const { sender } = value as AztecWalletMethodMap['aztec_removeSender']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(sender.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const sender = AztecAddress.fromString(btoa(data.serialized));
      return { sender } as P;
    }
    case 'aztec_getContractInstance': {
      if (serialize) {
        const { address } = value as AztecWalletMethodMap['aztec_getContractInstance']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(address.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const address = AztecAddress.fromString(btoa(data.serialized));
      return { address } as P;
    }
    case 'aztec_getContractClass': {
      if (serialize) {
        const { id } = value as AztecWalletMethodMap['aztec_getContractClass']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(id.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const id = Fr.fromHexString(btoa(data.serialized));
      return { id } as P;
    }
    case 'aztec_getContractArtifact': {
      if (serialize) {
        const { id } = value as AztecWalletMethodMap['aztec_getContractArtifact']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(id.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const id = Fr.fromHexString(btoa(data.serialized));
      return { id } as P;
    }
    case 'aztec_isContractClassPubliclyRegistered': {
      if (serialize) {
        const { id } = value as AztecWalletMethodMap['aztec_isContractClassPubliclyRegistered']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(id.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const id = Fr.fromHexString(btoa(data.serialized));
      return { id } as P;
    }
    case 'aztec_isContractPubliclyDeployed': {
      if (serialize) {
        const { address } = value as AztecWalletMethodMap['aztec_isContractPubliclyDeployed']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(address.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const address = AztecAddress.fromString(btoa(data.serialized));
      return { address } as P;
    }
    case 'aztec_isContractInitialized': {
      if (serialize) {
        const { address } = value as AztecWalletMethodMap['aztec_isContractInitialized']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(address.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const address = AztecAddress.fromString(btoa(data.serialized));
      return { address } as P;
    }
    case 'aztec_registerContract': {
      if (serialize) {
        const { instance, artifact } = value as AztecWalletMethodMap['aztec_registerContract']['params'];

        const serialized = atob(
          JSON.stringify({ instance: ContractInstanceWithAddressSchema.parse(instance), artifact }),
        );
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const { instance, artifact } = JSON.parse(atob(data.serialized));
      return {
        instance: ContractInstanceWithAddressSchema.parse(instance),
        artifact,
      } as P;
    }
    case 'aztec_registerContractClass': {
      if (serialize) {
        const { artifact } = value as AztecWalletMethodMap['aztec_registerContractClass']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(JSON.stringify(artifact)) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const artifact = JSON.parse(atob(data.serialized));
      return { artifact } as P;
    }
    case 'aztec_getPublicStorageAt': {
      if (serialize) {
        const { contract, storageSlot } = value as AztecWalletMethodMap['aztec_getPublicStorageAt']['params'];
        const result: JSONRPCSerializedData = {
          method,
          serialized: atob(JSON.stringify([contract.toString(), storageSlot.toString()])),
        };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const [contract, storageSlot] = JSON.parse(atob(data.serialized));
      return {
        contract: AztecAddress.fromString(contract),
        storageSlot: Fr.fromHexString(storageSlot),
      } as P;
    }
    case 'aztec_createTxExecutionRequest': {
      if (serialize) {
        const { exec } = value as AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'];

        // TODO: it doesn't look like `exec` (type ExecutionRequestInit) is serializable
        const serialized = atob(JSON.stringify(exec));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const exec = JSON.parse(atob(data.serialized));
      return { exec } as P;
    }
    case 'aztec_proveTx': {
      if (serialize) {
        const { txRequest, privateExecutionResult } =
          value as AztecWalletMethodMap['aztec_proveTx']['params'];
        // TODO: it doesn't look like `privateExecutionResult` (type PrivateExecutionResult) is serializable
        const serialized = atob(JSON.stringify([txRequest.toString(), privateExecutionResult]));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const [txRequest, privateExecutionResult] = JSON.parse(atob(data.serialized));
      return { txRequest: TxExecutionRequest.fromString(txRequest), privateExecutionResult } as P;
    }
    case 'aztec_getTxEffect': {
      if (serialize) {
        const { txHash } = value as AztecWalletMethodMap['aztec_getTxEffect']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(txHash.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const txHash = TxHash.fromString(btoa(data.serialized));
      return { txHash } as P;
    }
    case 'aztec_getTxReceipt': {
      if (serialize) {
        const { txHash } = value as AztecWalletMethodMap['aztec_getTxReceipt']['params'];
        const result: JSONRPCSerializedData = { method, serialized: atob(txHash.toString()) };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const txHash = TxHash.fromString(btoa(data.serialized));
      return { txHash } as P;
    }
    case 'aztec_simulateTx': {
      if (serialize) {
        const { txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile } =
          value as AztecWalletMethodMap['aztec_simulateTx']['params'];
        // TODO: it doesn't look like `txRequest` (type TxExecutionRequest) is serializable
        const serialized = atob(
          JSON.stringify([
            txRequest,
            simulatePublic,
            msgSender,
            skipTxValidation,
            enforceFeePayment,
            profile,
          ]),
        );
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const [txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile] = JSON.parse(
        atob(data.serialized),
      );
      return { txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile } as P;
    }
    case 'aztec_simulateUnconstrained': {
      if (serialize) {
        const { functionName, args, to, from } =
          value as AztecWalletMethodMap['aztec_simulateUnconstrained']['params'];
        const serialized = atob(JSON.stringify([functionName, args, to.toString(), from?.toString()]));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const [functionName, args, to, from] = JSON.parse(atob(data.serialized));
      return {
        functionName,
        args,
        to: AztecAddress.fromString(to),
        from: from && AztecAddress.fromString(from),
      } as P;
    }
    case 'aztec_getIncomingNotes': {
      if (serialize) {
        const { filter } = value as AztecWalletMethodMap['aztec_getIncomingNotes']['params'];
        const serialized = atob(JSON.stringify(filter));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const filter = JSON.parse(atob(data.serialized)) as IncomingNotesFilter;
      return { filter } as P;
    }
    case 'aztec_addNote': {
      if (serialize) {
        const { note } = value as AztecWalletMethodMap['aztec_addNote']['params'];
        const serialized = atob(note.toBuffer().toString('hex'));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const note = ExtendedNote.fromBuffer(Buffer.from(data.serialized, 'hex'));
      return { note } as P;
    }
    case 'aztec_addNullifiedNote': {
      if (serialize) {
        const { note } = value as AztecWalletMethodMap['aztec_addNullifiedNote']['params'];
        const serialized = atob(note.toBuffer().toString('hex'));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const note = ExtendedNote.fromBuffer(Buffer.from(data.serialized, 'hex'));
      return { note } as P;
    }
    case 'aztec_getUnencryptedLogs': {
      if (serialize) {
        const { filter } = value as AztecWalletMethodMap['aztec_getUnencryptedLogs']['params'];
        const serialized = atob(JSON.stringify(filter));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const filter = JSON.parse(atob(data.serialized)) as LogFilter;
      return { filter } as P;
    }
    case 'aztec_getContractClassLogs': {
      if (serialize) {
        const { filter } = value as AztecWalletMethodMap['aztec_getContractClassLogs']['params'];
        const serialized = atob(JSON.stringify(filter));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const filter = JSON.parse(atob(data.serialized)) as LogFilter;
      return { filter } as P;
    }
    case 'aztec_getEncryptedEvents': {
      if (serialize) {
        const { event, from, limit, vpks } =
          value as AztecWalletMethodMap['aztec_getEncryptedEvents']['params'];
        // TODO: EventMetadataDefinitionSchema is not exported from @aztec/circuit-types, so we can't use it here
        const serialized = atob(
          JSON.stringify({
            event: {
              eventSelector: event.eventSelector.toString(),
              abiType: AbiTypeSchema.parse(event.abiType),
              fieldNames: event.fieldNames,
            },
            from,
            limit,
            vpks: vpks?.map((p) => p.toString()),
          }),
        );
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const { event: serializedEvent, from, limit, vpks } = JSON.parse(atob(data.serialized));
      const event: EventMetadataDefinition = {
        eventSelector: EventSelector.fromString(serializedEvent.eventSelector),
        abiType: AbiTypeSchema.parse(serializedEvent.abiType),
        fieldNames: serializedEvent.fieldNames,
      };
      return {
        event,
        from,
        limit,
        vpks: vpks?.map((p: string) => Point.fromString(p)),
      } as P;
    }
    case 'aztec_getUnencryptedEvents': {
      if (serialize) {
        const { event, from, limit } = value as AztecWalletMethodMap['aztec_getUnencryptedEvents']['params'];
        const serialized = atob(
          JSON.stringify({
            event: {
              eventSelector: event.eventSelector.toString(),
              abiType: AbiTypeSchema.parse(event.abiType),
              fieldNames: event.fieldNames,
            },
            from,
            limit,
          }),
        );
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const { event: serializedEvent, from, limit, vpks } = JSON.parse(atob(data.serialized));
      const event: EventMetadataDefinition = {
        eventSelector: EventSelector.fromString(serializedEvent.eventSelector),
        abiType: AbiTypeSchema.parse(serializedEvent.abiType),
        fieldNames: serializedEvent.fieldNames,
      };
      return {
        event,
        from,
        limit,
      } as P;
    }
    default:
      console.debug(`No serializer used for method: ${method}, value: ${String(value)}`);
      return value as P;
  }
}

/**
 * Serializes/deserializes RPC method results.
 * Handles conversion between native types and network-safe formats.
 *
 * @param method - RPC method name
 * @param value - Value to convert (result or serialized data)
 * @param serialize - True to serialize, false to deserialize
 * @returns Converted value
 */
export function resultSerde<M extends keyof AztecWalletMethodMap, R = AztecWalletMethodMap[M]['result']>(
  method: M,
  value: R | JSONRPCSerializedData,
  serialize: boolean,
): JSONRPCSerializedData | R {
  switch (method) {
    case 'aztec_getBlock': {
      if (serialize) {
        const block = value as AztecWalletMethodMap['aztec_getBlock']['result'];
        const serialized = atob(block.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const block = L2Block.fromString(atob(data.serialized));
      return block as R;
    }
    case 'aztec_getNodeInfo': {
      if (serialize) {
        const nodeInfo = value as AztecWalletMethodMap['aztec_getNodeInfo']['result'];
        const serialized = atob(JSON.stringify(NodeInfoSchema.parse(nodeInfo)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const nodeInfo = NodeInfoSchema.parse(JSON.parse(atob(data.serialized)));
      return nodeInfo as R;
    }
    case 'aztec_getPXEInfo': {
      if (serialize) {
        const pxeInfo = value as AztecWalletMethodMap['aztec_getPXEInfo']['result'];
        // TODO: PXEInfoSchema in @aztec/circuit-types is not exported, so we can't use it here
        const { pxeVersion, protocolContractAddresses } = pxeInfo;

        const serialized = atob(
          JSON.stringify({
            pxeVersion,
            protocolContractAddresses: ProtocolContractAddressesSchema.parse(protocolContractAddresses),
          }),
        );
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const { pxeVersion, protocolContractAddresses } = JSON.parse(atob(data.serialized));
      const pxeInfo: PXEInfo = {
        pxeVersion,
        protocolContractAddresses: ProtocolContractAddressesSchema.parse(protocolContractAddresses),
      };
      return pxeInfo as R;
    }
    case 'aztec_getCurrentBaseFees': {
      if (serialize) {
        const gasFees = value as AztecWalletMethodMap['aztec_getCurrentBaseFees']['result'];
        const serialized = atob(JSON.stringify(GasFees.schema.parse(gasFees)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const gasFees = GasFees.schema.parse(JSON.parse(btoa(data.serialized)));
      return gasFees as R;
    }
    case 'aztec_getScopes': {
      if (serialize) {
        const scopes = value as AztecWalletMethodMap['aztec_getScopes']['result'];
        const serialized = atob(JSON.stringify(scopes.map((s) => s.toString())));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const scopes = JSON.parse(atob(data.serialized)).map((s: string) => AztecAddress.fromString(s));
      return scopes as R;
    }
    //   aztec_getL1ToL2MembershipWitness: { params: { contractAddress: AztecAddress, messageHash: Fr, secret: Fr }; result: [bigint, SiblingPath<typeof L1_TO_L2_MSG_TREE_HEIGHT>] };
    case 'aztec_getL1ToL2MembershipWitness': {
      if (serialize) {
        const [membership, path] =
          value as AztecWalletMethodMap['aztec_getL1ToL2MembershipWitness']['result'];
        const serialized = atob(JSON.stringify([membership.toString(), path.toString()]));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const [membership, path] = JSON.parse(atob(data.serialized));
      return [BigInt(membership), SiblingPath.fromString(path)] as R;
    }
    case 'aztec_getAddress': {
      if (serialize) {
        const address = value as AztecWalletMethodMap['aztec_getAddress']['result'];
        const serialized = atob(address.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const address = AztecAddress.fromString(atob(data.serialized));
      return address as R;
    }
    case 'aztec_getCompleteAddress': {
      if (serialize) {
        const completeAddress = value as AztecWalletMethodMap['aztec_getCompleteAddress']['result'];
        const serialized = atob(completeAddress.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const completeAddress = CompleteAddress.fromString(atob(data.serialized));
      return completeAddress as R;
    }
    case 'aztec_registerAccount': {
      if (serialize) {
        const completeAddress = value as AztecWalletMethodMap['aztec_registerAccount']['result'];
        const serialized = atob(completeAddress.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const completeAddress = CompleteAddress.fromString(atob(data.serialized));
      return completeAddress as R;
    }
    case 'aztec_getRegisteredAccounts': {
      if (serialize) {
        const accounts = value as AztecWalletMethodMap['aztec_getRegisteredAccounts']['result'];
        const serialized = atob(JSON.stringify(accounts.map((a) => a.toString())));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const accounts = JSON.parse(atob(data.serialized)).map((a: string) => CompleteAddress.fromString(a));
      return accounts as R;
    }
    case 'aztec_getAuthWitness': {
      if (serialize) {
        const authWitness = value as AztecWalletMethodMap['aztec_getAuthWitness']['result'];
        const serialized = atob(authWitness.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const authWitness = JSON.parse(atob(data.serialized)).map((w: string) => Fr.fromHexString(w));
      return authWitness as R;
    }
    case 'aztec_createAuthWit': {
      if (serialize) {
        const authWitness = value as AztecWalletMethodMap['aztec_createAuthWit']['result'];
        const serialized = atob(authWitness.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const authWitness = AuthWitness.fromString(atob(data.serialized));
      return authWitness as R;
    }
    case 'aztec_registerSender': {
      if (serialize) {
        const success = value as AztecWalletMethodMap['aztec_registerSender']['result'];
        const serialized = atob(success.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const success = JSON.parse(atob(data.serialized));
      return success as R;
    }
    case 'aztec_getSenders': {
      if (serialize) {
        const senders = value as AztecWalletMethodMap['aztec_getSenders']['result'];
        const serialized = atob(JSON.stringify(senders.map((s) => s.toString())));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const senders = JSON.parse(atob(data.serialized)).map((s: string) => AztecAddress.fromString(s));
      return senders as R;
    }
    case 'aztec_getContracts': {
      if (serialize) {
        const contracts = value as AztecWalletMethodMap['aztec_getContracts']['result'];
        const serialized = atob(JSON.stringify(contracts.map((c) => c.toString())));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const contracts = JSON.parse(atob(data.serialized)).map((c: string) => AztecAddress.fromString(c));
      return contracts as R;
    }
    case 'aztec_getContractInstance': {
      if (serialize) {
        const instance = value as AztecWalletMethodMap['aztec_getContractInstance']['result'];
        const serialized = atob(JSON.stringify(ContractInstanceWithAddressSchema.parse(instance)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const instance = ContractInstanceWithAddressSchema.parse(atob(data.serialized));
      return instance as R;
    }
    case 'aztec_getContractClass': {
      if (serialize) {
        const contractClass = value as AztecWalletMethodMap['aztec_getContractClass']['result'];
        const serialized = atob(JSON.stringify(ContractClassWithIdSchema.parse(contractClass)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const contractClass = ContractClassWithIdSchema.parse(atob(data.serialized));
      return contractClass as R;
    }
    case 'aztec_getContractArtifact': {
      if (serialize) {
        const contractArtifact = value as AztecWalletMethodMap['aztec_getContractArtifact']['result'];
        const serialized = atob(JSON.stringify(ContractArtifactSchema.parse(contractArtifact)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const contractArtifact = ContractArtifactSchema.parse(atob(data.serialized));
      return contractArtifact as R;
    }
    case 'aztec_getPublicStorageAt': {
      if (serialize) {
        const storage = value as AztecWalletMethodMap['aztec_getPublicStorageAt']['result'];
        // TODO: the return value from `BaseWallet.getPublicStorageAt()` is typed as `any`, but should we treat it as a `Fr`?
        const serialized = atob(JSON.stringify(storage));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const storage = JSON.parse(atob(data.serialized));
      return storage as R;
    }
    case 'aztec_createTxExecutionRequest': {
      if (serialize) {
        const request = value as AztecWalletMethodMap['aztec_createTxExecutionRequest']['result'];
        const serialized = atob(request.toString());
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const request = TxExecutionRequest.fromString(atob(data.serialized));
      return request as R;
    }
    case 'aztec_proveTx': {
      if (serialize) {
        const txProvingResult = value as AztecWalletMethodMap['aztec_proveTx']['result'];
        const serialized = atob(JSON.stringify(TxProvingResult.schema.parse(txProvingResult)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const tx = TxProvingResult.schema.parse(JSON.parse(atob(data.serialized)));
      return tx as R;
    }
    case 'aztec_getTxEffect': {
      if (serialize) {
        const txEffect = value as AztecWalletMethodMap['aztec_getTxEffect']['result'];
        const serialized = atob(JSON.stringify(TxEffect.schema.parse(txEffect)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const txEffect = inBlockSchemaFor(TxEffect.schema).parse(JSON.parse(atob(data.serialized)));
      return txEffect as R;
    }
    case 'aztec_getTxReceipt': {
      if (serialize) {
        const txReceipt = value as AztecWalletMethodMap['aztec_getTxReceipt']['result'];
        const serialized = atob(JSON.stringify(TxReceipt.schema.parse(txReceipt)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const txReceipt = TxReceipt.schema.parse(JSON.parse(atob(data.serialized)));
      return txReceipt as R;
    }
    case 'aztec_simulateTx': {
      if (serialize) {
        const txSimulationResult = value as AztecWalletMethodMap['aztec_simulateTx']['result'];
        const serialized = atob(JSON.stringify(TxSimulationResult.schema.parse(txSimulationResult)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const tx = TxSimulationResult.schema.parse(JSON.parse(atob(data.serialized)));
      return tx as R;
    }
    case 'aztec_simulateUnconstrained': {
      if (serialize) {
        const abiDecoded = value as AztecWalletMethodMap['aztec_simulateUnconstrained']['result'];
        const serialized = atob(JSON.stringify(AbiDecodedSchema.parse(abiDecoded)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const abiDecoded = AbiDecodedSchema.parse(JSON.parse(atob(data.serialized)));
      return abiDecoded as R;
    }
    case 'aztec_getIncomingNotes': {
      if (serialize) {
        const notes = value as AztecWalletMethodMap['aztec_getIncomingNotes']['result'];
        const serialized = atob(JSON.stringify(notes.map((n) => n.toString())));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const notes: UniqueNote[] = JSON.parse(atob(data.serialized)).map((n: string) =>
        UniqueNote.fromString(n),
      );
      return notes as R;
    }
    case 'aztec_getUnencryptedLogs': {
      if (serialize) {
        const logs = value as AztecWalletMethodMap['aztec_getUnencryptedLogs']['result'];
        const serialized = atob(JSON.stringify(GetUnencryptedLogsResponseSchema.parse(logs)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const logs = GetUnencryptedLogsResponseSchema.parse(JSON.parse(atob(data.serialized)));
      return logs as R;
    }
    case 'aztec_getContractClassLogs': {
      if (serialize) {
        const logs = value as AztecWalletMethodMap['aztec_getContractClassLogs']['result'];
        const serialized = atob(JSON.stringify(GetUnencryptedLogsResponseSchema.parse(logs)));
        const result: JSONRPCSerializedData = { method, serialized };
        return result;
      }
      const data = value as JSONRPCSerializedData;
      const logs = GetUnencryptedLogsResponseSchema.parse(JSON.parse(atob(data.serialized)));
      return logs as R;
    }
    case 'aztec_getEncryptedEvents':
    case 'aztec_getUnencryptedEvents':
      // TODO: figure out how to handle the return values.
      // The return type is `uknown[]` in the method map, and a generic
      // `getEncryptedEvents<T>(): Promise<T[]>` in the `BaseWallet` class.
      return value as R;

    default:
      console.debug(`No deserializer used for method: ${method}, value: ${String(value)}`);
      return value as R;
  }
}

/**
 * Main serializer for Aztec wallet RPC communication.
 * Provides parameter and result serialization/deserialization.
 *
 * Uses method-specific handlers for complex types and falls back
 * to JSON serialization for simple types.
 */
export const AztecWalletSerializer: JSONRPCSerializer<unknown, unknown> = {
  params: {
    serialize: (method, params) => paramsSerde(method, params, true) as JSONRPCSerializedData,
    deserialize: (method, data) => paramsSerde(method, data, false),
  },
  result: {
    serialize: (method, result) => resultSerde(method, result, true) as JSONRPCSerializedData,
    deserialize: (method, data) => resultSerde(method, data, false),
  },
};
