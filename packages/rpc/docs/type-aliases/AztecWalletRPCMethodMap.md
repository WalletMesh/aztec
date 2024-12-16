[**@walletmesh/aztec-rpc v0.0.8**](../README.md)

***

[@walletmesh/aztec-rpc](../globals.md) / AztecWalletRPCMethodMap

# Type Alias: AztecWalletRPCMethodMap

> **AztecWalletRPCMethodMap**: `object`

A mapping of JSON-RPC methods to their parameters and return types for Aztec Wallets.

## Type declaration

### aztec\_connect

> **aztec\_connect**: `object`

Connects to the Aztec network.

#### Returns

A boolean indicating if the connection was successful

#### aztec\_connect.result

> **result**: `boolean`

### aztec\_getAccount

> **aztec\_getAccount**: `object`

Gets the account address from the wallet.

#### Returns

The account address as a string

#### aztec\_getAccount.result

> **result**: `string`

### aztec\_registerContact

> **aztec\_registerContact**: `object`

Registers a contact in the user's PXE

#### Param

The contact address to register

#### Returns

True if registration was successful

#### aztec\_registerContact.params

> **params**: `object`

#### aztec\_registerContact.params.contact

> **contact**: `string`

#### aztec\_registerContact.result

> **result**: `boolean`

### aztec\_registerContract

> **aztec\_registerContract**: `object`

Registers a contract instance in the user's PXE.

#### Param

The contract details to register

#### Returns

True if registration was successful

#### aztec\_registerContract.params

> **params**: `object`

#### aztec\_registerContract.params.contractAddress

> **contractAddress**: `string`

#### aztec\_registerContract.params.contractArtifact?

> `optional` **contractArtifact**: `ContractArtifact`

#### aztec\_registerContract.params.contractInstance

> **contractInstance**: `ContractInstance`

#### aztec\_registerContract.result

> **result**: `boolean`

### aztec\_registerContractClass

> **aztec\_registerContractClass**: `object`

Registers a contract class in the user's PXE.

#### Param

The contract artifact to register

#### Returns

True if registration was successful

#### aztec\_registerContractClass.params

> **params**: `object`

#### aztec\_registerContractClass.params.contractArtifact

> **contractArtifact**: `ContractArtifact`

#### aztec\_registerContractClass.result

> **result**: `boolean`

### aztec\_sendTransaction

> **aztec\_sendTransaction**: `object`

Sends transactions to the Aztec network.

#### Param

The transactions to execute and optional authorization witnesses

#### Returns

The transaction hash as a string

#### aztec\_sendTransaction.params

> **params**: [`TransactionParams`](TransactionParams.md)

#### aztec\_sendTransaction.result

> **result**: `string`

### aztec\_simulateTransaction

> **aztec\_simulateTransaction**: `object`

Simulates a transaction without executing it.

#### Param

The transaction to simulate

#### Returns

The simulation result

#### aztec\_simulateTransaction.params

> **params**: [`TransactionFunctionCall`](TransactionFunctionCall.md)

#### aztec\_simulateTransaction.result

> **result**: `unknown`

## Defined in

[packages/rpc/src/types.ts:33](https://github.com/WalletMesh/aztec/blob/d8d2f2cdd3d6049cb75dc7c911ba6918ba4c3225/packages/rpc/src/types.ts#L33)
