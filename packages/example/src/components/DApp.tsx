import React, { useState } from 'react';
import { AztecProviderRPC } from '@walletmesh/aztec/rpc';
import { AztecAddress } from '@aztec/aztec.js';
import { CounterContractArtifact, TokenContractArtifact } from '@aztec/noir-contracts.js';
import type { FunctionAbi } from '@aztec/foundation/abi';
import { getFunctionArtifact } from '@aztec/foundation/abi';

// These are the addresses deployed using the sandbox setup. See <gitroot>/sandbox/.
const TOKEN_CONTRACT = '0x1747aa930e8c91330cddd0ad9219c579e0a9658bef2ad066f290a4d05a329308';
const COUNTER_CONTRACT = '0x15b79bc66de07a983761fee80f85853768b6502300fd62ca59221ad33a801738';

const DApp: React.FC = () => {
  const [client, setClient] = useState<AztecProviderRPC | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('');
  const [counterValue, setCounterValue] = useState<string>('');

  const connectWallet = () => {
    const newClient = new AztecProviderRPC((request) => {
      console.log('Sending request:', request); // Debug log
      window.postMessage({
        type: 'wallet_request',
        data: request,
        origin: window.location.origin
      }, '*');
    });

    const receiveResponse = (event: MessageEvent) => {
      if (event.source === window && event.data?.type === 'wallet_response') {
        newClient.receiveResponse(event.data.data);
      }
    };

    window.addEventListener('message', receiveResponse);

    newClient.connect().then((connected) => {
      if (connected) {
        setIsConnected(true);
        newClient.getAccount().then((accountAddress) => {
          setAccount(accountAddress);
        }).catch((error) => {
          window.alert(`Failed to get account: ${error.message}`);
          setIsConnected(false);
        });
      } else {
        window.alert('Failed to connect wallet.');
        setIsConnected(false);
      }
    }).catch((error) => {
      window.alert(`Failed to connect wallet: ${error.message}`);
      setIsConnected(false);
    });

    setClient(newClient);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('message', receiveResponse);
    };
  };

  const mintTokens = () => {
    if (client) {
      // mint_to_public(to: AztecAddress, amount: Field)
      const args = [account, 10000000000000000000000];
      const functionAbi: FunctionAbi = getFunctionArtifact(TokenContractArtifact, 'mint_to_public');
      client.sendTransaction({ contractAddress: TOKEN_CONTRACT, functionAbi, args }).then((transactionHash) => {
        console.log('Mint transaction sent, hash:', transactionHash);
      }).catch((error) => {
        window.alert(`Transaction failed: ${error.message}`);
      });
    }
  }

  const transferTokens = () => {
    if (client) {
      // transfer_in_public(from: AztecAddress, to: AztecAddress, amount: Field, nonce: Field)
      const to = AztecAddress.random();
      const args = [
        account, // from
        to.toString(),
        100000,
        0, // nonce
      ];
      const functionAbi: FunctionAbi = getFunctionArtifact(TokenContractArtifact, 'transfer_in_public');
      client.sendTransaction({ contractAddress: TOKEN_CONTRACT, functionAbi, args }).then((transactionHash) => {
        console.log('Transfer transaction sent, hash:', transactionHash);
      }).catch((error) => {
        window.alert(`Transaction failed: ${error.message}`);
      });
    }
  }

  const checkTokenBalance = () => {
    if (client) {
      // balance_of_public(owner: AztecAddress) -> Field
      const args = [account];
      const functionAbi: FunctionAbi = getFunctionArtifact(TokenContractArtifact, 'balance_of_public');
      client.simulateTransaction({ contractAddress: TOKEN_CONTRACT, functionAbi, args }).then((result) => {
        console.log('Token balance:', result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTokenBalance((result as any).toString());
      });
    }
  }

  const incrementCounter = () => {
    if (client) {
      // increment(owner: AztecAddress, outgoing_viewer: AztecAddress) {
      const args = [account, account];
      const functionAbi: FunctionAbi = getFunctionArtifact(CounterContractArtifact, 'increment');
      client.sendTransaction({ contractAddress: COUNTER_CONTRACT, functionAbi, args }).then((transactionHash) => {
        console.log('Increment transaction sent, hash:', transactionHash);
      }).catch((error) => {
        window.alert(`Transaction failed: ${error.message}`);
      });
    }
  }

  const getCounter = () => {
    if (client) {
      // getCounter(owner: AztecAddress, viewer: AztecAddress)
      const args = [account];
      const functionAbi: FunctionAbi = getFunctionArtifact(CounterContractArtifact, 'get_counter');
      client.simulateTransaction({ contractAddress: COUNTER_CONTRACT, functionAbi, args }).then((result) => {
        console.log('Counter value:', result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCounterValue((result as any).toString());
      });
    }
  }

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <button onClick={mintTokens}>Mint Tokens</button>
          <button onClick={transferTokens}>Transfer Tokens</button>
          <button onClick={checkTokenBalance}>Token Balance</button>
          <button onClick={incrementCounter}>Increment Counter</button>
          <button onClick={getCounter}>Get Counter</button>

          {tokenBalance && <p>Token balance: {tokenBalance}</p>}
          {counterValue && <p>Counter: {counterValue}</p>}
        </div>
      )}
    </div>
  );
};

export default DApp;
