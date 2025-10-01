"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      token: { type: DataTypes.STRING(255), allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "refresh_tokens", underscored: true }
  );

  return RefreshToken;
};
