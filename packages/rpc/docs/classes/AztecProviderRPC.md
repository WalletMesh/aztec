[**@walletmesh/aztec-rpc v0.0.7**](../README.md)

***

[@walletmesh/aztec-rpc](../globals.md) / AztecProviderRPC

# Class: AztecProviderRPC

Client-side provider for interacting with an Aztec Wallet through JSON-RPC.

## Extends

- `JSONRPCClient`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\>

## Constructors

### new AztecProviderRPC()

> **new AztecProviderRPC**(`sendRequest`): [`AztecProviderRPC`](AztecProviderRPC.md)

Creates a new AztecProviderRPC instance

#### Parameters

##### sendRequest

(`request`) => `Promise`\<`unknown`\>

Function to send JSON-RPC requests

#### Returns

[`AztecProviderRPC`](AztecProviderRPC.md)

#### Overrides

`JSONRPCClient<AztecWalletRPCMethodMap>.constructor`

#### Defined in

[packages/rpc/src/provider.ts:19](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L19)

## Methods

### callMethod()

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"result"`\]\>

Calls a method on the JSON-RPC server.

#### Type Parameters

• **M** *extends* keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)

The method name.

#### Parameters

##### method

`M`

The method name to call.

##### params?

[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"params"`\]

Optional parameters to pass to the method.

##### timeoutInSeconds?

`number`

Timeout in seconds (0 means no timeout, default is 0).

#### Returns

`Promise`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"result"`\]\>

A Promise that resolves with the result or rejects with an error.

#### Inherited from

`JSONRPCClient.callMethod`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/client.d.ts:38

***

### connect()

> **connect**(): `Promise`\<`boolean`\>

Connects to the Aztec network.

#### Returns

`Promise`\<`boolean`\>

True if connection successful

#### Defined in

[packages/rpc/src/provider.ts:41](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L41)

***

### getAccount()

> **getAccount**(): `Promise`\<`string`\>

Retrieves the account address from the wallet.

#### Returns

`Promise`\<`string`\>

The account address as a string

#### Defined in

[packages/rpc/src/provider.ts:49](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L49)

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `void`

Sends a notification to the JSON-RPC server (no response expected).

#### Type Parameters

• **M** *extends* keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)

The method name.

#### Parameters

##### method

`M`

The method name to notify.

##### params

[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"params"`\]

Parameters to pass to the method.

#### Returns

`void`

#### Inherited from

`JSONRPCClient.notify`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/client.d.ts:46

***

### receiveResponse()

> **receiveResponse**(`response`): `void`

Handles incoming JSON-RPC responses.

#### Parameters

##### response

`JSONRPCResponse`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\>

The JSON-RPC response object.

#### Returns

`void`

#### Inherited from

`JSONRPCClient.receiveResponse`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/client.d.ts:52

***

### registerContact()

> **registerContact**(`contact`): `Promise`\<`boolean`\>

Registers a contact in the user's PXE.

#### Parameters

##### contact

`string`

The contact to register

#### Returns

`Promise`\<`boolean`\>

True if registration successful

#### Defined in

[packages/rpc/src/provider.ts:76](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L76)

***

### registerContract()

> **registerContract**(`contractAddress`, `contractInstance`, `contractArtifact`?): `Promise`\<`boolean`\>

Registers a contract in the user's PXE.

#### Parameters

##### contractAddress

`string`

The contract address

##### contractInstance

`ContractInstance`

The contract instance

##### contractArtifact?

`ContractArtifact`

Optional contract artifact

#### Returns

`Promise`\<`boolean`\>

True if registration successful

#### Defined in

[packages/rpc/src/provider.ts:87](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L87)

***

### registerContractClass()

> **registerContractClass**(`contractArtifact`): `Promise`\<`boolean`\>

Registers a contract class in the user's PXE.

#### Parameters

##### contractArtifact

`ContractArtifact`

The contract artifact

#### Returns

`Promise`\<`boolean`\>

True if registration successful

#### Defined in

[packages/rpc/src/provider.ts:104](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L104)

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Registers serializer for a method.

#### Type Parameters

• **M** *extends* keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)

#### Parameters

##### method

`M`

##### serializer

`JSONRPCSerializer`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"params"`\], [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`JSONRPCClient.registerSerializer`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/client.d.ts:28

***

### sendTransaction()

> **sendTransaction**(`params`): `Promise`\<`string`\>

Sends one or more transactions to the Aztec network.

#### Parameters

##### params

[`TransactionParams`](../type-aliases/TransactionParams.md)

The transactions to send and optional authorization witnesses

#### Returns

`Promise`\<`string`\>

The transaction hash as a string

#### Defined in

[packages/rpc/src/provider.ts:58](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L58)

***

### simulateTransaction()

> **simulateTransaction**(`params`): `Promise`\<`unknown`\>

Simulates a transaction on the Aztec network.

#### Parameters

##### params

[`TransactionFunctionCall`](../type-aliases/TransactionFunctionCall.md)

The transaction function call to simulate

#### Returns

`Promise`\<`unknown`\>

The result of the transaction simulation

#### Defined in

[packages/rpc/src/provider.ts:67](https://github.com/WalletMesh/aztec/blob/373b9ce85d8692237c6f741e27593ac2753f00a5/packages/rpc/src/provider.ts#L67)
