const { AdminLog, User } = require("../models");

module.exports = {
  async createLog(req, res) {
    try {
      const admin_id = req.user && req.user.id;
      const { action, target_table, target_id, details } = req.body;

      if (!action || !target_table || !target_id) {
        return res.status(400).json({ message: "Dados incompletos" });
      }

      const log = await AdminLog.create({
        admin_id,
        action,
        target_table,
        target_id,
        details,
      });

      return res.status(201).json({ message: "Log criado", log });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao criar log", error: err.message });
    }
  },

  async getLogs(req, res) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { limit = 50, offset = 0 } = req.query;

      const logs = await AdminLog.findAll({
        include: [
          {
            model: User,
            as: "admin",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const total = await AdminLog.count();

      res.json({
        logs,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar logs", error: err.message });
    }
  },

  async getRecentLogs(req, res) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const logs = await AdminLog.findAll({
        include: [
          {
            model: User,
            as: "admin",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: 10,
      });

      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar logs recentes", error: err.message });
    }
  },
};