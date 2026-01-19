const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; 
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
;


let provider;
let signer;
let contract;
let userAddress;

const connectBtn = document.getElementById('connectBtn');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const balanceDisplay = document.getElementById('balance');
const refreshBtn = document.getElementById('refreshBtn');
const recipientInput = document.getElementById('recipient');
const amountInput = document.getElementById('amount');
const transferBtn = document.getElementById('transferBtn');
const transferStatus = document.getElementById('transferStatus');
const eventsList = document.getElementById('eventsList');

async function init() {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        window.ethereum.on('accountsChanged', async (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                await connectWallet();
            }
        });
    } else {
        alert('Please install MetaMask to use this dApp!');
        connectBtn.disabled = true;
    }
}

async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert('MetaMask is not installed!');
            return;
        }

        if (!provider) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        userAddress = accounts[0];
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        walletAddress.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        walletInfo.classList.remove('hidden');
        connectBtn.textContent = 'Connected';
        connectBtn.disabled = true;
        transferBtn.disabled = false;

        await updateBalance();
        setupEventListener();

    } catch (error) {
        console.error('Error connecting wallet:', error);
        showStatus('Failed to connect wallet: ' + error.message, 'error');
    }
}

function disconnectWallet() {
    userAddress = null;
    signer = null;
    contract = null;
    walletInfo.classList.add('hidden');
    connectBtn.textContent = 'Connect Wallet';
    connectBtn.disabled = false;
    transferBtn.disabled = true;
    balanceDisplay.textContent = '0';
    eventsList.innerHTML = '<p class="no-events">No transfers yet...</p>';
}

async function updateBalance() {
    try {
        if (!contract || !userAddress) return;

        const balance = await contract.balanceOf(userAddress);
        const decimals = await contract.decimals();
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        
        balanceDisplay.textContent = parseFloat(formattedBalance).toFixed(2);
    } catch (error) {
        console.error('Error updating balance:', error);
        showStatus('Failed to load balance: ' + error.message, 'error');
    }
}

function setupEventListener() {
    if (!contract) return;

    contract.on('Transfer', async (from, to, value, event) => {
        try {
            const decimals = await contract.decimals();
            const amount = ethers.utils.formatUnits(value, decimals);
         
            addEventToList(from, to, amount);
            
            if (to.toLowerCase() === userAddress.toLowerCase() || 
                from.toLowerCase() === userAddress.toLowerCase()) {
                await updateBalance();
            }
        } catch (error) {
            console.error('Error handling Transfer event:', error);
        }
    });
}

function addEventToList(from, to, amount) {
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    const fromShort = `${from.substring(0, 6)}...${from.substring(38)}`;
    const toShort = `${to.substring(0, 6)}...${to.substring(38)}`;
    
    eventItem.innerHTML = `
        <strong>Transfer:</strong> ${fromShort} → ${toShort}<br>
        <strong>Amount:</strong> ${parseFloat(amount).toFixed(2)} ATK
    `;
    
    const noEvents = eventsList.querySelector('.no-events');
    if (noEvents) {
        noEvents.remove();
    }
    
    eventsList.insertBefore(eventItem, eventsList.firstChild);
   
    while (eventsList.children.length > 10) {
        eventsList.removeChild(eventsList.lastChild);
    }
}

async function transferTokens() {
    try {
        const recipient = recipientInput.value.trim();
        const amount = amountInput.value.trim();

        if (!recipient || !amount) {
            showStatus('Please fill in all fields', 'error');
            return;
        }

        if (!ethers.utils.isAddress(recipient)) {
            showStatus('Invalid recipient address', 'error');
            return;
        }

        if (parseFloat(amount) <= 0) {
            showStatus('Amount must be greater than 0', 'error');
            return;
        }

        transferBtn.disabled = true;
        transferBtn.textContent = 'Processing...';
        showStatus('Transaction pending...', 'success');

        const decimals = await contract.decimals();
        const amountWei = ethers.utils.parseUnits(amount, decimals);

        const tx = await contract.transfer(recipient, amountWei);
        
        showStatus('Transaction sent! Waiting for confirmation...', 'success');

        await tx.wait();

        showStatus(`Successfully transferred ${amount} ATK to ${recipient.substring(0, 6)}...${recipient.substring(38)}`, 'success');
    
        recipientInput.value = '';
        amountInput.value = '';

        await updateBalance();

    } catch (error) {
        console.error('Transfer error:', error);

        if (error.code === 4001 || error.message.includes('user rejected')) {
            showStatus('Transaction rejected by user', 'error');
        } else {
            showStatus('Transfer failed: ' + error.message, 'error');
        }
    } finally {
        transferBtn.disabled = false;
        transferBtn.textContent = 'Transfer';
    }
}

function showStatus(message, type) {
    transferStatus.textContent = message;
    transferStatus.className = `status-message ${type}`;

    setTimeout(() => {
        transferStatus.textContent = '';
        transferStatus.className = 'status-message';
    }, 5000);
}

connectBtn.addEventListener('click', connectWallet);
refreshBtn.addEventListener('click', updateBalance);
transferBtn.addEventListener('click', transferTokens);

window.addEventListener('load', function() {
    if (typeof ethers === 'undefined') {
        console.error('ethers.js is not loaded! Please check the CDN link.');
        alert('Error: ethers.js library failed to load. Please refresh the page.');
        return;
    }
    init();
});
