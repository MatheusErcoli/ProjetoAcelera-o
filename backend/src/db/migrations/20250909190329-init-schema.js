"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("provider_services", {
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "services", key: "id" },
        onDelete: "CASCADE",
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

    await queryInterface.addConstraint("provider_services", {
      fields: ["provider_id", "service_id"],
      type: "primary key",
      name: "pk_provider_services",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("provider_services");
  },
};
