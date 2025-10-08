"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("login_codes", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      code: { type: Sequelize.STRING(10), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      used: { type: Sequelize.BOOLEAN, defaultValue: false },
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
    await queryInterface.addIndex("login_codes", ["user_id"]);
    await queryInterface.addIndex("login_codes", ["code"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("login_codes");
  },
};
