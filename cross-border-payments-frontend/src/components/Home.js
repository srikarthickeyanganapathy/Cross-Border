// Home.js
import React from 'react';
import { Typography, Container, Paper } from '@mui/material';

const Home = () => (
  <Container maxWidth="md">
    <Paper sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Cross-Border Payment System
      </Typography>
      <Typography variant="body1" paragraph>
        This project enables cross-border payments using Ethereum blockchain technology.
        Users can send transactions seamlessly via MetaMask integration and view the transaction history.
        It demonstrates a secure and efficient way to conduct global payments with minimal fees.
      </Typography>
    </Paper>
  </Container>
);

export default Home;
