"use strict";
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.STRING(20),
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

    await qi.addIndex("orders", ["status"]);
    await qi.addIndex("orders", ["provider_id"]);
    await qi.addIndex("orders", ["customer_id"]);
  },

  async down(qi) {
    await qi.dropTable("orders");
  },
};
