"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Availability = sequelize.define(
    "Availability",
    {
      weekday: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 0, max: 6 },
      }, // 0=domingo
      start_time: { type: DataTypes.TIME, allowNull: false },
      end_time: { type: DataTypes.TIME, allowNull: false },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    { tableName: "availability", underscored: true }
  );

  return Availability;
};
