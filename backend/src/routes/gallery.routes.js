/*const { Router } = require("express");
const {
  getGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
} = require("../controllers/gallery.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = Router();

// Rota pública
router.get("/", getGalleryImages);

// Rotas protegidas
router.post("/", authMiddleware, addGalleryImage);
router.delete("/:id", authMiddleware, deleteGalleryImage);

module.exports = router;*/
