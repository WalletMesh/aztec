import React, { useState } from 'react';
import { AztecProviderRPC } from '@walletmesh/aztec/rpc';
import { AztecAddress } from '@aztec/aztec.js';

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
    const newClient = new AztecProviderRPC(async (request) => {
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
      const args = [account, 10000000000000000000000];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: TOKEN_CONTRACT,
            functionName: 'mint_to_public',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Mint transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  };

  const transferTokens = () => {
    if (client) {
      const to = AztecAddress.random();
      const args = [
        account, // from
        to.toString(),
        100000,
        0, // nonce
      ];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: TOKEN_CONTRACT,
            functionName: 'transfer_in_public',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Transfer transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  };

  const checkTokenBalance = () => {
    if (client) {
      const args = [account];
      client.simulateTransaction({
        contractAddress: TOKEN_CONTRACT,
        functionName: 'balance_of_public',
        args,
      })
        .then((result) => {
          console.log('Token balance:', result);
          setTokenBalance((result as bigint).toString());
        })
        .catch((error) => {
          window.alert(`Simulation failed: ${error.message}`);
        });
    }
  };

  const incrementCounter = () => {
    if (client) {
      const args = [account, account];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: COUNTER_CONTRACT,
            functionName: 'increment',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Increment transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  };

  const incrementCounterTwice = () => {
    if (client) {
      const args = [account, account];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: COUNTER_CONTRACT,
            functionName: 'increment',
            args,
          },
          {
            contractAddress: COUNTER_CONTRACT,
            functionName: 'increment',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Increment twice transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  }

  const getCounter = () => {
    if (client) {
      const args = [account];
      client.simulateTransaction({
        contractAddress: COUNTER_CONTRACT,
        functionName: 'get_counter',
        args,
      })
        .then((result) => {
          console.log('Counter value:', result);
          setCounterValue((result as bigint).toString());
        })
        .catch((error) => {
          window.alert(`Simulation failed: ${error.message}`);
        });
    }
  };

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
          <button onClick={incrementCounterTwice}>Increment Counter TWICE</button>
          <button onClick={getCounter}>Get Counter</button>

          {tokenBalance && <p>Token balance: {tokenBalance}</p>}
          {counterValue && <p>Counter: {counterValue}</p>}
        </div>
      )}
    </div>
  );
};

export default DApp;
