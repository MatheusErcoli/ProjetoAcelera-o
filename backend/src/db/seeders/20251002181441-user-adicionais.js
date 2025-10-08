"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash("123456", 10);

    // Verificar se os usuários já existem
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT email FROM users WHERE email IN ('joao@climber.com', 'maria@climber.com')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingEmails = existingUsers.map(user => user.email);
    
    const usersToInsert = [
      {
        name: "Prestador João",
        email: "joao@climber.com",
        whatsapp: "44988887777",
        photo_url: "https://via.placeholder.com/150",
        role: "PRESTADOR",
        is_active: true,
        email_verified_at: now,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Contratante Maria",
        email: "maria@climber.com",
        whatsapp: "44977776666",
        photo_url: "https://via.placeholder.com/150",
        role: "CONTRATANTE",
        is_active: true,
        email_verified_at: now,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      },
    ].filter(user => !existingEmails.includes(user.email));

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert("users", usersToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: ["joao@climber.com", "maria@climber.com"],
    });
  },
};