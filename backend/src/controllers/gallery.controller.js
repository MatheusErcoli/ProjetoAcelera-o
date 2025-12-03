const { GalleryImage } = require("../models");

module.exports = {
  async getGalleryImages(req, res) {
    try {
      const { providerId } = req.query;

      if (!providerId) {
        return res.status(400).json({ message: "providerId é obrigatório" });
      }

      const images = await GalleryImage.findAll({
        where: { provider_id: providerId },
        order: [["created_at", "DESC"]],
      });

      res.json(images);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Erro ao listar imagens da galeria",
        error: err.message,
      });
    }
  },

  async addGalleryImage(req, res) {
    try {
      const { url, description } = req.body;
      const provider_id = req.user.id;

      if (!url) {
        return res.status(400).json({ message: "URL da imagem é obrigatória" });
      }

      const image = await GalleryImage.create({
        provider_id,
        url,
        description: description || "",
      });

      res.status(201).json(image);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Erro ao adicionar imagem",
        error: err.message,
      });
    }
  },

  async deleteGalleryImage(req, res) {
    try {
      const { id } = req.params;
      const provider_id = req.user.id;

      const image = await GalleryImage.findOne({
        where: { id, provider_id },
      });

      if (!image) {
        return res.status(404).json({ message: "Imagem não encontrada" });
      }

      await image.destroy();

      res.json({ message: "Imagem removida com sucesso" });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Erro ao deletar imagem",
        error: err.message,
      });
    }
  },
};
