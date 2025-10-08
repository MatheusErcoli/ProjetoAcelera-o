"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Address = sequelize.define(
    "Address",
    {
      logradouro: { type: DataTypes.STRING(150), allowNull: false },
      numero: { type: DataTypes.STRING(20), allowNull: false },
      complemento: { type: DataTypes.STRING(100), allowNull: true },
      bairro: { type: DataTypes.STRING(100), allowNull: false },
      cep: { type: DataTypes.STRING(9), allowNull: false },
      cidade: { type: DataTypes.STRING(100), allowNull: false },
      uf: { type: DataTypes.STRING(2), allowNull: false },
    },
    {
      tableName: "addresses",
      underscored: true,
    }
  );

  return Address;
};
