[**@walletmesh/aztec-rpc v0.0.5**](../README.md)

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

Sends one or more transactions to the Aztec network.

#### Param

A single transaction or an array of transactions.

#### Returns

The transaction hash as a string.

#### aztec\_sendTransaction.params

> **params**: [`TransactionParams`](TransactionParams.md) \| [`TransactionParams`](TransactionParams.md)[]

#### aztec\_sendTransaction.result

> **result**: `string`

### aztec\_simulateTransaction

> **aztec\_simulateTransaction**: `object`

Simulates a transaction on the Aztec network.

#### aztec\_simulateTransaction.params

> **params**: [`TransactionParams`](TransactionParams.md)

#### aztec\_simulateTransaction.result

> **result**: `unknown`

## Defined in

[packages/rpc/src/types.ts:17](https://github.com/WalletMesh/aztec/blob/9ad34955244cc5304cb566146299029ce93f71a9/packages/rpc/src/types.ts#L17)
