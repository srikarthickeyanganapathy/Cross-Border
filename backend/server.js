require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Web3 } = require('web3');
const Payment = require('./models/Payment');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Connect to Ethereum Network
const web3 = new Web3(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "PaymentCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "transactionId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "PaymentInitiated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "transactionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "transactions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "completed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "initiatePayment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_transactionId",
          "type": "uint256"
        }
      ],
      "name": "completePayment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Endpoint to initiate payment
app.post('/api/initiate-payment', async (req, res) => {
  const { receiver, amount } = req.body;

  if (!receiver || !amount) {
    return res.status(400).json({ error: 'Receiver and amount are required' });
  }

  try {
    const sender = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY).address;

    const tx = contract.methods.initiatePayment(receiver, web3.utils.toWei(amount, 'ether'));
    console.log("Amount in Wei:", web3.utils.toWei(amount, 'ether'));
    
    const gas = await tx.estimateGas({ from: sender });
    const data = tx.encodeABI();
    const txData = {
      from: sender,
      to: contractAddress,
      data,
      gas,
      maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei'),
      maxFeePerGas: web3.utils.toWei('50', 'gwei')
    };

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(txData, process.env.PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Save transaction in MongoDB
    const payment = new Payment({
      sender,
      receiver,
      amount,
      transactionHash: receipt.transactionHash,
      status: 'Completed'
    });

    await payment.save();
    res.json({ message: 'Payment initiated', transactionHash: receipt.transactionHash });

  } catch (err) {
    console.error('Error initiating payment:', err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Endpoint to fetch all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Payment.find().sort({ _id: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Endpoint to get transaction by hash
app.get('/api/transaction/:hash', async (req, res) => {
  const { hash } = req.params;

  try {
    const payment = await Payment.findOne({ transactionHash: hash });

    if (!payment) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(payment);
  } catch (err) {
    console.error('Error retrieving transaction:', err);
    res.status(500).json({ error: 'Failed to retrieve transaction' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));