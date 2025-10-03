"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_logs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // precisa permitir null porque usamos SET NULL
        references: { model: "users", key: "id" },
        onDelete: "SET NULL", // mantém o log mesmo se admin for apagado
        onUpdate: "CASCADE",
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      target_table: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      details: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("admin_logs", ["admin_id"]);
    await queryInterface.addIndex("admin_logs", ["target_table"]);
    await queryInterface.addIndex("admin_logs", ["target_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("admin_logs");
  },
};
