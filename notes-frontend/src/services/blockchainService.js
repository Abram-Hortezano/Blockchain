import { BrowserWallet, Transaction, KoiosProvider, BlockfrostProvider } from '@meshsdk/core';

const BLOCKFROST_PROJECT_ID = 'previewa9fMtO9ESzjRFt7qWjsJhSH0MUYyB09y'; // Provided key

// Initialize Provider
const blockchainProvider = new BlockfrostProvider(BLOCKFROST_PROJECT_ID);

export const connectWallet = async () => {
    try {
        const wallet = await BrowserWallet.enable('lace');
        return wallet;
    } catch (error) {
        console.error("Error connecting to wallet:", error);
        throw error;
    }
};

export const checkConnection = async () => {
    try {
        const wallet = await BrowserWallet.enable('lace');
        return wallet;
    } catch (error) {
        return null;
    }
};

export const createNoteTransaction = async (wallet, note) => {
    try {
        const tx = new Transaction({ initiator: wallet });
        const userAddress = await wallet.getChangeAddress();

        // Send 1 ADA to self to carry metadata (min UTxO)
        tx.sendLovelace(userAddress, '1000000');

        // Set Metadata (Label 674 for Notes App)
        tx.setMetadata(674, {
            action: 'CREATE',
            id: note.id.toString(),
            title: note.title,
            contentHash: note.contentHash, // SHA-256 hash passed from frontend
            timestamp: Date.now()
        });

        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx, true);
        const txHash = await wallet.submitTx(signedTx);

        return txHash;
    } catch (error) {
        console.error("Error creating note transaction:", error);
        throw error;
    }
};

export const deleteNoteTransaction = async (wallet, noteId) => {
    try {
        const tx = new Transaction({ initiator: wallet });
        const userAddress = await wallet.getChangeAddress();

        tx.sendLovelace(userAddress, '1000000');

        tx.setMetadata(674, {
            action: 'DELETE',
            id: noteId.toString(),
            timestamp: Date.now()
        });

        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx, true);
        const txHash = await wallet.submitTx(signedTx);

        return txHash;
    } catch (error) {
        console.error("Error deleting note transaction:", error);
        throw error;
    }
};
