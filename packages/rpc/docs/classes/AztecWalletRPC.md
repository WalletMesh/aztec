[**@walletmesh/aztec-rpc v0.0.8**](../README.md)

***

[@walletmesh/aztec-rpc](../globals.md) / AztecWalletRPC

# Class: AztecWalletRPC

JSON-RPC interface implementation for an Aztec Wallet.
Handles communication between dapps and the wallet through JSON-RPC.

## Extends

- `JSONRPCServer`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), [`AztecWalletContext`](../type-aliases/AztecWalletContext.md)\>

## Constructors

### new AztecWalletRPC()

> **new AztecWalletRPC**(`wallet`, `sendResponse`): [`AztecWalletRPC`](AztecWalletRPC.md)

Creates a new AztecWalletRPC instance.

#### Parameters

##### wallet

`Wallet`

The underlying Wallet instance

##### sendResponse

(`context`, `request`, `response`) => `Promise`\<`void`\>

Function to send JSON-RPC responses

#### Returns

[`AztecWalletRPC`](AztecWalletRPC.md)

#### Overrides

`JSONRPCServer<AztecWalletRPCMethodMap, AztecWalletContext>.constructor`

#### Defined in

[packages/rpc/src/wallet.ts:38](https://github.com/WalletMesh/aztec/blob/d8d2f2cdd3d6049cb75dc7c911ba6918ba4c3225/packages/rpc/src/wallet.ts#L38)

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the stack.

#### Parameters

##### middleware

`JSONRPCMiddleware`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), [`AztecWalletContext`](../type-aliases/AztecWalletContext.md)\>

The middleware function to add.

#### Returns

`Function`

A function to remove the middleware from the stack.

##### Returns

`void`

#### Inherited from

`JSONRPCServer.addMiddleware`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/server.d.ts:39

***

### receiveRequest()

> **receiveRequest**(`context`, `request`): `Promise`\<`void`\>

Receives a JSON-RPC request and handles it.

#### Parameters

##### context

[`AztecWalletContext`](../type-aliases/AztecWalletContext.md)

##### request

`JSONRPCRequest`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), `JSONRPCParams`\>

The JSON-RPC request object.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCServer.receiveRequest`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/server.d.ts:45

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`, `serializer`?): `void`

Registers a method that can be called remotely.

#### Type Parameters

• **M** *extends* keyof [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)

#### Parameters

##### name

`M`

The method name.

##### handler

`MethodHandler`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md), `M`, [`AztecWalletContext`](../type-aliases/AztecWalletContext.md)\>

The function to handle the method call.

##### serializer?

`JSONRPCSerializer`\<[`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"params"`\], [`AztecWalletRPCMethodMap`](../type-aliases/AztecWalletRPCMethodMap.md)\[`M`\]\[`"result"`\]\>

Optional serializer for parameters and result.

#### Returns

`void`

#### Inherited from

`JSONRPCServer.registerMethod`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/server.d.ts:32
