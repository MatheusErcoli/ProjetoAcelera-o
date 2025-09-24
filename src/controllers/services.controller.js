const { Service } = require("../models");

exports.listServices = async (req, res, next) => {
  try {
    const rows = await Service.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
