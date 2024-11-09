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
const contractABI = require('./contractABI.json'); 
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Listen for events from the contract
contract.events.PaymentInitiated({}, async (error, event) => {
  if (error) {
    console.error('Error in PaymentInitiated event', error);
    return;
  }

  const { transactionId, sender, receiver, amount } = event.returnValues;
  const payment = new Payment({
    sender,
    receiver,
    amount: web3.utils.fromWei(amount, 'ether'),
    transactionHash: event.transactionHash,
    status: 'Initiated',
  });

  await payment.save();
  console.log(`PaymentInitiated event captured for TransactionId: ${transactionId}`);
});

contract.events.PaymentCompleted({}, async (error, event) => {
  if (error) {
    console.error('Error in PaymentCompleted event', error);
    return;
  }

  const { transactionId, timestamp } = event.returnValues;
  const payment = await Payment.findOne({ transactionHash: event.transactionHash });

  if (payment) {
    payment.status = 'Completed';
    payment.timestamp = timestamp;
    await payment.save();
    console.log(`PaymentCompleted event captured for TransactionId: ${transactionId}`);
  }
});

// Endpoint to initiate payment
app.post('/api/initiate-payment', async (req, res) => {
  const { receiver, amount } = req.body;

  if (!receiver || !amount) {
    return res.status(400).json({ error: 'Receiver and amount are required' });
  }

  try {
    // Get the sender address from the private key
    const sender = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY1).address;

    // Create the transaction to call the smart contract
    const tx = contract.methods.initiatePayment(receiver, web3.utils.toWei(amount, 'ether'));

    // Estimate gas for the transaction
    const gas = await tx.estimateGas({ from: sender });
    const data = tx.encodeABI();

    // Define the transaction data
    const txData = {
      from: sender,
      to: contractAddress,
      data,
      gas,
      maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei'),
      maxFeePerGas: web3.utils.toWei('50', 'gwei'),
    };

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(txData, process.env.PRIVATE_KEY1);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Save transaction in MongoDB with the transaction receipt details
    const payment = new Payment({
      sender,
      receiver,
      amount,
      transactionHash: receipt.transactionHash, // Store the transaction hash
      status: 'Initiated', // Mark as 'Initiated' for now
      timestamp: receipt.timestamp,
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
