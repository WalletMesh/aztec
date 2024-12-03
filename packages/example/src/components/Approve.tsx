import React from 'react';
import type { FunctionAbi } from '@aztec/foundation/abi';
import './Approve.css';

type ApproveProps = {
  method: string;
  params?: {
    contractAddress: string;
    functionAbi: FunctionAbi;
    args: unknown[];
  },
  origin: string;
  onApprove: () => void;
  onDeny: () => void;
};

const Approve: React.FC<ApproveProps> = ({ method, params, origin, onApprove, onDeny }) => {
  // Helper function to format parameter values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return (
    <div className="approve-container">
      <h3>Request Approval</h3>
      <p className="approve-details"><b>Origin:</b> {origin}</p>
      <p className="approve-details"><b>Method:</b> {method}</p>
      {params && <p className="approve-details"><b>Contract:</b> {params.contractAddress}</p>}
      {params && params.functionAbi && <p className="approve-details"><b>Function:</b> {params.functionAbi.name}</p>}
      {params && params.functionAbi &&
        <>
          <p className="approve-details"><b>Function Type:</b> {params.functionAbi.functionType}</p>
          <div>
            <p className="approve-details"><b>Call:</b></p>
            <pre className="function-call">
              {`${params.functionAbi.name}(`}
              {params.functionAbi.parameters.map((param, index) => (
                <React.Fragment key={index}>
                  {'\n  '}
                  {param.name}: {formatParameterValue(params.args[index])}
                  {index < params.functionAbi.parameters.length - 1 ? ',' : ''}
                </React.Fragment>
              ))}
              {'\n)'}
            </pre>
          </div>
        </>
      }
      <div className="approve-buttons">
        <button onClick={onApprove}>Approve</button>
        <button onClick={onDeny}>Deny</button>
      </div>
    </div>
  );
};

export default Approve;
