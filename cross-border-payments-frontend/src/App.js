// // src/App.js
// import React, { useState } from 'react';
// import PaymentForm from './components/PaymentForm';
// import TransactionHistory from './components/TransactionHistory';

// function App() {
//   const [lastTransaction, setLastTransaction] = useState(null);

//   const handlePaymentSuccess = (transactionHash) => {
//     setLastTransaction(transactionHash);
//   };

//   return (
//     <div className="App">
//       <h1>Cross-Border Payment System</h1>
//       <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
//       {lastTransaction && (
//         <div>
//           <p>Last Transaction Hash: {lastTransaction}</p>
//         </div>
//       )}
//       <TransactionHistory />
//     </div>
//   );
// }

// export default App;

//2nd code
// 
// import React, { useState } from 'react';
// import { Box, Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';

// const App = () => {
//   const [receiverAddress, setReceiverAddress] = useState('');
//   const [amount, setAmount] = useState('');
//   const [transactions, setTransactions] = useState([]);

//   // Example of adding a transaction (replace with your actual transaction logic)
//   const handleSendPayment = () => {
//     if (!receiverAddress || !amount) return alert('Please fill in all fields');

//     const newTransaction = {
//       sender: '0xYourAddressHere',
//       receiver: receiverAddress,
//       amount,
//       status: 'Pending',
//       hash: '0xTransactionHashExample'
//     };
//     setTransactions([...transactions, newTransaction]);
//     setReceiverAddress('');
//     setAmount('');
//   };

//   return (
//     <Container maxWidth="md">
//       {/* Header Section */}
//       <Typography variant="h4" gutterBottom sx={{ mt: 4, textAlign: 'center', fontWeight: 'bold' }}>
//         Cross-Border Payment System
//       </Typography>

//       {/* Payment Form */}
//       <Paper sx={{ p: 4, mt: 4, mb: 4, borderRadius: 3 }}>
//         <Typography variant="h5" gutterBottom>
//           Initiate Payment
//         </Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Receiver Address"
//               value={receiverAddress}
//               onChange={(e) => setReceiverAddress(e.target.value)}
//               placeholder="0x..."
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Amount (ETH)"
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="large"
//               fullWidth
//               onClick={handleSendPayment}
//               sx={{ mt: 2 }}
//             >
//               Send Payment
//             </Button>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Transaction History */}
//       <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
//         Transaction History
//       </Typography>
//       {transactions.length > 0 ? (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell><strong>Sender</strong></TableCell>
//                 <TableCell><strong>Receiver</strong></TableCell>
//                 <TableCell><strong>Amount (ETH)</strong></TableCell>
//                 <TableCell><strong>Status</strong></TableCell>
//                 <TableCell><strong>Transaction Hash</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {transactions.map((txn, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{txn.sender}</TableCell>
//                   <TableCell>{txn.receiver}</TableCell>
//                   <TableCell>{txn.amount}</TableCell>
//                   <TableCell>{txn.status}</TableCell>
//                   <TableCell>{txn.hash}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
//           No transactions found.
//         </Typography>
//       )}
//     </Container>
//   );
// };

// export default App;

// //3rd code
// import React, { useState } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Grid
// } from '@mui/material';
// import axios from 'axios';

// const App = () => {
//   const [receiverAddress, setReceiverAddress] = useState('');
//   const [amount, setAmount] = useState('');
//   const [transactions, setTransactions] = useState([]);

//   // Function to handle payment and interact with the backend
//   const handleSendPayment = async () => {
//     if (!receiverAddress || !amount) return alert('Please fill in all fields');

//     try {
//       // Call backend API to initiate payment
//       const response = await axios.post('http://localhost:5000/api/send-payment', {
//         receiverAddress,
//         amount
//       });

//       // Extract response data
//       const { transactionHash, sender } = response.data;

//       // Update transactions list with new transaction
//       const newTransaction = {
//         sender,
//         receiver: receiverAddress,
//         amount,
//         status: 'Completed',
//         hash: transactionHash
//       };

//       setTransactions([...transactions, newTransaction]);
//       setReceiverAddress('');
//       setAmount('');
//     } catch (error) {
//       console.error("Error initiating payment:", error);
//       alert('Failed to initiate payment');
//     }
//   };

//   return (
//     <Container maxWidth="md">
//       {/* Header Section */}
//       <Typography
//         variant="h4"
//         gutterBottom
//         sx={{ mt: 4, textAlign: 'center', fontWeight: 'bold' }}
//       >
//         Cross-Border Payment System
//       </Typography>

//       {/* Payment Form */}
//       <Paper sx={{ p: 4, mt: 4, mb: 4, borderRadius: 3 }}>
//         <Typography variant="h5" gutterBottom>
//           Initiate Payment
//         </Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Receiver Address"
//               value={receiverAddress}
//               onChange={(e) => setReceiverAddress(e.target.value)}
//               placeholder="0x..."
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Amount (ETH)"
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Button
//               variant="contained"
//               color="primary"
//               size="large"
//               fullWidth
//               onClick={handleSendPayment}
//               sx={{ mt: 2 }}
//             >
//               Send Payment
//             </Button>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Transaction History */}
//       <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
//         Transaction History
//       </Typography>
//       {transactions.length > 0 ? (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>
//                   <strong>Sender</strong>
//                 </TableCell>
//                 <TableCell>
//                   <strong>Receiver</strong>
//                 </TableCell>
//                 <TableCell>
//                   <strong>Amount (ETH)</strong>
//                 </TableCell>
//                 <TableCell>
//                   <strong>Status</strong>
//                 </TableCell>
//                 <TableCell>
//                   <strong>Transaction Hash</strong>
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {transactions.map((txn, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{txn.sender}</TableCell>
//                   <TableCell>{txn.receiver}</TableCell>
//                   <TableCell>{txn.amount}</TableCell>
//                   <TableCell>{txn.status}</TableCell>
//                   <TableCell>{txn.hash}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
//           No transactions found.
//         </Typography>
//       )}
//     </Container>
//   );
// };

// export default App;
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid
} from '@mui/material';
import axios from 'axios';

const App = () => {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  // Base URL of your backend
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch all transactions from backend
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

  // Handle payment
  const handleSendPayment = async () => {
    if (!receiverAddress || !amount) return alert('Please fill in all fields');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/initiate-payment`, {
        receiver: receiverAddress,
        amount
      });

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