const contractABI = [
  {
    "inputs": [],
    "name": "getValue",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"newValue","type":"uint256"}],
    "name":"setValue",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "anonymous":false,
    "inputs":[{"indexed":false,"internalType":"uint256","name":"newValue","type":"uint256"}],
    "name":"ValueChanged",
    "type":"event"
  }
];

const contractAddress = "0x9a2E12340354d2532b4247da3704D2A5d73Bd189";
