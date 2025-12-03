const { Router } = require("express");
const {
  listProviders,
  getProviderById,
} = require("../controllers/providers.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { User, Service } = require("../models");
const router = Router();

// Função para atualizar serviços do prestador
const updateProviderServices = async (req, res) => {
  try {
    const { id } = req.params;
    const { services } = req.body;

    // Verificar se é o próprio prestador ou admin
    if (req.user.id !== Number(id) && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Não autorizado" });
    }

    const user = await User.findByPk(id);
    if (!user || user.role !== "PRESTADOR") {
      return res.status(404).json({ message: "Prestador não encontrado" });
    }

    if (!Array.isArray(services)) {
      return res.status(400).json({ message: "Serviços deve ser um array" });
    }

    const serviceIds = services.map((s) => (typeof s === "object" ? s.id : s));

    if (serviceIds.length > 0) {
      const existingServices = await Service.findAll({
        where: { id: serviceIds, is_active: true },
      });

      if (existingServices.length !== serviceIds.length) {
        return res.status(400).json({ 
          message: "Um ou mais serviços não existem ou estão inativos" 
        });
      }
    }

    await user.setServices(serviceIds);

    const updated = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Service,
          as: "services",
          where: { is_active: true },
          required: false,
          through: { attributes: [] },
        },
      ],
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      message: "Erro ao atualizar serviços", 
      error: err.message 
    });
  }
};

router.get("/", listProviders);
router.get("/:id", getProviderById);
router.put("/:id/services", authMiddleware, updateProviderServices);

module.exports = router;
