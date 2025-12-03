const { Service } = require("../models");
const { logAdminAction } = require("../utils/adminLogger");

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

      // Log da criação de serviço
      if (req.user && req.user.role === "ADMIN") {
        await logAdminAction(
          req.user.id,
          "CREATE",
          "services",
          newService.id,
          `Serviço criado: ${newService.name}`
        );
      }

      return res.status(201).json(newService);

    } catch (err) {
        return next(err);
    }
  },

  async getServices(req, res, next) {
    try {
      const services = await Service.findAll({
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

      // Se o serviço foi desativado, remover de todos os prestadores
      if (is_active === false) {
        const { ProviderService } = require("../models");
        await ProviderService.destroy({
          where: { service_id: id }
        });
      }

      // Log da atualização de serviço
      if (req.user && req.user.role === "ADMIN") {
        const changes = [];
        if (typeof name !== 'undefined') changes.push("nome");
        if (typeof description !== 'undefined') changes.push("descrição");
        if (typeof is_active !== 'undefined') changes.push(is_active ? "ativado" : "desativado");
        
        const action = typeof is_active !== 'undefined' ? (is_active ? "ACTIVATE" : "DEACTIVATE") : "UPDATE";
        const details = changes.length > 0 
          ? `${updateService.name} - Alterações: ${changes.join(", ")}`
          : `${updateService.name} - Atualizado`;
        
        await logAdminAction(
          req.user.id,
          action,
          "services",
          updateService.id,
          details
        );
      }

      return res.json(updateService);

    } catch (err) {
        return next(err);
    }
  },
  
};
