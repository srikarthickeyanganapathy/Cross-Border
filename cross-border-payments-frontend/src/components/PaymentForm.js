// src/components/PaymentForm.js
import React, { useState } from 'react';
import { initiatePayment } from '../api';

function PaymentForm({ onPaymentSuccess }) {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await initiatePayment({ receiver, amount });
      onPaymentSuccess(response.data.transactionHash);
      setReceiver('');
      setAmount('');
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Initiate Payment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Receiver Address:</label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount (ETH):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Send Payment'}
        </button>
      </form>
    </div>
  );
}

export default PaymentForm;