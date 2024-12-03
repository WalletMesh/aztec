import { AztecAddress, Contract, ContractFunctionInteraction } from '@aztec/aztec.js';
import { JSONRPCServer } from '@walletmesh/jsonrpc';
/**
 * JSON-RPC interface to an Aztec Wallet.
 */
export class AztecWalletRPC extends JSONRPCServer {
    /**
     * Creates a new AztecWalletRPC instance.
     * @param wallet - The underlying Wallet instance.
     * @param sendResponse - A function to send JSON-RPC responses.
     */
    constructor(wallet, sendResponse) {
        super(sendResponse);
        this.wallet = wallet;
        this.registerMethods();
    }
    /**
     * Registers the JSON-RPC methods supported by this wallet.
     */
    registerMethods() {
        this.registerMethod('aztec_connect', this.connect.bind(this));
        this.registerMethod('aztec_getAccount', this.getAccount.bind(this));
        this.registerMethod('aztec_sendTransaction', this.sendTransaction.bind(this));
        this.registerMethod('aztec_simulateTransaction', this.simulateTransaction.bind(this));
        this.registerMethod('aztec_registerContact', this.registerContact.bind(this));
        this.registerMethod('aztec_registerContract', this.registerContract.bind(this));
    }
    /**
     * Handles the 'aztec_connect' JSON-RPC method.
     * @returns A boolean indicating the connection status.
     */
    connect() {
        return true;
    }
    /**
     * Handles the 'aztec_getAccount' JSON-RPC method.
     * @returns The account address as a string.
     */
    getAccount() {
        const accountAddress = this.wallet.getAddress().toString();
        return accountAddress;
    }
    /**
     * Handles the 'aztec_sendTransaction' JSON-RPC method.
     * @param params - The parameters for the transaction.
     * @param params.contractAddress - The address of the contract to interact with.
     * @param params.functionAbi - The ABI of the function to call.
     * @param params.args - The arguments to pass to the function.
     * @returns The transaction hash as a string.
     */
    async sendTransaction(params) {
        const { contractAddress, functionAbi, args } = params;
        const addr = AztecAddress.fromString(contractAddress);
        const interaction = new ContractFunctionInteraction(this.wallet, addr, functionAbi, args);
        const sentTx = interaction.send();
        return (await sentTx.getTxHash()).toString();
    }
    /**
     * Handles the 'aztec_simulateTransaction' JSON-RPC method.
     * @param params - The parameters for simulating the transaction.
     * @param params.contractAddress - The address of the contract to interact with.
     * @param params.functionAbi - The ABI of the function to simulate.
     * @param params.args - The arguments to pass to the function.
     * @returns The result of the transaction simulation.
     */
    async simulateTransaction(params) {
        const { contractAddress, functionAbi, args } = params;
        const addr = AztecAddress.fromString(contractAddress);
        const interaction = new ContractFunctionInteraction(this.wallet, addr, functionAbi, args);
        const result = interaction.simulate();
        return result;
    }
    /**
     * Registers a contact in the user's PXE.
     * @param params - The parameters for registering the contact.
     * @returns A boolean indicating the registration status.
     */
    async registerContact(params) {
        const { contact } = params;
        const addr = AztecAddress.fromString(contact);
        try {
            await this.wallet.registerContact(addr);
            return true;
        }
        catch (error) {
            console.error('Error registering contact', error);
            return false;
        }
    }
    /**
     * Registers a contract in the user's PXE.
     * @param params - The parameters for registering the contract.
     * @returns A boolean indicating the registration status.
     */
    async registerContract(params) {
        const { contractArtifact, contractAddress } = params;
        const addr = AztecAddress.fromString(contractAddress);
        try {
            const contract = await Contract.at(addr, contractArtifact, this.wallet);
            await this.wallet.registerContract(contract);
            return true;
        }
        catch (error) {
            console.error('Error registering contract', error);
            return false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2FsbGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLDJCQUEyQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJdEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBT3BEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGNBQWUsU0FBUSxhQUFzQztJQUd4RTs7OztPQUlHO0lBQ0gsWUFBWSxNQUFjLEVBQUUsWUFBa0Q7UUFDNUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQ7O09BRUc7SUFDSyxlQUFlO1FBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsY0FBYyxDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVEOzs7T0FHRztJQUNLLE9BQU87UUFDYixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSyxVQUFVO1FBQ2hCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0QsT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BSTdCO1FBQ0MsTUFBTSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ3RELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEQsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUYsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ssS0FBSyxDQUFDLG1CQUFtQixDQUFDLE1BSWpDO1FBQ0MsTUFBTSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ3RELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdEQsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUYsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUEyQjtRQUN2RCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQzNCLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUc5QjtRQUNDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDckQsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUM7WUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4RSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0MsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkQsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0lBQ0gsQ0FBQztDQUNGIn0=