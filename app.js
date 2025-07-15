// Add before your app.js script in index.html
// <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>

// This file contains the main JavaScript logic for the application.
// It handles user interactions, updates the UI, and communicates with the blockchain functionality.

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit-button');
    const outputDiv = document.getElementById('output');
    const trackButton = document.getElementById('track-button');
    const trackingResultDiv = document.getElementById('tracking-result');
    const blockchainViewDiv = document.getElementById('blockchain-view');

    // Initialize blockchain
    const blockchain = new window.Blockchain();

    function renderBlockchain() {
        if (!blockchainViewDiv) return;
        const chain = blockchain.getChain();
        blockchainViewDiv.innerHTML = chain.map((block, idx) => `
            <div style="display:inline-block; vertical-align:top; text-align:center;">
                <div style="
                    border:3px solid #35424a;
                    border-radius:12px;
                    width:260px;
                    min-height:200px;
                    padding:18px 16px 16px 16px;
                    background:#fff;
                    box-shadow:0 4px 16px rgba(53,66,74,0.12);
                    margin-bottom:10px;
                    font-size:15px;
                    display:inline-block;
                    vertical-align:top;
                    ">
                    <div style="font-size:22px; font-weight:bold; color:#35424a; margin-bottom:8px;">
                        Block #${block.index} ${block.isGenesis ? '(Genesis Block)' : ''}
                    </div>
                    <div style="color:green; font-weight:bold; margin-bottom:8px;">[Verified]</div>
                    <div style="margin-bottom:6px;">
                        <span style="font-weight:bold;">Hash:</span>
                        <div style="font-size:12px;word-break:break-all; color:#222;">${block.hash}</div>
                    </div>
                    <div style="margin-bottom:6px;">
                        <span style="font-weight:bold;">Prev Hash:</span>
                        <div style="font-size:12px;word-break:break-all; color:#888;">${block.previousHash}</div>
                    </div>
                    <div style="margin-bottom:6px;">
                        <span style="font-weight:bold;">Timestamp:</span>
                        <span style="font-size:13px; color:#555;">${new Date(block.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                        <span style="font-weight:bold;">Transactions:</span>
                        <ul style="text-align:left; font-size:14px; padding-left:20px; margin:6px 0 0 0;">
                            ${block.transactions.length === 0 ? '<li style="color:#aaa;">No Transactions</li>' : block.transactions.map(tx => `
                                <li style="margin-bottom:6px;">
                                    <span style="color:#35424a;"><b>Name:</b> ${tx.name || '-'}</span><br>
                                    <span style="color:#e8491d;"><b>ID:</b> ${tx.id || '-'}</span><br>
                                    <span style="color:#2d7a2d;"><b>Status:</b> ${tx.status || '-'}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                ${idx < chain.length - 1 ? `
                    <span style="display:inline-block; vertical-align:middle; font-size:40px; color:#888; margin:0 12px 0 12px; line-height:200px;">
                        ⛓️
                    </span>
                ` : ''}
            </div>
        `).join('');
    }

    submitButton.addEventListener('click', (event) => {
        event.preventDefault();

        const nameInput = document.getElementById('product-name');
        const idInput = document.getElementById('product-id');
        const statusInput = document.getElementById('product-status');

        if (!nameInput || !idInput || !statusInput) {
            outputDiv.innerHTML = 'Input fields not found.';
            return;
        }

        const productData = {
            name: nameInput.value.trim(),
            id: idInput.value.trim(),
            status: statusInput.value.trim()
        };

        if (!productData.name || !productData.id || !productData.status) {
            outputDiv.innerHTML = 'Please fill in all fields.';
            return;
        }

        const block = blockchain.addProductTransaction(productData);
        if (block) {
            outputDiv.innerHTML = `Block created! Product added: ${productData.name} (ID: ${productData.id})`;
        } else {
            outputDiv.innerHTML = `Transaction added and pending. Block will be created after 5 transactions.`;
        }
        nameInput.value = '';
        idInput.value = '';
        statusInput.value = '';
        renderBlockchain();
    });

    if (trackButton && trackingResultDiv) {
        trackButton.addEventListener('click', (event) => {
            event.preventDefault();
            const trackIdInput = document.getElementById('track-product-id');
            if (!trackIdInput) {
                trackingResultDiv.innerHTML = 'Tracking input not found.';
                return;
            }
            const productId = trackIdInput.value.trim();
            if (!productId) {
                trackingResultDiv.innerHTML = 'Please enter a Product ID.';
                return;
            }
            const product = blockchain.findProductById(productId);
            if (product) {
                trackingResultDiv.innerHTML = `
                    <strong>Product Found:</strong><br>
                    Name: ${product.name}<br>
                    Status: ${product.status}<br>
                    Block: ${product.blockIndex}<br>
                    Timestamp: ${new Date(product.timestamp).toLocaleString()}
                `;
            } else {
                trackingResultDiv.innerHTML = 'Product not found on the blockchain.';
            }
        });
    }

    // Render blockchain on page load
    renderBlockchain();
});