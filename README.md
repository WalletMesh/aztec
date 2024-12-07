## WalletMesh Aztec Library

[@walletmesh/aztec](https://github.com/WalletMesh/aztec/tree/main) provides tools for interacting
with the [Aztec](https://aztec.network) blockchain.

## Installation

```bash
npm install @walletmesh/aztec
```
## Usage

### On the dApp (client) side

```js
import { AztecProviderRPC } from '@walletmesh/aztec/rpc';

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
import { AztecWalletRPC } from '@walletmesh/aztec/rpc';
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
    walletRPC.receiveRequest(request, {
        // Context object enabling middleware to access the PXE
        pxe: pxeInstance
    });
});
```
