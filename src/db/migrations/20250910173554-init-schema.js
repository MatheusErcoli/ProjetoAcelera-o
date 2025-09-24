"use strict";
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable("orders", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "services", key: "id" },
      },
      status: {
        type: Sequelize.ENUM("REQUESTED", "CONFIRMED", "DONE", "CANCELED"),
        allowNull: false,
        defaultValue: "REQUESTED",
      },
      scheduled_at: { type: Sequelize.DATE },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
    await qi.addIndex("orders", ["provider_id"]);
    await qi.addIndex("orders", ["customer_id"]);
    await qi.addIndex("orders", ["service_id"]);
    await qi.addIndex("orders", ["status"]);
  },
  async down(qi) {
    await qi.dropTable("orders");
    await qi.sequelize.query("DROP TYPE IF EXISTS enum_orders_status"); // alguns dialetos mantêm o enum
  },
};
