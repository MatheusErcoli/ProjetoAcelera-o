const { Order, OrderService, Service, User } = require("../models");

module.exports = {
  async createOrder(req, res) {
    try {
      const { provider_id, scheduled_at, services } = req.body;
      const customer_id = req.user.id; // vem do token JWT

      if (
        !provider_id ||
        !scheduled_at ||
        !services ||
        !Array.isArray(services)
      ) {
        return res
          .status(400)
          .json({ message: "Dados incompletos ou inválidos." });
      }

      const newOrder = await Order.create({
        provider_id,
        customer_id,
        scheduled_at,
        status: "REQUESTED",
      });

      for (const s of services) {
        await OrderService.create({
          order_id: newOrder.id,
          service_id: s.service_id,
          quantidade: s.quantidade || 1,
          observacoes: s.observacoes || "",
        });
      }

      return res.status(201).json({
        message: "Ordem criada com sucesso!",
        order: newOrder,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Erro ao criar ordem", error: err.message });
    }
  },

  async getOrders(req, res) {
    try {
      const { role, id } = req.user;

      const where =
        role === "provider"
          ? { provider_id: id }
          : role === "customer"
          ? { customer_id: id }
          : {}; // admin vê tudo

      const orders = await Order.findAll({
        where,
        include: [
          { model: User, as: "provider", attributes: ["id", "name", "email"] },
          { model: User, as: "customer", attributes: ["id", "name", "email"] },
          {
            model: Service,
            as: "services",
            attributes: ["id", "name"],
            through: { attributes: ["quantidade", "observacoes"] },
          },
        ],
        order: [["created_at", "DESC"]],
      });

      res.json(orders);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Erro ao listar ordens", error: err.message });
    }
  },

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const { role, id: userId } = req.user;

      const order = await Order.findByPk(id, {
        include: [
          { model: User, as: "provider", attributes: ["id", "name", "email"] },
          { model: User, as: "customer", attributes: ["id", "name", "email"] },
          {
            model: Service,
            as: "services",
            attributes: ["id", "name"],
            through: { attributes: ["quantidade", "observacoes"] },
          },
        ],
      });

      if (!order)
        return res.status(404).json({ message: "Ordem não encontrada" });

      // Checagem de permissão
      if (role === "provider" && order.provider_id !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }
      if (role === "customer" && order.customer_id !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      res.json(order);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erro ao buscar ordem", error: err.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { role, id: userId } = req.user;

      const validStatuses = ["REQUESTED", "CONFIRMED", "DONE", "CANCELLED"];
      if (!validStatuses.includes(status))
        return res.status(400).json({ message: "Status inválido" });

      const order = await Order.findByPk(id);
      if (!order)
        return res.status(404).json({ message: "Ordem não encontrada" });

      if (role === "provider" && order.provider_id !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      order.status = status;
      await order.save();

      res.json({ message: "Status atualizado com sucesso", order });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erro ao atualizar status", error: err.message });
    }
  },

  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const { role, id: userId } = req.user;

      const order = await Order.findByPk(id);
      if (!order)
        return res.status(404).json({ message: "Ordem não encontrada" });

      if (role === "customer" && order.customer_id !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      await OrderService.destroy({ where: { order_id: id } });
      await Order.destroy({ where: { id } });

      res.json({ message: "Ordem deletada com sucesso" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erro ao deletar ordem", error: err.message });
    }
  },
};
