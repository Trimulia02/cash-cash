"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transactions = [
      {
        walletId: 1,
        amount: 50000,
        type: "debit",
        direction: "Starbucks",
        description: "Coffee purchase",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        walletId: 1,
        amount: 25000,
        type: "credit",
        direction: "Salary",
        description: "Monthly salary",
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        walletId: 2,
        amount: 75000,
        type: "debit",
        direction: "Indomaret",
        description: "Groceries",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        walletId: 3,
        amount: 30000,
        type: "debit",
        direction: "Telkomsel",
        description: "Mobile credit",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Transactions", transactions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Transactions", null, {});
  },
};
