const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// --- Blockchain logic (same as your blockchain.js) ---
class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.createNewBlock('0');
    }
    createNewBlock(previousHash) {
        const block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            previousHash: previousHash || '0',
        };
        this.pendingTransactions = [];
        this.chain.push(block);
        return block;
    }
    addProductTransaction(product) {
        this.pendingTransactions.push(product);
        return this.createNewBlock(this.getLastBlock().previousHash);
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

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const blockchain = new Blockchain();

app.use(cors());
app.use(express.json());

// REST endpoint to add a product
app.post('/api/products', (req, res) => {
    const { name, id, status } = req.body;
    if (!name || !id || !status) return res.status(400).json({ error: 'Missing fields' });
    const block = blockchain.addProductTransaction({ name, id, status });
    io.emit('blockchainUpdate', blockchain.getChain());
    res.json(block);
});

// REST endpoint to track a product
app.get('/api/products/:id', (req, res) => {
    const product = blockchain.findProductById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ error: 'Product not found' });
});

// REST endpoint to get the blockchain
app.get('/api/chain', (req, res) => {
    res.json(blockchain.getChain());
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
    socket.emit('blockchainUpdate', blockchain.getChain());
    socket.on('disconnect', () => {});
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));