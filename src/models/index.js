"use strict";
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mariadb",
    logging: false,
  }
);

fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Associations
const {
  User,
  Address,
  Service,
  ProviderService,
  Availability,
  GalleryImage,
  Order,
  Review,
} = db;

if (User && Address) {
  User.hasOne(Address, {
    foreignKey: "user_id",
    as: "address",
    onDelete: "CASCADE",
  });
  Address.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

if (User && Service && ProviderService) {
  User.belongsToMany(Service, {
    through: ProviderService,
    as: "services",
    foreignKey: "provider_id",
    otherKey: "service_id",
  });
  Service.belongsToMany(User, {
    through: ProviderService,
    as: "providers",
    foreignKey: "service_id",
    otherKey: "provider_id",
  });
}

if (User && Availability) {
  User.hasMany(Availability, {
    as: "availability",
    foreignKey: "provider_id",
    onDelete: "CASCADE",
  });
  // ...existing code...
}

if (User && GalleryImage) {
  User.hasMany(GalleryImage, {
    as: "gallery",
    foreignKey: "provider_id",
    onDelete: "CASCADE",
  });
  GalleryImage.belongsTo(User, { as: "provider", foreignKey: "provider_id" });
}

if (User && Order) {
  User.hasMany(Order, { as: "providerOrders", foreignKey: "provider_id" });
  User.hasMany(Order, { as: "customerOrders", foreignKey: "customer_id" });
  Order.belongsTo(User, { as: "provider", foreignKey: "provider_id" });
  Order.belongsTo(User, { as: "customer", foreignKey: "customer_id" });
}

if (Service && Order) {
  Order.belongsTo(Service, { as: "service", foreignKey: "service_id" });
  Service.hasMany(Order, { as: "orders", foreignKey: "service_id" });
}

if (Order && Review && User) {
  Order.hasMany(Review, {
    as: "reviews",
    foreignKey: "order_id",
    onDelete: "CASCADE",
  });
  Review.belongsTo(Order, { as: "order", foreignKey: "order_id" });

  Review.belongsTo(User, { as: "author", foreignKey: "author_id" });
  Review.belongsTo(User, { as: "target", foreignKey: "target_id" });

  User.hasMany(Review, { as: "authoredReviews", foreignKey: "author_id" });
  User.hasMany(Review, { as: "receivedReviews", foreignKey: "target_id" });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
