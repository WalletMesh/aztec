/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, type FC } from 'react';
import {
  AztecWalletRouter,
  AztecWalletRPC,
  type TransactionFunctionCall,
  type TransactionParams,
} from '@walletmesh/aztec/rpc';
import { JSONRPCWalletClient } from '@walletmesh/router';
import { getSchnorrWallet } from '@aztec/accounts/schnorr';
import { createPXEClient, type PXE } from '@aztec/aztec.js';
import Approve from './Approve.js';
import './Wallet.css';
import FunctionCallDisplay from './FunctionCallDisplay.js';
import { createConnectionMiddleware } from '../middlewares/connectionMiddleware';
import { createApprovalMiddleware } from '../middlewares/approvalMiddleware';
import { createHistoryMiddleware, type HistoryEntry } from '../middlewares/historyMiddleware';
import { functionArgNamesMiddleware } from '../middlewares/functionArgNamesMiddleware';

import { TEST_ACCOUNT_SCHNORR_ADDRESS, TEST_ACCOUNT_SCHNORR_SIGNING } from '../lib/sandbox-data.js';

function isTransactionParams(params: unknown): params is TransactionParams {
  return (
    typeof params === 'object' &&
    params !== null &&
    'functionCalls' in params &&
    Array.isArray((params as TransactionParams).functionCalls)
  );
}

function isTransactionFunctionCall(params: unknown): params is TransactionFunctionCall {
  return (
    typeof params === 'object' &&
    params !== null &&
    'contractAddress' in params &&
    'functionName' in params &&
    'args' in params
  );
}

const Wallet: FC = () => {
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const isConnectedRef = useRef(false);
  const [requestHistory, setRequestHistory] = useState<HistoryEntry[]>([]);
  const setupDoneRef = useRef(false);

  useEffect(() => {
    if (setupDoneRef.current) return;
    setupDoneRef.current = true;

    let router: AztecWalletRouter;
    let walletClient: JSONRPCWalletClient;
    let pxe: PXE;

    const setupServer = async () => {
      try {
        pxe = createPXEClient(import.meta.env.VITE_PXE_URL);
        pxe.getPXEInfo().then((info) => { console.log('PXE Info:', info) }).catch(err => window.alert(`Failed connecting to PXE: ${err}`));

        const wallet = await getSchnorrWallet(pxe, TEST_ACCOUNT_SCHNORR_ADDRESS, TEST_ACCOUNT_SCHNORR_SIGNING);
        console.debug('Wallet loaded:', wallet.getAddress().toString());


        const aztecWalletRPC = new AztecWalletRPC(wallet, { send: message => { console.log('Wallet sending message:', message); } });
        walletClient = new JSONRPCWalletClient(aztecWalletRPC);



        router = new AztecWalletRouter(
          { send(message) => { window.postMessage({ type: 'wallet_response', data: message }, '*') } },

{ permissions: { rules: [] } }
        );


// wallet, async (context, request) => {
//   console.log('Router processing request:', request);
//   // Check permissions
//   if (router.options.permissions?.rules) {
//     for (const rule of router.options.permissions.rules) {
//       const allowed = await rule(context.chainId, context.operation, context);
//       if (!allowed) {
//         throw new Error('Permission denied');
//       }
//     }
//   }

// Forward request to chain client
return wallet.call(request.method, request.params);
}


// Create middlewares with necessary dependencies
server.addMiddleware(createConnectionMiddleware(isConnectedRef));
server.addMiddleware(functionArgNamesMiddleware(isConnectedRef));
server.addMiddleware(createHistoryMiddleware(setRequestHistory));
server.addMiddleware(createApprovalMiddleware(
  setPendingRequest,
  setRequestHistory,
  isConnectedRef
));
      } catch (error) {
  console.error('Error setting up server:', error);
}
    };

// Set up message handler
const receiveRequest = (event: MessageEvent) => {
  if (event.source === window && event.data?.type === 'wallet_request') {
    console.log('Processing wallet request:', event.data);
    // Process the request
    if (server) {
      server.receiveRequest(
        { pxe }, // Context
        event.data.data
      );
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
        functionArgNames={pendingRequest.functionArgNames}
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
                <p className="request-details">
                  <b>Time:</b> {request.time}
                </p>
                <p className="request-details">
                  <b>Origin:</b> {request.origin}
                </p>
                <p className="request-details">
                  <b>Method:</b> {request.method}
                </p>
                {request.method === 'aztec_sendTransaction' &&
                  request.params &&
                  isTransactionParams(request.params) ? (
                  request.params.functionCalls.map((call, idx) => (
                    <FunctionCallDisplay
                      key={idx}
                      call={call}
                      functionArgNames={request.functionArgNames}
                    />
                  ))
                ) : null}

                {request.method === 'aztec_simulateTransaction' &&
                  request.params &&
                  isTransactionFunctionCall(request.params) ? (
                  <FunctionCallDisplay
                    call={request.params}
                    functionArgNames={request.functionArgNames}
                  />
                ) : null}
                {request.status && (
                  <p className="request-details">
                    <b>Status:</b>{' '}
                    <span
                      className={
                        request.status === 'Denied' ? 'denied-status' : ''
                      }
                    >
                      {request.status}
                    </span>
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
