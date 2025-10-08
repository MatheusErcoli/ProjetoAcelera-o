"use strict";
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable("reviews", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      rating: { type: Sequelize.TINYINT, allowNull: false },
      comment: { type: Sequelize.STRING(1000) },
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
    await qi.addIndex("reviews", ["order_id"]);
    await qi.addIndex("reviews", ["author_id"]);
    await qi.addIndex("reviews", ["target_id"]);
    // 1 review por autor por order
    await qi.addConstraint("reviews", {
      fields: ["order_id", "author_id"],
      type: "unique",
      name: "uniq_review_per_author_per_order",
    });
  },
  async down(qi) {
    await qi.dropTable("reviews");
  },
};
