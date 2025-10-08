"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("addresses", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      logradouro: { type: Sequelize.STRING(150), allowNull: false },
      numero: { type: Sequelize.STRING(20), allowNull: false },
      complemento: { type: Sequelize.STRING(100) },
      bairro: { type: Sequelize.STRING(100), allowNull: false },
      cep: { type: Sequelize.STRING(9), allowNull: false },
      cidade: { type: Sequelize.STRING(100), allowNull: false },
      uf: { type: Sequelize.STRING(2), allowNull: false },
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("addresses");
  },
};
