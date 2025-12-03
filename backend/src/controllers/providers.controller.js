const { Op, literal } = require("sequelize");
const { User, Address, Service, Availability, Review } = require("../models");

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
          ...(cidade ? { cidade: { [Op.like]: `%${cidade}%` } } : {}),
          ...(uf ? { uf: { [Op.like]: `%${uf}%` } } : {}),
        },
      },
      {
        model: Service,
        as: "services",
        required: !!serviceId,
        where: serviceId ? { id: serviceId, is_active: true } : { is_active: true },
        through: { attributes: [] },
      },
      {
        model: Availability,
        as: "availability",
        required: !!weekday,
        where: weekday
          ? { weekday: Number(weekday) }
          : undefined,
      },
    ];

    const rows = await User.findAll({
      where: whereUser,
      include,
      order: [["name", "ASC"]],
    });

    const providersWithRatings = await Promise.all(
      rows.map(async (provider) => {
        const reviews = await Review.findAll({
          where: { target_id: provider.id, is_active: true },
        });
        
        const averageRating = reviews.length > 0
          ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
          : 0;
        
        return {
          ...provider.toJSON(),
          averageRating,
          reviewCount: reviews.length
        };
      })
    );

    res.json(providersWithRatings);
  } catch (err) {
    next(err);
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await User.findOne({
      where: { id, role: "PRESTADOR" },
      include: [
        { model: Address, as: "address" },
        { model: Service, as: "services", where: { is_active: true }, required: false, through: { attributes: [] } },
        { model: Availability, as: "availability" },
      ],
    });
    if (!row)
      return res.status(404).json({ message: "Prestador não encontrado" });
    
    const reviews = await Review.findAll({
      where: { target_id: id, is_active: true },
    });
    
    const averageRating = reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 0;
    
    const providerData = {
      ...row.toJSON(),
      averageRating,
      reviewCount: reviews.length
    };
    
    res.json(providerData);
  } catch (err) {
    next(err);
  }
};
