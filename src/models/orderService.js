"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderService = sequelize.define(
    "OrderService",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      observacoes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "order_services",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  OrderService.associate = (models) => {
    OrderService.belongsTo(models.Order, {
      foreignKey: "order_id",
      as: "order",
      onDelete: "CASCADE",
    });

    OrderService.belongsTo(models.Service, {
      foreignKey: "service_id",
      as: "service",
      onDelete: "CASCADE",
    });
  };

  return OrderService;
};
