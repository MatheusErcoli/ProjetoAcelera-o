const { Service } = require("../models");

module.exports = {

  async createService(req, res, next) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const newService = await Service.create({
        name,
        description
      });

      return res.status(201).json(newService);

    } catch (err) {
        return next(err);
    }
  },

  async getServices(req, res, next) {
    try {
      const services = await Service.findAll({
        where: { is_active: true },
        order: [["id", "ASC"]],
      });
      return res.json(services);
    } catch (err) {
      return next(err);
    }
  },

  async updateServices(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ message: "id é obrigatório" });
      }

      const updateService = await Service.findByPk(id);
      if (!updateService) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      const toUpdate = {};
      if (typeof name !== 'undefined') toUpdate.name = name;
      if (typeof description !== 'undefined') toUpdate.description = description;
      if (typeof is_active !== 'undefined') toUpdate.is_active = is_active;

      await updateService.update(toUpdate);

      return res.json(updateService);

    } catch (err) {
        return next(err);
    }
  },
  
};
