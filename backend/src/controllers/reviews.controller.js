const { Review, Order, User } = require("../models");

module.exports = {
  async createReview(req, res) {
    try {
      const author_id = req.user && req.user.id;
      const author_role = req.user && req.user.role;
      const { rating, comment, order_id, target_id } = req.body;

      if (!author_id)
        return res.status(401).json({ message: "Não autorizado" });
      if (!rating || !order_id)
        return res.status(400).json({ message: "Dados incompletos" });

      // verify order exists
      const order = await Order.findByPk(order_id);
      if (!order)
        return res.status(404).json({ message: "Ordem não encontrada" });

      // only participants (customer or provider) or admin can create review
      const isCustomer = order.customer_id === author_id;
      const isProvider = order.provider_id === author_id;
      if (!isCustomer && !isProvider && author_role !== "ADMIN") {
        return res
          .status(403)
          .json({ message: "Somente participantes da ordem podem avaliar" });
      }

      // only allow review when order is DONE/CONCLUIDO
      const doneStatuses = ["DONE", "CONCLUIDO"];
      if (!doneStatuses.includes((order.status || "").toUpperCase())) {
        return res
          .status(400)
          .json({ message: "Só é possível avaliar após conclusão do serviço" });
      }

      // determine target: if provided use it, otherwise pick opposite participant
      let finalTarget = target_id || null;
      if (!finalTarget) {
        if (isCustomer) finalTarget = order.provider_id;
        else if (isProvider) finalTarget = order.customer_id;
      }

      // prevent duplicate review by same author for same order
      const existing = await Review.findOne({ where: { order_id, author_id } });
      if (existing)
        return res.status(409).json({ message: "Você já avaliou esta ordem" });

      const review = await Review.create({
        rating,
        comment,
        order_id,
        author_id,
        target_id: finalTarget,
      });

      return res.status(201).json({ message: "Avaliação criada", review });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Erro ao criar avaliação", error: err.message });
    }
  },

  async getReviews(req, res) {
    try {
      // support query param targetId (generic) and orderId
      const { providerId, targetId, orderId } = req.query;
      const target = targetId || providerId || null;

      // Admin can fetch raw reviews (bypass mutual rule)
      const isAdmin = req.user && req.user.role === "ADMIN";

      if (target && !isAdmin) {
        // fetch reviews where target_id = target, but only those where there is a reciprocal review
        const all = await Review.findAll({
          where: { target_id: target },
          include: [{ model: User, as: "author", attributes: ["id", "name"] }],
          order: [["created_at", "DESC"]],
        });

        // find orders for which 'target' has authored a review
        const authored = await Review.findAll({
          where: { author_id: target },
          attributes: ["order_id"],
        });
        const authoredOrderIds = new Set(authored.map((r) => r.order_id));

        const visible = all.filter((r) => authoredOrderIds.has(r.order_id));
        return res.json(visible);
      }

      // fallback: fetch by order or all
      const where = {};
      if (orderId) where.order_id = orderId;

      const reviews = await Review.findAll({
        where,
        include: [{ model: User, as: "author", attributes: ["id", "name"] }],
        order: [["created_at", "DESC"]],
      });

      res.json(reviews);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Erro ao buscar avaliações", error: err.message });
    }
  },
};
