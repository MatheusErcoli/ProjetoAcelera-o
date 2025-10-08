"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AdminLog = sequelize.define(
    "AdminLog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      target_table: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      target_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admin_logs",
      underscored: true,
      timestamps: false,
    }
  );

  return AdminLog;
};
