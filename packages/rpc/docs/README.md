**@walletmesh/aztec-rpc v0.0.8**

***

## WalletMesh Aztec RPC Library

[@walletmesh/aztec-rpc](https://github.com/WalletMesh/aztec/tree/main/packages/rpc) provides an implementation of
RPC Provider & Wallet Service for [Aztec](https://aztec.network).

It is built on top of the
[@walletmesh/jsonrpc](https://github.com/WalletMesh/wm-core/tree/main/packages/jsonrpc#readme) library.

## Features

- Connect to Aztec wallet
- Get account addresses
- Send and simulate transactions
- Register contacts, contracts, and contract classes
- Type-safe RPC interfaces (see `src/types.ts`)

## Supported RPC Methods

The following JSON-RPC methods are supported:

* `aztec_connect`: Establish connection with the wallet
* `aztec_getAccount`: Get the wallet's account address
* `aztec_sendTransaction`: Send one or more transactions
* `aztec_simulateTransaction`: Simulate a transaction without executing it
* `aztec_registerContact`: Register a contact address
* `aztec_registerContract`: Register a contract instance
* `aztec_registerContractClass`: Register a contract class

See src/types.ts for detailed type definitions and parameters.

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

// Create provider that sends requests via postMessage
const provider = new AztecProviderRPC(request => {
    window.postMessage(JSON.stringify(request), '*');
});

// Handle responses from wallet
window.addEventListener('message', event => {
    const response = JSON.parse(event.data);
    provider.receiveResponse(response);
});

// Example: Connect and interact with contracts
async function interact() {
    // Connect to wallet
    await provider.connect();

    // Get user's account address
    const account = await provider.getAccount();

    // Register a contact
    await provider.registerContact("0x1234...");

    // Register a contract class
    await provider.registerContractClass(contractArtifact);

    // Register a contract instance
    await provider.registerContract(
        "0x5678...",
        contractInstance,
        contractArtifact // optional if class already registered
    );

    // Simulate a transaction
    const result = await provider.simulateTransaction({
        contractAddress: "0x5678...",
        functionName: "transfer",
        args: [recipient, amount]
    });

    // Send a single transaction
    const txHash = await provider.sendTransaction({
        functionCalls: [{
            contractAddress: "0x5678...",
            functionName: "transfer",
            args: [recipient, amount]
        }]
    });

    // Send multiple transactions with auth witnesses
    const txHash2 = await provider.sendTransaction({
        functionCalls: [
            {
                contractAddress: "0x5678...",
                functionName: "transfer",
                args: [recipientA, amountA]
            },
            {
                contractAddress: "0x9012...",
                functionName: "mint",
                args: [recipientB, amountB]
            }
        ],
        authwits: ["0xabcd..."]  // Optional authorization witnesses
    });
}
```

### On the wallet (server) side
```js
import { AztecWalletRPC } from '@walletmesh/aztec-rpc';
import type { Wallet } from '@aztec/aztec.js';

// Initialize with your Aztec wallet instance
const walletRPC = new AztecWalletRPC(
    wallet,
    (context, request, response) => {
        window.postMessage(JSON.stringify(response), '*');
    }
);

// Handle incoming requests
window.addEventListener('message', event => {
    const request = JSON.parse(event.data);
    walletRPC.receiveRequest(
        { pxe: pxeInstance }, // Context object enabling middleware to access the PXE
        request
    );
});
```
