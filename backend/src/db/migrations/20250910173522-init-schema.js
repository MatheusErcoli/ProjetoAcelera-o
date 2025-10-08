"use strict";
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable("availability", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      weekday: { type: Sequelize.TINYINT, allowNull: false }, // 0..6
      start_time: { type: Sequelize.TIME, allowNull: false },
      end_time: { type: Sequelize.TIME, allowNull: false },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
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
    await qi.addIndex("availability", ["provider_id", "weekday"]);
  },
  async down(qi) {
    await qi.dropTable("availability");
  },
};
