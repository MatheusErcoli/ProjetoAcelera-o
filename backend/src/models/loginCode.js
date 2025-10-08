"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LoginCode = sequelize.define(
    "LoginCode",
    {
      code: { type: DataTypes.STRING(10), allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      used: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "login_codes", underscored: true }
  );

  return LoginCode;
};
