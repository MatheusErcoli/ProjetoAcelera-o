const { Router } = require("express");
const usersController = require("../controllers/users.controller");
const router = Router();

router.post("/", usersController.createUser);
router.get("/", usersController.getUser);
router.get("/:id", usersController.getUserById);
router.put("/:id", usersController.updateUser);

module.exports = router;
