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
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Connect to Ethereum Network
const web3 = new Web3(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
const contractABI = require('./contractABI.json'); 
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Listen for PaymentInitiated event
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
    timestamp: new Date().toISOString(),
  });

  try {
    await payment.save();
    console.log(`PaymentInitiated event captured for TransactionId: ${transactionId}`);
  } catch (err) {
    console.error('Error saving PaymentInitiated event to MongoDB:', err);
  }
});

// Listen for PaymentCompleted event
contract.events.PaymentCompleted({}, async (error, event) => {
  if (error) {
    console.error('Error in PaymentCompleted event', error);
    return;
  }

  const { transactionId } = event.returnValues;
  const payment = await Payment.findOne({ transactionHash: event.transactionHash });

  if (payment) {
    payment.status = 'Completed';
    payment.timestamp = new Date().toISOString(); // Update timestamp to completion time
    
    try {
      await payment.save();
      console.log(`PaymentCompleted event captured for TransactionId: ${transactionId}`);
    } catch (err) {
      console.error('Error updating PaymentCompleted event in MongoDB:', err);
    }
  }
});

// Endpoint to initiate payment
app.post('/api/initiate-payment', async (req, res) => {
  const { receiver, amount } = req.body;

  if (!receiver || !amount) {
    return res.status(400).json({ error: 'Receiver and amount are required' });
  }

  try {
    const sender = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY1).address;
    const tx = contract.methods.initiatePayment(receiver, web3.utils.toWei(amount, 'ether'));
    const gas = await tx.estimateGas({ from: sender });
    const data = tx.encodeABI();

    const txData = {
      from: sender,
      to: contractAddress,
      data,
      gas,
      maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei'),
      maxFeePerGas: web3.utils.toWei('50', 'gwei'),
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, process.env.PRIVATE_KEY1);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const payment = new Payment({
      sender,
      receiver,
      amount,
      transactionHash: receipt.transactionHash,
      status: 'Initiated',
      timestamp: new Date().toISOString(),
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