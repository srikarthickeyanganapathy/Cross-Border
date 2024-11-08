// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Update if your backend has a different URL
});

export const initiatePayment = (paymentData) => API.post('/initiate-payment', paymentData);
export const getTransactions = () => API.get('/transactions');