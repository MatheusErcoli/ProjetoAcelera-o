"use strict";

module.exports = {
  async up(qi, Sequelize) {
    await qi.addColumn("order_services", "scheduled_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(qi) {
    await qi.removeColumn("order_services", "scheduled_at");
  },
};
