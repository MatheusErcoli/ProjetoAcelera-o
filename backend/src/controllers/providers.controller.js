const { Op, literal } = require("sequelize");
const { User, Address, Service, Availability } = require("../models");

exports.listProviders = async (req, res, next) => {
  try {
    const { cidade, uf, serviceId, weekday } = req.query;

    const whereUser = { role: "PRESTADOR", is_active: true };
    const include = [
      {
        model: Address,
        as: "address",
        required: !!(cidade || uf),
        where: {
          ...(cidade ? { cidade } : {}),
          ...(uf ? { uf } : {}),
        },
      },
      {
        model: Service,
        as: "services",
        required: !!serviceId,
        where: serviceId ? { id: serviceId, is_active: true } : undefined,
        through: { attributes: [] },
      },
      {
        model: Availability,
        as: "availability",
        required: !!weekday,
        where: weekday
          ? { weekday: Number(weekday), is_active: true }
          : undefined,
      },
    ];

    const rows = await User.findAll({
      where: whereUser,
      include,
      order: [["name", "ASC"]],
    });

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await User.findOne({
      where: { id, role: "PRESTADOR", is_active: true },
      include: [
        { model: Address, as: "address" },
        { model: Service, as: "services", through: { attributes: [] } },
        { model: Availability, as: "availability" },
      ],
    });
    if (!row)
      return res.status(404).json({ message: "Prestador não encontrado" });
    res.json(row);
  } catch (err) {
    next(err);
  }
};
