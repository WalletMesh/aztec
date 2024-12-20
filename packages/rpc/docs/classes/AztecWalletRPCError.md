[**@walletmesh/aztec-rpc v0.0.8**](../README.md)

***

[@walletmesh/aztec-rpc](../globals.md) / AztecWalletRPCError

# Class: AztecWalletRPCError

Custom error class for Aztec Wallet RPC errors.

## Extends

- `JSONRPCError`

## Constructors

### new AztecWalletRPCError()

> **new AztecWalletRPCError**(`err`, `data`?): [`AztecWalletRPCError`](AztecWalletRPCError.md)

Creates a new AztecWalletRPCError.

#### Parameters

##### err

`string`

The error type from AztecWalletRPCErrorMap

##### data?

`string`

Optional additional error data

#### Returns

[`AztecWalletRPCError`](AztecWalletRPCError.md)

#### Overrides

`JSONRPCError.constructor`

#### Defined in

[packages/rpc/src/errors.ts:27](https://github.com/WalletMesh/aztec/blob/d8d2f2cdd3d6049cb75dc7c911ba6918ba4c3225/packages/rpc/src/errors.ts#L27)

## Properties

### code

> **code**: `number`

The error code.

#### Inherited from

`JSONRPCError.code`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/error.d.ts:8

***

### data?

> `optional` **data**: `string`

Additional error data.

#### Inherited from

`JSONRPCError.data`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/error.d.ts:10

***

### message

> **message**: `string`

The error message.

#### Inherited from

`JSONRPCError.message`

#### Defined in

node\_modules/@walletmesh/jsonrpc/dist/error.d.ts:9
