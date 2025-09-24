"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.STRING(255), allowNull: true },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "services",
      underscored: true,
    }
  );

  return Service;
};
