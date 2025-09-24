"use strict";
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable("gallery_images", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      image_url: { type: Sequelize.STRING(255), allowNull: false },
      caption: { type: Sequelize.STRING(160) },
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
    await qi.addIndex("gallery_images", ["provider_id"]);
  },
  async down(qi) {
    await qi.dropTable("gallery_images");
  },
};
