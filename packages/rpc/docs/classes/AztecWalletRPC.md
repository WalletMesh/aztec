[**@walletmesh/aztec-rpc v0.0.5**](../README.md)

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

[packages/rpc/src/wallet.ts:31](https://github.com/WalletMesh/aztec/blob/9ad34955244cc5304cb566146299029ce93f71a9/packages/rpc/src/wallet.ts#L31)

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
