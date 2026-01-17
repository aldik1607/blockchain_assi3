let provider;
let signer;
let contract;

const connectBtn = document.getElementById("connectBtn");
const readBtn = document.getElementById("readBtn");
const updateBtn = document.getElementById("updateBtn");
const inputValue = document.getElementById("inputValue");
const accountSpan = document.getElementById("account");
const valueSpan = document.getElementById("value");
const errorP = document.getElementById("error");

connectBtn.onclick = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not installed");

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    const address = await signer.getAddress();
    accountSpan.textContent = address;

    contract = new ethers.Contract(contractAddress, contractABI, signer);

    errorP.textContent = " Connected successfully!";
  } catch (err) {
    errorP.textContent = err.message;
  }
};

readBtn.onclick = async () => {
  try {
    if (!contract) throw new Error("Contract not initialized");

    const code = await provider.getCode(contractAddress);
    if (code === "0x") throw new Error("No contract found at this address!");

    const value = await contract.getValue();
    valueSpan.textContent = value.toString();
    errorP.textContent = " Value read successfully!";
  } catch (err) {
    errorP.textContent = err.message;
  }
};

updateBtn.onclick = async () => {
  try {
    if (!contract) throw new Error("Contract not initialized");

    const newValue = inputValue.value;
    if (newValue === "") throw new Error("Enter a value first");

    const tx = await contract.setValue(newValue);
    await tx.wait();

    const updated = await contract.getValue();
    valueSpan.textContent = updated.toString();
    errorP.textContent = " Value updated successfully!";
  } catch (err) {
    if (err.code === 4001) {
      errorP.textContent = " Transaction cancelled by user";
    } else {
      errorP.textContent = err.message;
    }
  }
};
