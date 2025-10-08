"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      whatsapp: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      photo_url: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM("CONTRATANTE", "PRESTADOR", "ADMIN"),
        allowNull: false,
        defaultValue: "CONTRATANTE",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "users",
      underscored: true,
    }
  );

  return User;
};
