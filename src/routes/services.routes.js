const { Router } = require("express");
const servicesController = require("../controllers/services.controller");
const router = Router();

router.post("/", servicesController.createService);
router.get("/", servicesController.getServices);
router.put("/:id", servicesController.updateServices);

module.exports = router;
