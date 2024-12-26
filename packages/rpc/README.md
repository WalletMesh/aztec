## WalletMesh Aztec RPC Library

[@walletmesh/aztec-rpc](https://github.com/WalletMesh/aztec/tree/main/packages/rpc) provides an implementation of
RPC Provider & Wallet Service for [Aztec](https://aztec.network).

It is built on top of the
[@walletmesh/jsonrpc](https://github.com/WalletMesh/wm-core/tree/main/packages/jsonrpc#readme) and [@walletmesh/router](https://github.com/WalletMesh/wm-core/tree/main/packages/router#readme) libraries.

## Features

- Connect to multiple Aztec chains simultaneously
- Flexible chain ID support (any string with 'aztec:' prefix)
- Get account addresses per chain
- Send and simulate transactions
- Register contacts, contracts, and contract classes
- Type-safe RPC interfaces (see `src/types.ts`)

## Supported RPC Methods

The following JSON-RPC methods are supported:

* `aztec_getAccount`: Get the wallet's account address
* `aztec_sendTransaction`: Send one or more transactions
* `aztec_simulateTransaction`: Simulate a transaction without executing it
* `aztec_registerContract`: Register a contract instance
* `aztec_registerContractClass`: Register a contract class
* `aztec_registerSender`: Register a transaction sender

See src/types.ts for detailed type definitions and parameters.

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

// Example: Connect and interact with contracts on multiple chains
async function interact() {
    // Connect to multiple chains
    await provider.connect(['aztec:testnet', 'aztec:devnet']);

    // Get list of supported chains
    const chains = provider.getSupportedChains(); // ['aztec:testnet', 'aztec:devnet']

    // Get user's account address on testnet
    const testnetAccount = await provider.getAccount('aztec:testnet');

    // Get user's account address on devnet
    const devnetAccount = await provider.getAccount('aztec:devnet');

    // Register a contract class on testnet
    await provider.registerContractClass('aztec:testnet', contractArtifact);

    // Register a contract instance on testnet
    await provider.registerContract('aztec:testnet', {
        address: "0x5678...",
        instance: contractInstance,
        artifact: contractArtifact // optional if class already registered
    });

    // Simulate a transaction on testnet
    const result = await provider.simulateTransaction('aztec:testnet', {
        contractAddress: "0x5678...",
        functionName: "transfer",
        args: [recipient, amount]
    });

    // Send a single transaction on testnet
    const txHash = await provider.sendTransaction('aztec:testnet', {
        functionCalls: [{
            contractAddress: "0x5678...",
            functionName: "transfer",
            args: [recipient, amount]
        }]
    });

    // Send multiple transactions with auth witnesses on devnet
    const txHash2 = await provider.sendTransaction('aztec:devnet', {
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

    // Listen for chain connection events
    provider.on('chain:connected', ({ chainId }) => {
        console.log(`Connected to chain: ${chainId}`);
    });

    // Listen for chain disconnection events
    provider.on('chain:disconnected', ({ chainId }) => {
        console.log(`Disconnected from chain: ${chainId}`);
    });

    // Listen for session expiration
    provider.on('session:expired', () => {
        console.log('Session expired');
    });
}
```

### On the wallet (server) side
```js
import { AztecWalletRouter } from '@walletmesh/aztec-rpc';
import type { Wallet } from '@aztec/aztec.js';

// Create chain clients
const chains = new Map([
    ['aztec:testnet', {
        chainId: 'aztec:testnet',
        rpc: new AztecWalletRPC(testnetWallet)
    }],
    ['aztec:devnet', {
        chainId: 'aztec:devnet',
        rpc: new AztecWalletRPC(devnetWallet)
    }]
]);

// Initialize router with chain clients
const router = new AztecWalletRouter(
    {
        send: message => {
            window.postMessage(JSON.stringify(message), '*');
        }
    },
    chains,
    {
        // Optional configuration
        permissions: {
            // Custom permission rules
            rules: [
                async (chainId, method, context) => {
                    // Return true to allow, false to deny
                    return true;
                }
            ],
            // Modify context before permission checks
            contextModifier: async (context) => {
                // Add custom data to context
                return context;
            }
        },
        // Session configuration
        session: {
            timeout: 3600000, // 1 hour
            persistent: false
        }
    }
);

// Handle incoming requests
window.addEventListener('message', event => {
    const request = JSON.parse(event.data);
    router.receiveRequest(request);
});
```

## Example

See [example](https://github.com/WalletMesh/aztec/tree/main/packages/example)
for a complete example of how to use this library.
