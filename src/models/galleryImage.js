"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GalleryImage = sequelize.define(
    "GalleryImage",
    {
      image_url: { type: DataTypes.STRING(255), allowNull: false },
      caption: { type: DataTypes.STRING(160) },
    },
    { tableName: "gallery_images", underscored: true }
  );

  return GalleryImage;
};
