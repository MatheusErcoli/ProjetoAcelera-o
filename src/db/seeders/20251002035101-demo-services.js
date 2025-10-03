"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert("users", [
      {
        name: "Administrador",
        email: "admin@climber.com",
        whatsapp: "44999999999",
        photo_url: "https://via.placeholder.com/150",
        role: "ADMIN",
        is_active: true,
        email_verified_at: now,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: "admin@climber.com",
    });
  },
};
