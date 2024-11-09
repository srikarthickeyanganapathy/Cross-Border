import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Container, TextField, Button, Typography, Grid, lighten } from '@mui/material';

const Wallet = () => {
  const [address, setAddress] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [currency] = useState('ETH'); // Keeping currency as ETH for now

  const API_BASE_URL = 'http://localhost:5000'; // Your backend URL
  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request MetaMask account access
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();
      setAddress(walletAddress);
      console.log(`Connected wallet: ${walletAddress}`);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const logTransaction = async (transactionHash) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/initiate-payment`, {
        sender: address,
        receiver,
        amount,
        transactionHash
      });
      console.log('Transaction logged in MongoDB:', response.data);
    } catch (error) {
      console.error('Error logging transaction in MongoDB:', error);
    }
  };

  const handleSend = async () => {
    if (!receiver || !amount) {
      return alert('Please enter both receiver address and amount');
    }
  
    console.log(`Sending ${amount} ${currency} to ${receiver}`);
    
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request MetaMask account access
        const signer = provider.getSigner();
  
        // Parse the amount to send in Wei
        const amountInWei = ethers.utils.parseEther(amount);
  
        // Define the transaction details
        const transaction = {
          to: receiver,        // Receiver's Ethereum address
          value: amountInWei,  // Amount to send, in Wei
        };
  
        // Send the transaction
        const transactionResponse = await signer.sendTransaction(transaction);
  
        // Wait for the transaction to be mined
        await transactionResponse.wait();
  
        console.log(`Transaction successful with hash: ${transactionResponse.hash}`);
        alert(`Transaction successful! Hash: ${transactionResponse.hash}`);

        // Log transaction in MongoDB
        await logTransaction(transactionResponse.hash);
      } else {
        alert('Please install MetaMask to proceed.');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please check the console for details.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Ethereum Wallet
      </Typography>
      <Button variant="contained" onClick={connectWallet}>
        Connect Wallet
      </Button>
      {address && (
        <Typography variant="subtitle1" align="center" gutterBottom>
          Connected Wallet Address: {address}
        </Typography>
      )}
      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Receiver Address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
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
        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={handleSend}>
            Send Payment
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Wallet;
