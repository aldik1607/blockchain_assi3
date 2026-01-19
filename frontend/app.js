class TokenDApp {
    constructor(contractAddress, abi) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.initUI();
    }

    initUI() {
        this.connectBtn = document.getElementById("connectBtn");
        this.transferBtn = document.getElementById("transferBtn");
        this.accountSpan = document.getElementById("account");
        this.balanceSpan = document.getElementById("balance");
        this.errorP = document.getElementById("error");
        this.eventLog = document.getElementById("eventLog");

        this.connectBtn.onclick = () => this.connect();
        this.transferBtn.onclick = () => this.transfer();
    }

    async connect() {
        try {
            if (!window.ethereum) throw new Error("MetaMask not found");
            
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            const address = await this.signer.getAddress();
            
            this.contract = new ethers.Contract(this.contractAddress, this.abi, this.signer);
            
            this.accountSpan.textContent = address;
            this.errorP.textContent = "Connected!";
            this.errorP.style.color = "var(--accent-color)";

            await this.updateBalance();
            this.setupEventListeners();
        } catch (err) {
            this.showError(err);
        }
    }

    async updateBalance() {
        try {
            const address = await this.signer.getAddress();
            const balance = await this.contract.balanceOf(address);
            this.balanceSpan.textContent = ethers.formatUnits(balance, 18);
        } catch (err) {
            console.error(err);
        }
    }

    setupEventListeners() {
        this.contract.on("Transfer", (from, to, value) => {
            const entry = document.createElement("p");
            entry.textContent = `Transfer: ${ethers.formatUnits(value, 18)} to ${to.substring(0,6)}...`;
            this.eventLog.prepend(entry);
            this.updateBalance();
        });
    }

    async estimateGas(to, amount) {
        try {
            const gas = await this.contract.transfer.estimateGas(to, amount);
            document.getElementById("gasEstimate").textContent = gas.toString();
            return gas;
        } catch (err) {
            document.getElementById("gasEstimate").textContent = "Fails (revert)";
            throw err;
        }
    }

    async transfer() {
        try {
            const to = document.getElementById("transferAddress").value;
            const val = document.getElementById("transferAmount").value;
            if (!to || !val) throw new Error("Fields required");

            const amount = ethers.parseUnits(val, 18);
            await this.estimateGas(to, amount);

            const tx = await this.contract.transfer(to, amount);
            this.errorP.textContent = "Pending...";
            
            await tx.wait();
            this.errorP.textContent = "Success!";
            this.errorP.style.color = "var(--accent-color)";
        } catch (err) {
            this.showError(err);
        }
    }

    showError(err) {
        if (err.code === "ACTION_REJECTED") {
            this.errorP.textContent = "Rejected by user";
        } else {
            this.errorP.textContent = err.reason || err.message;
        }
        this.errorP.style.color = "var(--error-color)";
    }
}

const tokenABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const contractAddress = "0x9a2E12340354d2532b4247da3704D2A5d73Bd189";
const dapp = new TokenDApp(contractAddress, tokenABI);