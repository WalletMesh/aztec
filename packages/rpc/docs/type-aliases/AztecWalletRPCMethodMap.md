[**@walletmesh/aztec-rpc v0.0.4**](../README.md)

***

[@walletmesh/aztec-rpc](../globals.md) / AztecWalletRPCMethodMap

# Type Alias: AztecWalletRPCMethodMap

> **AztecWalletRPCMethodMap**: `object`

A mapping of JSON-RPC methods to their parameters and return types for Aztec Wallets.

## Type declaration

### aztec\_connect

> **aztec\_connect**: `object`

Connects to the Aztec network.

#### aztec\_connect.params

> **params**: `null`

#### aztec\_connect.result

> **result**: `boolean`

### aztec\_getAccount

> **aztec\_getAccount**: `object`

Retrieves the account address.

#### aztec\_getAccount.params

> **params**: `null`

#### aztec\_getAccount.result

> **result**: `string`

### aztec\_registerContact

> **aztec\_registerContact**: `object`

Registers a contact in the user's PXE.

#### aztec\_registerContact.params

> **params**: `object`

#### aztec\_registerContact.params.contact

> **contact**: `string`

#### aztec\_registerContact.result

> **result**: `boolean`

### aztec\_registerContract

> **aztec\_registerContract**: `object`

Registers a contract in the user's PXE.

#### aztec\_registerContract.params

> **params**: `object`

#### aztec\_registerContract.params.contractAddress

> **contractAddress**: `string`

#### aztec\_registerContract.params.contractArtifact

> **contractArtifact**: `ContractArtifact`

#### aztec\_registerContract.result

> **result**: `boolean`

### aztec\_sendTransaction

> **aztec\_sendTransaction**: `object`

Sends a transaction to the Aztec network.

#### aztec\_sendTransaction.params

> **params**: `object`

#### aztec\_sendTransaction.params.args

> **args**: `unknown`[]

#### aztec\_sendTransaction.params.contractAddress

> **contractAddress**: `string`

#### aztec\_sendTransaction.params.functionAbi

> **functionAbi**: `FunctionAbi`

#### aztec\_sendTransaction.result

> **result**: `string`

### aztec\_simulateTransaction

> **aztec\_simulateTransaction**: `object`

Simulates a transaction on the Aztec network.

#### aztec\_simulateTransaction.params

> **params**: `object`

#### aztec\_simulateTransaction.params.args

> **args**: `unknown`[]

#### aztec\_simulateTransaction.params.contractAddress

> **contractAddress**: `string`

#### aztec\_simulateTransaction.params.functionAbi

> **functionAbi**: `FunctionAbi`

#### aztec\_simulateTransaction.result

> **result**: `unknown`

## Defined in

[packages/rpc/src/types.ts:6](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/types.ts#L6)
