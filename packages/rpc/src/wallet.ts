import {
  AuthWitness,
  AztecAddress,
  Contract,
  NoFeePaymentMethod,
  type ContractArtifact,
} from '@aztec/aztec.js';
import { GasSettings, type ContractInstance } from '@aztec/circuits.js';
import type { Wallet } from '@aztec/aztec.js';
import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';

import { JSONRPCServer } from '@walletmesh/jsonrpc';
import type { JSONRPCParams, JSONRPCRequest, JSONRPCResponse } from '@walletmesh/jsonrpc';

import type {
  AztecWalletContext,
  AztecWalletRPCMethodMap,
  TransactionFunctionCall,
  TransactionParams,
} from './types.js';
import { AztecWalletRPCError } from './errors.js';
import { registerContractSerializer, registerContractClassSerializer } from './utils.js';

/**
 * JSON-RPC interface implementation for an Aztec Wallet.
 * Handles communication between dapps and the wallet through JSON-RPC.
 * @public
 */
export class AztecWalletRPC extends JSONRPCServer<AztecWalletRPCMethodMap, AztecWalletContext> {
  private wallet: Wallet;
  private contractArtifactCache = new Map<string, ContractArtifact>();

  /**
   * Creates a new AztecWalletRPC instance.
   * @param wallet - The underlying Wallet instance
   * @param sendResponse - Function to send JSON-RPC responses
   */
  constructor(wallet: Wallet, sendResponse: (context: AztecWalletContext, request: JSONRPCRequest<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap, JSONRPCParams>, response: JSONRPCResponse<AztecWalletRPCMethodMap, keyof AztecWalletRPCMethodMap>) => Promise<void>) {
    super(sendResponse);
    this.wallet = wallet;
    this.registerMethods();
  }

  /**
   * Registers the JSON-RPC methods supported by this wallet.
   */
  private registerMethods() {
    this.registerMethod('aztec_connect', this.connect.bind(this));
    this.registerMethod('aztec_getAccount', this.getAccount.bind(this));
    this.registerMethod('aztec_sendTransaction', this.sendTransaction.bind(this));
    this.registerMethod('aztec_simulateTransaction', this.simulateTransaction.bind(this));
    this.registerMethod('aztec_registerContact', this.registerContact.bind(this));
    this.registerMethod('aztec_registerContract', this.registerContract.bind(this), {
      params: registerContractSerializer,
    });
    this.registerMethod('aztec_registerContractClass', this.registerContractClass.bind(this), {
      params: registerContractClassSerializer,
    });
  }

  /**
   * Handles the 'aztec_connect' JSON-RPC method.
   * Establishes a connection between the dapp and wallet.
   * @returns A boolean indicating if the connection was successful.
   */
  private connect(context: AztecWalletContext, params: unknown): boolean {
    return true;
  }

  /**
   * Handles the 'aztec_getAccount' JSON-RPC method.
   * Retrieves the wallet's account address.
   * @returns The account address as a string.
   */
  private getAccount(context: AztecWalletContext, params: unknown): string {
    const accountAddress = this.wallet.getAddress().toString();
    return accountAddress;
  }

  /**
   * Handles the 'aztec_sendTransaction' JSON-RPC method.
   * Sends transactions to the Aztec network and returns the transaction hash.
   * @param params - The transaction parameters
   * @param params.functionCalls - Array of function calls to execute
   * @param params.authwits - Optional array of authorization witnesses for the transaction
   * @returns A Promise that resolves to the transaction hash string
   */
  private async sendTransaction(context: AztecWalletContext, params: TransactionParams): Promise<string> {
    // Setup the execution request without the calls for now
    const executionRequestInit: ExecutionRequestInit = {
      calls: [],
      authWitnesses: params.authwits?.map(AuthWitness.fromString) ?? [],
      // TODO: Figure out what we should be doing with this fee parameter
      fee: {
        paymentMethod: new NoFeePaymentMethod(),
        gasSettings: GasSettings.default({ maxFeesPerGas: await this.wallet.getCurrentBaseFees() }),
      },
    };

    // Get artifacts and contracts first
    const contractMap = new Map<string, { contract: Contract; artifact: ContractArtifact }>();
    for (const c of params.functionCalls) {
      const contractAddress = AztecAddress.fromString(c.contractAddress);
      if (!contractMap.has(c.contractAddress)) {
        const artifact = await this.getContractArtifact(contractAddress);
        const contract = await Contract.at(contractAddress, artifact, this.wallet);
        contractMap.set(c.contractAddress, { contract, artifact });
      }
    }

    // Now build the execution request
    for (const c of params.functionCalls) {
      // biome-ignore lint/style/noNonNullAssertion: we know the contract is in the map
      const { contract } = contractMap.get(c.contractAddress)!;
      const functionCall = contract.methods[c.functionName](...c.args);
      executionRequestInit.calls.push(await functionCall.request());
    }
    const txExecutionRequest = await this.wallet.createTxExecutionRequest(executionRequestInit);
    const simulatedTx = await this.wallet.simulateTx(txExecutionRequest, true /* simulatePublic */);
    const txProvingResult = await this.wallet.proveTx(txExecutionRequest, simulatedTx.privateExecutionResult);
    const txHash = await this.wallet.sendTx(txProvingResult.toTx());
    return txHash.toString();
  }

  /**
   * Handles the 'aztec_simulateTransaction' JSON-RPC method.
   * Simulates a transaction without submitting it to the network.
   * @param params - The transaction parameters to simulate
   * @param params.contractAddress - The target contract address
   * @param params.functionName - The contract function to call
   * @param params.args - The function arguments
   * @returns A Promise that resolves to the simulation result
   */
  private async simulateTransaction(
    context: AztecWalletContext,
    params: TransactionFunctionCall,
  ): Promise<unknown> {
    const { contractAddress, functionName, args } = params;
    const addr = AztecAddress.fromString(contractAddress);
    const artifact = await this.getContractArtifact(addr);
    const contract = await Contract.at(addr, artifact, this.wallet);
    const result = await contract.methods[functionName](...args).simulate();
    return result;
  }

  /**
   * Registers a contact in the user's PXE.
   * @param params - The parameters for registering the contact.
   * @returns A boolean indicating the registration status.
   */
  private async registerContact(context: AztecWalletContext, params: { contact: string }): Promise<boolean> {
    const { contact } = params;
    try {
      const addr = AztecAddress.fromString(contact);
      await this.wallet.registerContact(addr);
      return true;
    } catch (error) {
      console.error('registerContact error:', error);
      throw new AztecWalletRPCError('contactNotRegistered', contact);
    }
  }

  /**
   * Registers a contract in the user's PXE.
   * @param params - The parameters for registering the contract.
   * @param params.contractAddress - The address of the contract to register.
   * @param params.contractInstance - The ContractInstance to register.
   * @param params.contractArtifact - Optional ContractArtifact to register. This is required if the contract class is not already registered.
   * @returns A boolean indicating the registration status.
   */
  private async registerContract(
    context: AztecWalletContext,
    params: {
      contractAddress: string;
      contractInstance: ContractInstance;
      contractArtifact?: ContractArtifact;
    },
  ): Promise<boolean> {
    const { contractAddress, contractInstance, contractArtifact } = params;

    try {
      await this.wallet.registerContract({
        // wallet.registerContract() wants a ContractInstanceWithAddress
        instance: { ...contractInstance, address: AztecAddress.fromString(contractAddress) },
        artifact: contractArtifact,
      });
      return true;
    } catch (error) {
      // TODO: does wallet.registerContract() throw if the contract is already registered?
      console.error('registerContract error:', error);
      throw new AztecWalletRPCError(
        'contractInstanceNotRegistered',
        contractInstance.contractClassId.toString(),
      );
    }
  }

  /**
   * Registers a contract class in the user's PXE.
   * @param params - The parameters for registering the contract class.
   * @param params.contractArtifact - The ContractArtifact to register.
   * @returns A boolean indicating the registration status.
   */
  private async registerContractClass(
    context: AztecWalletContext,
    params: { contractArtifact: ContractArtifact },
  ): Promise<boolean> {
    const { contractArtifact } = params;
    await this.wallet.registerContractClass(contractArtifact);
    return true;
  }

  /**
   * Retrieves the contract artifact for a given contract address.
   * @param contractAddress - The contract address to retrieve the artifact for.
   * @returns A Promise that resolves to the ContractArtifact.
   */
  private async getContractArtifact(contractAddress: AztecAddress): Promise<ContractArtifact> {
    const addressStr = contractAddress.toString();
    const cached = this.contractArtifactCache.get(addressStr);
    if (cached) {
      return cached;
    }

    const contract = await this.wallet.getContractInstance(contractAddress);
    if (!contract) {
      throw new AztecWalletRPCError('contractInstanceNotRegistered', addressStr);
    }
    const artifact = await this.wallet.getContractArtifact(contract.contractClassId);
    if (!artifact) {
      throw new AztecWalletRPCError('contractClassNotRegistered', contract.contractClassId.toString());
    }

    this.contractArtifactCache.set(addressStr, artifact);
    return artifact;
  }
}
