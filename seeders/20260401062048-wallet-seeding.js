"use strict";

const { UPDATE } = require("sequelize/lib/query-types");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    let data = [
      {
        balance: 100000,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
    ];
    await queryInterface.bulkInsert("Wallets", data);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Wallets", null, {});
  },
};
