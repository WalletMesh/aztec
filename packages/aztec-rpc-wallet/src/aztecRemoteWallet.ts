import type {
  AuthWitness,
  AztecAddress,
  ContractArtifact,
  ContractClassWithId,
  ContractInstanceWithAddress,
  ExtendedNote,
  TxExecutionRequest,
  TxHash,
  TxReceipt,
  L2Block,
  LogFilter,
  Point,
  SiblingPath,
  PartialAddress,
  CompleteAddress,
  NodeInfo,
  Tx,
  Wallet,
} from '@aztec/aztec.js';

import type { IntentAction, IntentInnerHash } from '@aztec/aztec.js/utils';
import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';
import type { AbiDecoded } from '@aztec/foundation/abi';
import type {
  IncomingNotesFilter,
  EventMetadataDefinition,
  PrivateExecutionResult,
  TxProvingResult,
  UniqueNote,
  GetUnencryptedLogsResponse,
  PXEInfo,
  TxSimulationResult,
  InBlock,
  TxEffect,
} from '@aztec/circuit-types';
import type { GasFees, L1_TO_L2_MSG_TREE_HEIGHT } from '@aztec/circuits.js';

import { Fr } from '@aztec/aztec.js';

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { AztecProvider } from './provider.js';
import type { AztecChainId } from './types.js';

export class AztecRemoteWallet implements Wallet {
  private _address: AztecAddress | undefined;
  private _completeAddress: CompleteAddress | undefined;
  private _chainId: Fr | undefined;
  private _version: Fr | undefined;
  private _scopes: AztecAddress[] | undefined;

  constructor(
    private _provider: AztecProvider,
    private _providerChainId: AztecChainId,
  ) {}

  async isL1ToL2MessageSynced(l1ToL2Message: Fr): Promise<boolean> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_isL1ToL2MessageSynced', { l1ToL2Message })
      .execute();
  }

  getAddress(): AztecAddress {
    if (!this._address) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getAddress')
        .execute()
        .then(async (addr) => {
          this._address = addr;
        });
      throw new Error('Address not yet available');
    }
    return this._address;
  }

  getCompleteAddress() {
    if (!this._completeAddress) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getCompleteAddress')
        .execute()
        .then(async (addr) => {
          this._completeAddress = addr;
        });
      throw new Error('Complete address not yet available');
    }
    return this._completeAddress;
  }

  getChainId(): Fr {
    if (!this._chainId) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getChainId')
        .execute()
        .then(async (chainId) => {
          this._chainId = Fr.fromString(chainId.toString(10));
        });
      throw new Error('Chain ID not yet available');
    }
    return this._chainId;
  }

  getVersion(): Fr {
    if (!this._version) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getVersion')
        .execute()
        .then(async (version) => {
          this._version = Fr.fromString(version.toString(10));
        });
      throw new Error('Version not yet available');
    }
    return this._version;
  }

  async createTxExecutionRequest(exec: ExecutionRequestInit): Promise<TxExecutionRequest> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_createTxExecutionRequest', { exec })
      .execute();
  }

  async createAuthWit(intent: Fr | Buffer | IntentAction | IntentInnerHash): Promise<AuthWitness> {
    return this._provider.chain(this._providerChainId).call('aztec_createAuthWit', { intent }).execute();
  }

  setScopes(scopes: AztecAddress[]): void {
    this._scopes = scopes;
    // TODO: return promise
    this._provider
      .chain(this._providerChainId)
      .call('aztec_setScopes', { scopes })
      .execute()
      .then((result) => {
        console.log(`setScopes(${scopes}) result: ${result}`);
      });
  }

  getScopes(): AztecAddress[] {
    if (!this._scopes) {
      this._provider
        .chain(this._providerChainId)
        .call('aztec_getScopes')
        .execute()
        .then(async (scopes) => {
          this._scopes = scopes;
        });
      throw new Error('Scopes not yet available');
    }
    return this._scopes;
  }

  async getScopesAsync(): Promise<AztecAddress[]> {
    const scopes = await this._provider.chain(this._providerChainId).call('aztec_getScopes').execute();
    this._scopes = scopes;
    return scopes;
  }

  async getContractInstance(address: AztecAddress): Promise<ContractInstanceWithAddress | undefined> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getContractInstance', { address })
      .execute();
  }

  async getContractClass(id: Fr): Promise<ContractClassWithId | undefined> {
    return this._provider.chain(this._providerChainId).call('aztec_getContractClass', { id }).execute();
  }

  async getContractArtifact(id: Fr): Promise<ContractArtifact | undefined> {
    return this._provider.chain(this._providerChainId).call('aztec_getContractArtifact', { id }).execute();
  }

  async addCapsule(capsule: Fr[]): Promise<void> {
    await this._provider.chain(this._providerChainId).call('aztec_addCapsule', { capsule }).execute();
  }

  async registerAccount(secretKey: Fr, partialAddress: PartialAddress): Promise<CompleteAddress> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_registerAccount', { secretKey, partialAddress })
      .execute();
  }

  async getRegisteredAccounts(): Promise<CompleteAddress[]> {
    return this._provider.chain(this._providerChainId).call('aztec_getRegisteredAccounts').execute();
  }

  async registerSender(address: AztecAddress): Promise<AztecAddress> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_registerSender', { sender: address })
      .execute();
  }

  async getSenders(): Promise<AztecAddress[]> {
    return this._provider.chain(this._providerChainId).call('aztec_getSenders').execute();
  }

  async removeSender(address: AztecAddress): Promise<void> {
    await this._provider
      .chain(this._providerChainId)
      .call('aztec_removeSender', { sender: address })
      .execute();
  }

  async registerContract(contract: {
    instance: ContractInstanceWithAddress;
    artifact?: ContractArtifact;
  }): Promise<void> {
    await this._provider
      .chain(this._providerChainId)
      .call('aztec_registerContract', { instance: contract.instance, artifact: contract.artifact })
      .execute();
  }

  async registerContractClass(artifact: ContractArtifact): Promise<void> {
    await this._provider
      .chain(this._providerChainId)
      .call('aztec_registerContractClass', { artifact })
      .execute();
  }

  async getContracts(): Promise<AztecAddress[]> {
    return this._provider.chain(this._providerChainId).call('aztec_getContracts').execute();
  }

  async proveTx(
    txRequest: TxExecutionRequest,
    privateExecutionResult: PrivateExecutionResult,
  ): Promise<TxProvingResult> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_proveTx', { txRequest, privateExecutionResult })
      .execute();
  }

  async simulateTx(
    txRequest: TxExecutionRequest,
    simulatePublic: boolean,
    msgSender?: AztecAddress,
    skipTxValidation?: boolean,
    enforceFeePayment?: boolean,
    profile?: boolean,
  ): Promise<TxSimulationResult> {
    const scopes = await this.getScopesAsync();
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_simulateTx', {
        txRequest,
        simulatePublic,
        msgSender,
        skipTxValidation,
        enforceFeePayment,
        profile,
      })
      .execute();
  }

  async sendTx(tx: Tx): Promise<TxHash> {
    const result = await this._provider.chain(this._providerChainId).call('aztec_sendTx', { tx }).execute();
    return result as TxHash;
  }

  async getTxEffect(txHash: TxHash): Promise<InBlock<TxEffect>> {
    return this._provider.chain(this._providerChainId).call('aztec_getTxEffect', { txHash }).execute();
  }

  async getTxReceipt(txHash: TxHash): Promise<TxReceipt> {
    return this._provider.chain(this._providerChainId).call('aztec_getTxReceipt', { txHash }).execute();
  }

  async getIncomingNotes(filter: IncomingNotesFilter): Promise<UniqueNote[]> {
    return this._provider.chain(this._providerChainId).call('aztec_getIncomingNotes', { filter }).execute();
  }

  async getPublicStorageAt(contract: AztecAddress, storageSlot: Fr): Promise<Fr> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getPublicStorageAt', { contract, storageSlot })
      .execute();
  }

  async addNote(note: ExtendedNote): Promise<void> {
    await this._provider.chain(this._providerChainId).call('aztec_addNote', { note }).execute();
  }

  async addNullifiedNote(note: ExtendedNote): Promise<void> {
    await this._provider.chain(this._providerChainId).call('aztec_addNullifiedNote', { note }).execute();
  }

  async getBlock(number: number): Promise<L2Block | undefined> {
    return this._provider.chain(this._providerChainId).call('aztec_getBlock', { number }).execute();
  }

  async getCurrentBaseFees(): Promise<GasFees> {
    return this._provider.chain(this._providerChainId).call('aztec_getCurrentBaseFees').execute();
  }

  async simulateUnconstrained(
    functionName: string,
    args: unknown[],
    to: AztecAddress,
    from?: AztecAddress,
  ): Promise<AbiDecoded> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_simulateUnconstrained', { functionName, args, to, from })
      .execute();
  }

  async getUnencryptedLogs(filter: LogFilter): Promise<GetUnencryptedLogsResponse> {
    return this._provider.chain(this._providerChainId).call('aztec_getUnencryptedLogs', { filter }).execute();
  }

  async getContractClassLogs(filter: LogFilter): Promise<GetUnencryptedLogsResponse> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getContractClassLogs', { filter })
      .execute();
  }

  async getBlockNumber(): Promise<number> {
    return this._provider.chain(this._providerChainId).call('aztec_getBlockNumber').execute();
  }

  async getProvenBlockNumber(): Promise<number> {
    return this._provider.chain(this._providerChainId).call('aztec_getProvenBlockNumber').execute();
  }

  async getNodeInfo(): Promise<NodeInfo> {
    return this._provider.chain(this._providerChainId).call('aztec_getNodeInfo').execute();
  }

  async addAuthWitness(authWitness: AuthWitness): Promise<void> {
    await this._provider.chain(this._providerChainId).call('aztec_addAuthWitness', { authWitness }).execute();
  }

  async getAuthWitness(messageHash: Fr): Promise<Fr[]> {
    return await this._provider
      .chain(this._providerChainId)
      .call('aztec_getAuthWitness', { messageHash })
      .execute();
  }

  async isContractClassPubliclyRegistered(id: Fr): Promise<boolean> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_isContractClassPubliclyRegistered', { id })
      .execute();
  }

  async isContractPubliclyDeployed(address: AztecAddress): Promise<boolean> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_isContractPubliclyDeployed', { address })
      .execute();
  }

  async isContractInitialized(address: AztecAddress): Promise<boolean> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_isContractInitialized', { address })
      .execute();
  }

  async getPXEInfo(): Promise<PXEInfo> {
    return this._provider.chain(this._providerChainId).call('aztec_getPXEInfo').execute();
  }

  async getEncryptedEvents<T>(
    event: EventMetadataDefinition,
    from: number,
    limit: number,
    vpks: Point[] = [],
  ): Promise<T[]> {
    const address = await this.getCompleteAddress();
    const result = await this._provider
      .chain(this._providerChainId)
      .call('aztec_getEncryptedEvents', {
        event,
        from,
        limit,
        vpks: vpks.length ? vpks : [address.publicKeys.masterIncomingViewingPublicKey],
      })
      .execute();
    return result as T[];
  }

  async getUnencryptedEvents<T>(event: EventMetadataDefinition, from: number, limit: number): Promise<T[]> {
    const result = await this._provider
      .chain(this._providerChainId)
      .call('aztec_getUnencryptedEvents', { event, from, limit })
      .execute();
    return result as T[];
  }

  async getL1ToL2MembershipWitness(
    contractAddress: AztecAddress,
    messageHash: Fr,
    secret: Fr,
  ): Promise<[bigint, SiblingPath<typeof L1_TO_L2_MSG_TREE_HEIGHT>]> {
    return this._provider
      .chain(this._providerChainId)
      .call('aztec_getL1ToL2MembershipWitness', { contractAddress, messageHash, secret })
      .execute();
  }
}

export function createAztecRPCWallet(transport: JSONRPCTransport, chainId: AztecChainId): AztecRemoteWallet {
  const provider = new AztecProvider(transport);
  return new AztecRemoteWallet(provider, chainId);
}
