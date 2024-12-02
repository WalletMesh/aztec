## WalletMesh Aztec RPC Library

[@walletmesh/aztec-rpc](https://github.com/WalletMesh/aztec/tree/main/packages/rpc) provides an implementation of
RPC Provider & Wallet Service for [Aztec](https://aztec.network).

It is built on top of the
[@walletmesh/jsonrpc](https://github.com/WalletMesh/wm-core/tree/main/packages/jsonrpc#readme) library.

## Features

- Connect to Aztec wallet
- Get account addresses
- Send and simulate transactions
- Register contacts and contracts
- Type-safe RPC interfaces (see `src/types.ts`)

## Example

See [example](https://github.com/WalletMesh/aztec/tree/main/packages/example)
for an example of how to use this library.

## Installation

```bash
npm install @walletmesh/aztec-rpc
```

## Usage

### On the dApp (client) side

```js
import { AztecProviderRPC } from '@walletmesh/aztec-rpc';
import type { FunctionAbi } from '@aztec/foundation/abi';

// Create provider that sends requests via postMessage
const provider = new AztecProviderRPC(request => {
    window.postMessage(JSON.stringify(request), '*');
});

// Handle responses from wallet
window.addEventListener('message', event => {
    const response = JSON.parse(event.data);
    provider.receiveResponse(response);
});

// Example: Connect and interact with a contract
async function interact() {
    // Connect to wallet
    await provider.connect();

    // Get user's account address
    const account = await provider.getAccount();

    // Send a transaction
    const txHash = await provider.sendTransaction(
        contractAddress,
        functionAbi,
        args
    );

    // Simulate a transaction
    const result = await provider.simulateTransaction(
        contractAddress, 
        functionAbi,
        args
    );
}
```

### On the wallet (server) side
```js
import { AztecWalletRPC } from '@walletmesh/aztec-rpc';
import type { Wallet } from '@aztec/aztec.js';

// Initialize with your Aztec wallet instance
const walletRPC = new AztecWalletRPC(
    wallet,
    response => {
        window.postMessage(JSON.stringify(response), '*');
    }
);

// Handle incoming requests
window.addEventListener('message', event => {
    const request = JSON.parse(event.data);
    walletRPC.receiveRequest(request);
});
```
