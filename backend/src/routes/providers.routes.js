const { Router } = require("express");
const {
  listProviders,
  getProviderById,
} = require("../controllers/providers.controller");
const router = Router();

router.get("/", listProviders);
router.get("/:id", getProviderById);

module.exports = router;
