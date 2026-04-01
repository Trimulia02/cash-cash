"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require("bcryptjs");

    const users = [
      {
        name: "Sandika Wijaya",
        email: "sandika@gmail.com",
        password: await bcrypt.hash("12345", 10),
        role: "admin",
        phone: "+6281234567890",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Abyan Setiawan",
        email: "abyan@gmail.com",
        password: await bcrypt.hash("23456", 10),
        role: "user",
        phone: "+6281234567891",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Pakde Kuncoro",
        email: "pakde@gmail.com",
        password: await bcrypt.hash("34567", 10),
        role: "user",
        phone: "+6281234567892",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Budi Santoso",
        email: "budi@gmail.com",
        password: await bcrypt.hash("45678", 10),
        role: "user",
        phone: "+6281234567893",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
