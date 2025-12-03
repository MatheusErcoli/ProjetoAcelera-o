const { Order, OrderService, Service, User, Availability } = require("../models");
const { logAdminAction } = require("../utils/adminLogger");
const { Op } = require("sequelize");

module.exports = {
  async createOrder(req, res) {
    try {
      const { provider_id, scheduled_at, services } = req.body;
      const customer_id = req.user.id;

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

      // Validar disponibilidade do prestador
      const scheduledDate = new Date(scheduled_at);
      const weekday = scheduledDate.getDay();
      const scheduledTime = `${String(scheduledDate.getHours()).padStart(2, "0")}:${String(
        scheduledDate.getMinutes()
      ).padStart(2, "0")}`;

      // Verificar se o prestador tem disponibilidade para este dia da semana e horário
      const availability = await Availability.findOne({
        where: {
          provider_id,
          weekday,
          is_active: true,
        },
      });

      if (!availability) {
        return res.status(400).json({ 
          message: "Prestador não disponível neste dia da semana" 
        });
      }

      // Verificar se o horário está dentro do range de disponibilidade
      const [availStart] = availability.start_time.split(":");
      const [availEnd] = availability.end_time.split(":");
      const [schedHour] = scheduledTime.split(":");
      
      if (parseInt(schedHour) < parseInt(availStart) || parseInt(schedHour) >= parseInt(availEnd)) {
        return res.status(400).json({ 
          message: "Horário solicitado fora do horário de atendimento do prestador" 
        });
      }

      // Verificar se já existe agendamento confirmado para este horário
      const startOfHour = new Date(scheduledDate);
      startOfHour.setMinutes(0, 0, 0);
      
      const endOfHour = new Date(scheduledDate);
      endOfHour.setMinutes(59, 59, 999);

      const existingOrder = await Order.findOne({
        where: {
          provider_id,
          status: { [Op.in]: ["REQUESTED", "CONFIRMED"] },
        },
        include: [
          {
            model: OrderService,
            as: "orderServices",
            where: {
              scheduled_at: {
                [Op.between]: [startOfHour, endOfHour],
              },
            },
            required: true,
          },
        ],
      });

      if (existingOrder) {
        return res.status(400).json({ 
          message: "Este horário já está ocupado. Por favor, escolha outro horário." 
        });
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
          scheduled_at: s.scheduled_at || scheduled_at || null,
        });
      }

      if (req.user && req.user.role === "ADMIN") {
        const provider = await User.findByPk(provider_id, { attributes: ['name'] });
        const customer = await User.findByPk(customer_id, { attributes: ['name'] });
        await logAdminAction(
          req.user.id,
          "CREATE",
          "orders",
          newOrder.id,
          `Ordem criada: ${customer?.name || 'Cliente'} contratou ${provider?.name || 'Prestador'} - ${services.length} serviço(s)`
        );
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
        role === "PRESTADOR"
          ? { provider_id: id }
          : role === "CONTRATANTE"
          ? { customer_id: id }
          : {};

      const orders = await Order.findAll({
        where,
        include: [
          { model: User, as: "provider", attributes: ["id", "name", "email"] },
          { model: User, as: "customer", attributes: ["id", "name", "email"] },
          {
            model: Service,
            as: "services",
            attributes: ["id", "name"],
            through: {
              attributes: ["quantidade", "observacoes", "scheduled_at"],
            },
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
            through: {
              attributes: ["quantidade", "observacoes", "scheduled_at"],
            },
          },
        ],
      });

      if (!order)
        return res.status(404).json({ message: "Ordem não encontrada" });

      if (role === "PRESTADOR" && order.provider_id !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }
      if (role === "CONTRATANTE" && order.customer_id !== userId) {
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

      const validStatuses = ["REQUESTED", "CONFIRMED", "DONE", "CONCLUDED", "CANCELLED"];
      if (!validStatuses.includes(status))
        return res.status(400).json({ message: "Status inválido" });

      const order = await Order.findByPk(id);
      if (!order)
        return res.status(404).json({ message: "Ordem não encontrada" });

      if (role === "PRESTADOR" && order.provider_id !== userId) {
        return res.status(403).json({ message: "Não autorizado - esta ordem pertence a outro prestador" });
      }

      if (role === "CONTRATANTE" && order.customer_id !== userId) {
        return res.status(403).json({ message: "Não autorizado - esta ordem pertence a outro cliente" });
      }

      if (role === "CONTRATANTE" && ["CONFIRMED", "DONE", "CONCLUDED"].includes(status)) {
        return res.status(403).json({ message: "Apenas o prestador pode confirmar ou marcar como concluído" });
      }

      order.status = status;
      await order.save();

      if (req.user && req.user.role === "ADMIN") {
        const orderWithUsers = await Order.findByPk(id, {
          include: [
            { model: User, as: "provider", attributes: ["name"] },
            { model: User, as: "customer", attributes: ["name"] },
          ],
        });
        await logAdminAction(
          req.user.id,
          "UPDATE",
          "orders",
          order.id,
          `Ordem #${order.id} (${orderWithUsers.customer?.name} → ${orderWithUsers.provider?.name}): status alterado para ${status}`
        );
      }

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

      if (role === "CONTRATANTE" && order.customer_id !== userId) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      await OrderService.destroy({ where: { order_id: id } });
      
      if (req.user && req.user.role === "ADMIN") {
        await logAdminAction(
          req.user.id,
          "DELETE",
          "orders",
          order.id,
          `Ordem #${order.id} deletada`
        );
      }
      
      await Order.destroy({ where: { id } });

      res.json({ message: "Ordem deletada com sucesso" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erro ao deletar ordem", error: err.message });
    }
  },
};
