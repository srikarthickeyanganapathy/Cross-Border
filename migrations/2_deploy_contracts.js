// migrations/2_deploy_contracts.js
const Payment = artifacts.require("Payment");

module.exports = function (deployer) {
    deployer.deploy(Payment);
};