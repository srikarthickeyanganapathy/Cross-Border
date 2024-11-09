import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const API_BASE_URL = 'http://localhost:5000';

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...'); // Debug log
      const response = await axios.get(`${API_BASE_URL}/api/transactions`);
      setTransactions(response.data);
      console.log('Fetched transactions:', response.data); // Debug log
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
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
            {transactions.length > 0 ? (
              transactions.map((txn, index) => (
                <TableRow key={index}>
                  <TableCell>{txn.sender}</TableCell>
                  <TableCell>{txn.receiver}</TableCell>
                  <TableCell>{txn.amount}</TableCell>
                  <TableCell>{txn.transactionHash}</TableCell>
                  <TableCell>{txn.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No transactions available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TransactionHistory;
