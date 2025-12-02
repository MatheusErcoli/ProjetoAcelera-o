"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const orders = await queryInterface.sequelize.query(
      `
      SELECT id, provider_id, customer_id FROM orders
      ORDER BY id DESC LIMIT 1;
    `,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (orders.length === 0) {
      console.log("Nenhuma ordem encontrada, pulando criação de reviews");
      return;
    }

    const order = orders[0];

    const existingReviews = await queryInterface.sequelize.query(
      `SELECT id FROM reviews WHERE order_id = ${order.id}`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existingReviews.length === 0) {
      await queryInterface.bulkInsert("reviews", [
        {
          order_id: order.id,
          author_id: order.customer_id,
          target_id: order.provider_id,
          rating: 5,
          comment: "Serviço excelente! Resolveu tudo muito rápido.",
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ]);

      await queryInterface.bulkInsert("reviews", [
        {
          order_id: order.id,
          author_id: order.provider_id,
          target_id: order.customer_id,
          rating: 5,
          comment: "Ótima cliente, super organizada no agendamento.",
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM reviews 
      WHERE comment IN (
        'Serviço excelente! Resolveu tudo muito rápido.',
        'Ótima cliente, super organizada no agendamento.'
      );
    `);
  },
};
