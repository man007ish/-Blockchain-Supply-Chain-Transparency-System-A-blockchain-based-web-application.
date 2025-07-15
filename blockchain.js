// This file contains the JavaScript code that manages blockchain operations.
// It includes functions for creating transactions, verifying data, and interacting with the blockchain.

// Simple hash function for demo (not cryptographically secure)
function simpleHash(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash.toString();
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash.toString();
}

class Blockchain {
    constructor() {
        this.chain = [];
        this.maxTransactionsPerBlock = 5;
        // Create the genesis block
        this.createNewBlock('0', true);
    }

    createNewBlock(previousHash, isGenesis = false) {
        const blockData = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: [],
            previousHash: previousHash || '0',
            isGenesis: !!isGenesis
        };
        blockData.hash = simpleHash(
            blockData.index +
            blockData.timestamp +
            JSON.stringify(blockData.transactions) +
            blockData.previousHash
        );
        this.chain.push(blockData);
        return blockData;
    }

    addProductTransaction(product) {
        let currentBlock = this.getLastBlock();
        // Genesis block: only allow one transaction
        if (currentBlock.isGenesis && currentBlock.transactions.length >= 1) {
            // Create a new (non-genesis) block if genesis is full
            currentBlock = this.createNewBlock(currentBlock.hash, false);
        }
        // Non-genesis blocks: allow up to maxTransactionsPerBlock
        if (!currentBlock.isGenesis && currentBlock.transactions.length >= this.maxTransactionsPerBlock) {
            currentBlock = this.createNewBlock(currentBlock.hash, false);
        }
        currentBlock.transactions.push(product);
        // Update the hash since transactions changed
        currentBlock.hash = simpleHash(
            currentBlock.index +
            currentBlock.timestamp +
            JSON.stringify(currentBlock.transactions) +
            currentBlock.previousHash
        );
        return currentBlock;
    }

    findProductById(productId) {
        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.id === productId) {
                    return { ...tx, blockIndex: block.index, timestamp: block.timestamp };
                }
            }
        }
        return null;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    getChain() {
        return this.chain;
    }
}

window.Blockchain = Blockchain; // Make available globally for app.js