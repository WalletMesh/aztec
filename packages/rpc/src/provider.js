import { JSONRPCClient } from '@walletmesh/jsonrpc';
/**
 * Provides an interface to interact with the Aztec Wallet over JSON-RPC.
 */
export class AztecProviderRPC {
    /**
     * Creates a new AztecProviderRPC instance.
     * @param sendRequest - A function to send JSON-RPC requests.
     */
    constructor(sendRequest) {
        this.client = new JSONRPCClient(sendRequest);
    }
    /**
     * Connects to the Aztec network.
     * @returns A boolean indicating the connection status.
     */
    async connect() {
        return this.client.callMethod('aztec_connect');
    }
    /**
     * Retrieves the account address from the wallet.
     * @returns The account address as a string.
     */
    async getAccount() {
        return this.client.callMethod('aztec_getAccount');
    }
    /**
     * Sends a transaction to the Aztec network.
     * @param contractAddress - The contract address.
     * @param functionAbi - The function ABI.
     * @param args - The arguments for the function.
     * @returns The transaction hash as a string.
     */
    async sendTransaction(contractAddress, functionAbi, args) {
        return this.client.callMethod('aztec_sendTransaction', {
            contractAddress,
            functionAbi,
            args,
        });
    }
    /**
     * Simulates a transaction on the Aztec network.
     * @param contractAddress - The contract address.
     * @param functionAbi - The function ABI.
     * @param args - The arguments for the function.
     * @returns The result of the transaction simulation.
     */
    async simulateTransaction(contractAddress, functionAbi, args) {
        return this.client.callMethod('aztec_simulateTransaction', {
            contractAddress,
            functionAbi,
            args,
        });
    }
    /**
     * Receives a JSON-RPC response and processes it.
     * @param response - The JSON-RPC response to process.
     */
    receiveResponse(response) {
        this.client.receiveResponse(response);
    }
    /**
     * Registers a contact in the user's PXE.
     * @param contact - The contact to register.
     * @returns A boolean indicating the registration status.
     */
    async registerContact(contact) {
        return this.client.callMethod('aztec_registerContact', { contact });
    }
    /**
     * Registers a contract in the user's PXE.
     * @param contractArtifact - The contract artifact.
     * @param contractAddress - The contract address.
     * @returns A boolean indicating the registration status.
     */
    async registerContract(contractArtifact, contractAddress) {
        return this.client.callMethod('aztec_registerContract', { contractArtifact, contractAddress });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFJcEQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBRzNCOzs7T0FHRztJQUNILFlBQVksV0FBdUM7UUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBMEIsV0FBVyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxPQUFPO1FBQ1gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFVBQVU7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxlQUFlLENBQUMsZUFBdUIsRUFBRSxXQUF3QixFQUFFLElBQWU7UUFDdEYsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRTtZQUNyRCxlQUFlO1lBQ2YsV0FBVztZQUNYLElBQUk7U0FDTCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLG1CQUFtQixDQUN2QixlQUF1QixFQUN2QixXQUF3QixFQUN4QixJQUFlO1FBRWYsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsRUFBRTtZQUN6RCxlQUFlO1lBQ2YsV0FBVztZQUNYLElBQUk7U0FDTCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksZUFBZSxDQUNwQixRQUFpRjtRQUVqRixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxlQUFlLENBQUMsT0FBZTtRQUNuQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWtDLEVBQUUsZUFBdUI7UUFDaEYsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7SUFDakcsQ0FBQztDQUNGIn0=