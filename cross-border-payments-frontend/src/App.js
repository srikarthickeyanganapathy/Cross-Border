import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid
} from '@mui/material';
import axios from 'axios';
import { ethers } from 'ethers';

const App = () => {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  const API_BASE_URL = 'http://localhost:5000';

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request MetaMask account
      const signer = provider.getSigner();
      return signer;
    } else {
      alert("Please install MetaMask!");
      return null;
    }
  };

  const handleSendPayment = async () => {
    if (!receiverAddress || !amount) return alert('Please fill in all fields');

    try {
      const signer = await connectToMetaMask();
      if (!signer) return;

      const amountInWei = ethers.utils.parseEther(amount);
      const tx = {
        to: receiverAddress,
        value: amountInWei,
      };

      // Send the payment transaction via MetaMask
      const transactionResponse = await signer.sendTransaction(tx);
      await transactionResponse.wait(); // Wait for the transaction to be mined

      // Post the transaction data to the backend
      const response = await axios.post(`${API_BASE_URL}/api/initiate-payment`, {
        receiver: receiverAddress,
        amount,
      });

      console.log('Payment initiated:', response.data);

      alert('Payment successful!');
      fetchTransactions();
      setReceiverAddress('');
      setAmount('');
    } catch (error) {
      console.error('Error sending payment:', error);
      alert('Failed to send payment');
    }
  };
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom align="center">
        Cross-Border Payment System
      </Typography>
      <Paper sx={{ padding: 4, marginBottom: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Receiver Address"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount (ETH)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>
          <Button variant="contained" fullWidth onClick={handleSendPayment}>
            Send Payment
          </Button>
        </Grid>
      </Paper>

      <Typography variant="h5">Transaction History</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sender</TableCell>
              <TableCell>Receiver</TableCell>
              <TableCell>Amount (ETH)</TableCell>
              <TableCell>Transaction Hash</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn, index) => (
              <TableRow key={index}>
                <TableCell>{txn.sender}</TableCell>
                <TableCell>{txn.receiver}</TableCell>
                <TableCell>{txn.amount}</TableCell>
                <TableCell>{txn.transactionHash}</TableCell>
                <TableCell>{txn.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default App;
