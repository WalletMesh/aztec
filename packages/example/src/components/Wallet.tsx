/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import {
  AztecWalletRPC,
  type AztecWalletRPCMiddleware
} from '@walletmesh/aztec/rpc';
import { getSchnorrWallet } from '@aztec/accounts/schnorr';
import { createPXEClient, AztecAddress, Fr } from '@aztec/aztec.js';
import { deriveSigningKey } from '@aztec/circuits.js';
import Approve from './Approve.js';
import './Wallet.css';

// Test account deployed in the sandbox - see /sandbox/account.json
const TEST_ACCOUNT_SCHNORR_ADDRESS = AztecAddress.fromString('0x0627c5a3c006c7cf2413042101281424c7fded01c285c5d834c3ca5fc855f52c');
const TEST_ACCOUNT_SCHNORR_SECRET = Fr.fromString('0x2490e659effed473b8900b6ffca8b2dfa0b50f3ee6493684477923b4dedbb275');
const TEST_ACCOUNT_SCHNORR_SIGNING = deriveSigningKey(TEST_ACCOUNT_SCHNORR_SECRET);

const Wallet: React.FC = () => {
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const isConnectedRef = useRef(false);
  const [requestHistory, setRequestHistory] = useState<any[]>([]);

  // Helper function to format parameter values
  const formatParameterValue = (value: any) => {
    if (typeof value === 'number' || typeof value === 'bigint') {
      // For numbers and BigInts
      const decimalValue = Number(value).toLocaleString();
      const hexValue = '0x' + BigInt(value).toString(16);
      return `${decimalValue} (Hex: ${hexValue})`;
    } else if (
      value &&
      typeof value === 'object' &&
      typeof value.toString === 'function' &&
      /^\d+$/.test(value.toString())
    ) {
      // For objects with numeric toString output
      const decimalValue = BigInt(value.toString()).toLocaleString();
      const hexValue = '0x' + BigInt(value.toString()).toString(16);
      return `${decimalValue} (Hex: ${hexValue})`;
    } else {
      // For other types, just stringify
      return String(value);
    }
  };

  useEffect(() => {
    let server: AztecWalletRPC;

    const setupServer = async () => {
      try {
        const pxe = createPXEClient(import.meta.env.VITE_PXE_URL);
        pxe.getPXEInfo().then((info) => { console.log('PXE Info:', info) });

        const wallet = await getSchnorrWallet(pxe, TEST_ACCOUNT_SCHNORR_ADDRESS, TEST_ACCOUNT_SCHNORR_SIGNING);
        console.debug('Wallet loaded:', wallet.getAddress().toString());

        server = new AztecWalletRPC(wallet, async (response) => {
          console.log('Server sending response:', response);
          window.postMessage({ type: 'wallet_response', data: response }, '*');
        });

        // Connection check middleware
        const connectionMiddleware: AztecWalletRPCMiddleware = async (req, next) => {
          console.log('Connection middleware:', req);
          if (req.method === 'aztec_connect') {
            return next();
          }
          if (req.method === 'aztec_getAccount' && isConnectedRef.current) {
            return next();
          }
          if (!isConnectedRef.current) {
            throw new Error('Wallet not connected. Please connect first.');
          }
          return next();
        };

        // Approval middleware
        const approvalMiddleware: AztecWalletRPCMiddleware = async (req, next) => {
          console.log('Approval middleware, setting pending request:', req);
          return new Promise((resolve, reject) => {
            setPendingRequest({
              method: req.method,
              params: req.params,
              origin: window.location.origin,
              onApprove: async () => {
                console.log('Request approved:', req.method);
                setPendingRequest(null);
                if (req.method === 'aztec_connect') {
                  isConnectedRef.current = true; // Update ref synchronously
                }
                try {
                  const result = await next();
                  if (req.method === 'aztec_connect') {
                    isConnectedRef.current = true;
                  }
                  setRequestHistory(prev => prev.map((item, i) =>
                    i === prev.length - 1 ? { ...item, status: 'Approved' } : item
                  ));
                  resolve(result);
                } catch (error) {
                  console.error('Error in approval flow:', error);
                  reject(error);
                }
              },
              onDeny: () => {
                console.log('Request denied:', req.method);
                setPendingRequest(null);
                setRequestHistory(prev => prev.map((item, i) =>
                  i === prev.length - 1 ? { ...item, status: 'Denied' } : item
                ));
                if (req.method === 'aztec_connect') {
                  isConnectedRef.current = false;
                }
                reject(new Error('User denied the request.'));
              },
            });
          });
        };

        server.addMiddleware(connectionMiddleware);
        server.addMiddleware(approvalMiddleware);
      } catch (error) {
        console.error('Error setting up server:', error);
      }
    };

    // Set up message handler
    const receiveRequest = (event: MessageEvent) => {
      if (event.source === window && event.data?.type === 'wallet_request') {
        console.log('Processing wallet request:', event.data);
        const timestamp = new Date().toLocaleString();

        // Add to history before processing
        setRequestHistory(prevHistory => {
          const newEntry = {
            method: event.data.data.method,
            params: event.data.data.params,
            origin: event.data.origin,
            time: timestamp,
          };
          return [...prevHistory, newEntry];
        });

        // Process the request
        if (server) {
          server.receiveRequest(event.data.data);
        } else {
          console.error('Server not initialized');
        }
      }
    };

    // Initialize
    setupServer().then(() => {
      window.addEventListener('message', receiveRequest);
    });

    return () => {
      window.removeEventListener('message', receiveRequest);
    };

  }, []);

  return (
    <div className="wallet-server">
      {pendingRequest && (
        <Approve
          method={pendingRequest.method}
          params={pendingRequest.params}
          origin={pendingRequest.origin}
          onApprove={pendingRequest.onApprove}
          onDeny={pendingRequest.onDeny}
        />
      )}

      {!isConnectedRef.current ? (
        <p className="connection-status disconnected">Not Connected</p>
      ) : (
        <>
          <p className="connection-status connected">Connected</p>
          <h3>Request History</h3>
          <ul className="request-history">
            {requestHistory.length === 0 ? (
              <li>None</li>
            ) : (
              [...requestHistory].reverse().map((request, index) => (
                <li key={index}>
                  <p className="request-details"><b>Time:</b> {request.time}</p>
                  <p className="request-details"><b>Origin:</b> {request.origin}</p>
                  <p className="request-details"><b>Method:</b> {request.method}</p>
                  {request.params && <p className="request-details"><b>Contract Address:</b> {request.params.contractAddress}</p>}
                  {request.params && request.params.functionAbi && <p className="request-details"><b>Function:</b> {request.params.functionAbi.name}</p>}
                  {request.params && request.params.functionAbi && (
                    <>
                      <p className="request-details"><b>Function Type:</b> {request.params.functionAbi.type}</p>
                      <div>
                        <p className="request-details"><b>Call:</b></p>
                        <pre className="function-call">
                          {`${request.params.functionAbi.name}(`}
                          {request.params.functionAbi.parameters.map((param: { name: string }, idx: number) => (
                            <React.Fragment key={idx}>
                              {'\n  '}
                              {param.name}: {formatParameterValue(request.params.args[idx])}
                              {idx < request.params.functionAbi.parameters.length - 1 ? ',' : ''}
                            </React.Fragment>
                          ))}
                          {'\n)'}
                        </pre>
                      </div>
                    </>
                  )}
                  {request.status && (
                    <p className="request-details">
                      <b>Status:</b> <span className={request.status === 'Denied' ? 'denied-status' : ''}>{request.status}</span>
                    </p>
                  )}
                  <hr />
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default Wallet;
