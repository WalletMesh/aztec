[**@walletmesh/aztec-rpc v0.0.4**](../README.md)

***

[@walletmesh/aztec-rpc](../globals.md) / AztecWalletRPC

# Class: AztecWalletRPC

JSON-RPC interface to an Aztec Wallet.

## Extends

- `JSONRPCServer`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\>

## Constructors

### new AztecWalletRPC()

> **new AztecWalletRPC**(`wallet`, `sendResponse`): [`AztecWalletRPC`](AztecWalletRPC.md)

Creates a new AztecWalletRPC instance.

#### Parameters

##### wallet

`Wallet`

The underlying Wallet instance.

##### sendResponse

(`response`) => `Promise`\<`void`\>

A function to send JSON-RPC responses.

#### Returns

[`AztecWalletRPC`](AztecWalletRPC.md)

#### Overrides

`JSONRPCServer<AztecWalletRPCMethodMap>.constructor`

#### Defined in

[packages/rpc/src/wallet.ts:23](https://github.com/WalletMesh/aztec/blob/f83c43fd0c0a959d8d62f3af87d0dfbdb5d7fecc/packages/rpc/src/wallet.ts#L23)

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the stack.

#### Parameters

##### middleware

`JSONRPCMiddleware`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\>

The middleware function to add.

#### Returns

`Function`

A function to remove the middleware from the stack.

##### Returns

`void`

#### Inherited from

`JSONRPCServer.addMiddleware`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/server.d.ts:30

***

### receiveRequest()

> **receiveRequest**(`request`): `Promise`\<`void`\>

Receives a JSON-RPC request and handles it.

#### Parameters

##### request

`JSONRPCRequest`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\>

The JSON-RPC request object.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCServer.receiveRequest`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/server.d.ts:36

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Registers a method that can be called remotely.

#### Type Parameters

• **M** *extends* keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)

#### Parameters

##### name

`M`

The method name.

##### handler

(`params`) => [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"result"`\] \| `Promise`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"result"`\]\>

The function to handle the method call.

#### Returns

`void`

#### Inherited from

`JSONRPCServer.registerMethod`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/server.d.ts:23
