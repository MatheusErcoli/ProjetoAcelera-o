"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProviderService = sequelize.define(
    "ProviderService",
    {
      provider_id: { type: DataTypes.INTEGER, allowNull: false },
      service_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "provider_services",
      underscored: true,
    }
  );

  return ProviderService;
};
