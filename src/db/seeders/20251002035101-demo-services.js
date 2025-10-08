"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash("123456", 10);

    // Verificar se o usuário admin já existe
    const existingAdmin = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@climber.com'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length === 0) {
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
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: "admin@climber.com",
    });
  },
};