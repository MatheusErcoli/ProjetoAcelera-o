"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Buscar usuários
    const [users] = await queryInterface.sequelize.query(`
      SELECT id, email FROM users
      WHERE email IN ('joao@climber.com', 'maria@climber.com');
    `);

    const joao = users.find((u) => u.email === "joao@climber.com");
    const maria = users.find((u) => u.email === "maria@climber.com");

    if (!joao || !maria) {
      throw new Error("Usuários João e Maria não encontrados.");
    }

    // Criar uma ordem
    await queryInterface.bulkInsert("orders", [
      {
        provider_id: joao.id,
        customer_id: maria.id,
        status: "REQUESTED",
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM orders WHERE status = 'REQUESTED';
    `);
  },
};
