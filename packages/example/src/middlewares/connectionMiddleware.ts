import type { AztecWalletRPCMiddleware } from '@walletmesh/aztec/rpc';

export const createConnectionMiddleware = (
  isConnectedRef: React.MutableRefObject<boolean>,
): AztecWalletRPCMiddleware => {
  return async (_context, req, next) => {
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
};
