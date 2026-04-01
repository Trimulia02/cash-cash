"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const wallets = [
      {
        userId: 1,
        balance: 500000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        balance: 250000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 3,
        balance: 100000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 4,
        balance: 750000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Wallets", wallets);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Wallets", null, {});
  },
};
