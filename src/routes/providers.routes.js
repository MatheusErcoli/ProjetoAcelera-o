const { Router } = require("express");
const {
  listProviders,
  getProviderById,
} = require("../controllers/providers.controller");
const router = Router();

// GET /providers?cidade=Campo%20Mour%C3%A3o&uf=PR&serviceId=1&weekday=2
router.get("/", listProviders);
router.get("/:id", getProviderById);

module.exports = router;
