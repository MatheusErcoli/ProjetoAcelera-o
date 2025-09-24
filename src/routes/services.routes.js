const { Router } = require("express");
const { listServices } = require("../controllers/services.controller");
const router = Router();

router.get("/", listServices);

module.exports = router;
