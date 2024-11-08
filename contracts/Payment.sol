// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Payment {
    struct Transaction {
        uint256 amount;
        address sender;
        address receiver;
        bool completed;
        uint256 timestamp;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    event PaymentInitiated(uint256 transactionId, address indexed sender, address indexed receiver, uint256 amount);
    event PaymentCompleted(uint256 transactionId, uint256 timestamp);

    function initiatePayment(address _receiver, uint256 _amount) public {
        transactionCount += 1;
        transactions[transactionCount] = Transaction(_amount, msg.sender, _receiver, false, block.timestamp);
        emit PaymentInitiated(transactionCount, msg.sender, _receiver, _amount);
    }

    function completePayment(uint256 _transactionId) public {
        Transaction storage txn = transactions[_transactionId];
        require(txn.receiver == msg.sender, "Only the receiver can complete the transaction.");
        require(!txn.completed, "Transaction already completed.");

        txn.completed = true;
        txn.timestamp = block.timestamp;

        emit PaymentCompleted(_transactionId, block.timestamp);
    }
}