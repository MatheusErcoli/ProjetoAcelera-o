"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      status: {
        type: DataTypes.ENUM("REQUESTED", "CONFIRMED", "DONE", "CANCELED"),
        allowNull: false,
        defaultValue: "REQUESTED",
      },
      scheduled_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: "orders", underscored: true }
  );

  return Order;
};
