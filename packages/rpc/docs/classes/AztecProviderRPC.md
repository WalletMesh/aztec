[**@walletmesh/aztec-rpc v0.0.4**](../README.md)

***

[@walletmesh/aztec-rpc](../globals.md) / AztecProviderRPC

# Class: AztecProviderRPC

Provides an interface to interact with the Aztec Wallet over JSON-RPC.

## Constructors

### new AztecProviderRPC()

> **new AztecProviderRPC**(`sendRequest`): [`AztecProviderRPC`](AztecProviderRPC.md)

Creates a new AztecProviderRPC instance.

#### Parameters

##### sendRequest

(`request`) => `void`

A function to send JSON-RPC requests.

#### Returns

[`AztecProviderRPC`](AztecProviderRPC.md)

#### Defined in

[packages/rpc/src/provider.ts:17](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L17)

## Methods

### connect()

> **connect**(): `Promise`\<`boolean`\>

Connects to the Aztec network.

#### Returns

`Promise`\<`boolean`\>

A boolean indicating the connection status.

#### Defined in

[packages/rpc/src/provider.ts:25](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L25)

***

### getAccount()

> **getAccount**(): `Promise`\<`string`\>

Retrieves the account address from the wallet.

#### Returns

`Promise`\<`string`\>

The account address as a string.

#### Defined in

[packages/rpc/src/provider.ts:33](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L33)

***

### receiveResponse()

> **receiveResponse**(`response`): `void`

Receives a JSON-RPC response and processes it.

#### Parameters

##### response

`JSONRPCResponse`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\>

The JSON-RPC response to process.

#### Returns

`void`

#### Defined in

[packages/rpc/src/provider.ts:75](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L75)

***

### registerContact()

> **registerContact**(`contact`): `Promise`\<`boolean`\>

Registers a contact in the user's PXE.

#### Parameters

##### contact

`string`

The contact to register.

#### Returns

`Promise`\<`boolean`\>

A boolean indicating the registration status.

#### Defined in

[packages/rpc/src/provider.ts:86](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L86)

***

### registerContract()

> **registerContract**(`contractArtifact`, `contractAddress`): `Promise`\<`boolean`\>

Registers a contract in the user's PXE.

#### Parameters

##### contractArtifact

`ContractArtifact`

The contract artifact.

##### contractAddress

`string`

The contract address.

#### Returns

`Promise`\<`boolean`\>

A boolean indicating the registration status.

#### Defined in

[packages/rpc/src/provider.ts:96](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L96)

***

### sendTransaction()

> **sendTransaction**(`contractAddress`, `functionAbi`, `args`): `Promise`\<`string`\>

Sends a transaction to the Aztec network.

#### Parameters

##### contractAddress

`string`

The contract address.

##### functionAbi

`FunctionAbi`

The function ABI.

##### args

`unknown`[]

The arguments for the function.

#### Returns

`Promise`\<`string`\>

The transaction hash as a string.

#### Defined in

[packages/rpc/src/provider.ts:44](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L44)

***

### simulateTransaction()

> **simulateTransaction**(`contractAddress`, `functionAbi`, `args`): `Promise`\<`unknown`\>

Simulates a transaction on the Aztec network.

#### Parameters

##### contractAddress

`string`

The contract address.

##### functionAbi

`FunctionAbi`

The function ABI.

##### args

`unknown`[]

The arguments for the function.

#### Returns

`Promise`\<`unknown`\>

The result of the transaction simulation.

#### Defined in

[packages/rpc/src/provider.ts:59](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/provider.ts#L59)
