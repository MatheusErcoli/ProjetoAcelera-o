"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_services", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "services", key: "id" },
        onDelete: "CASCADE",
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      observacoes: { type: Sequelize.TEXT },
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

    await queryInterface.addIndex("order_services", ["order_id"]);
    await queryInterface.addIndex("order_services", ["service_id"]);

    await queryInterface.addConstraint("order_services", {
      fields: ["order_id", "service_id"],
      type: "unique",
      name: "uniq_order_service",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("order_services");
  },
};
