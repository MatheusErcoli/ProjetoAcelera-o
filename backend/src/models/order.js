"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("REQUESTED", "CONFIRMED", "DONE", "CANCELLED"),
        defaultValue: "REQUESTED",
      },
    },
    {
      tableName: "orders",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: "provider_id", as: "provider" });
    Order.belongsTo(models.User, { foreignKey: "customer_id", as: "customer" });
    Order.belongsToMany(models.Service, {
      through: models.OrderService,
      as: "services",
      foreignKey: "order_id",
      otherKey: "service_id",
    });
  };

  return Order;
};
