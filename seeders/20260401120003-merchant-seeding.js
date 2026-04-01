"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const merchants = [
      {
        name: "Starbucks Coffee",
        category: "Food & Beverage",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Indomaret",
        category: "Retail",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Telkomsel",
        category: "Telecom",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Pizza Hut",
        category: "Food & Beverage",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Netflix",
        category: "Entertainment",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Merchants", merchants);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Merchants", null, {});
  },
};
