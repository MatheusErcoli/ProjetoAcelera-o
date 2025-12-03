const { Review, Order, User } = require("../models");
const { logAdminAction } = require("../utils/adminLogger");

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

      const order = await Order.findByPk(order_id);
      if (!order)
        return res.status(404).json({ message: "Ordem não encontrada" });

      const isCustomer = order.customer_id === author_id;
      const isProvider = order.provider_id === author_id;
      if (!isCustomer && !isProvider && author_role !== "ADMIN") {
        return res
          .status(403)
          .json({ message: "Somente participantes da ordem podem avaliar" });
      }

      const doneStatuses = ["DONE", "CONCLUIDO", "CONCLUDED"];
      if (!doneStatuses.includes((order.status || "").toUpperCase())) {
        return res
          .status(400)
          .json({ message: "Só é possível avaliar após conclusão do serviço" });
      }

      let finalTarget = target_id || null;
      if (!finalTarget) {
        if (isCustomer) finalTarget = order.provider_id;
        else if (isProvider) finalTarget = order.customer_id;
      }

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

      // Log da criação de avaliação
      if (req.user && req.user.role === "ADMIN") {
        const author = await User.findByPk(author_id, { attributes: ['name'] });
        const target = finalTarget ? await User.findByPk(finalTarget, { attributes: ['name'] }) : null;
        await logAdminAction(
          req.user.id,
          "CREATE",
          "reviews",
          review.id,
          `Avaliação criada por ${author?.name || 'Usuário'} para ${target?.name || 'Usuário'} - Nota: ${rating}/5`
        );
      }

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
      const { providerId, targetId, orderId } = req.query;
      const target = targetId || providerId || null;

      const isAdmin = req.user && req.user.role === "ADMIN";

      if (target && !isAdmin) {
        const all = await Review.findAll({
          where: { target_id: target },
          include: [{ model: User, as: "author", attributes: ["id", "name"] }],
          order: [["created_at", "DESC"]],
        });

        const authored = await Review.findAll({
          where: { author_id: target },
          attributes: ["order_id"],
        });
        const authoredOrderIds = new Set(authored.map((r) => r.order_id));

        const visible = all.filter((r) => authoredOrderIds.has(r.order_id));
        return res.json(visible);
      }

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

  async getAllReviewsAdmin(req, res) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const reviews = await Review.findAll({
        include: [
          { 
            model: User, 
            as: "author", 
            attributes: ["id", "name", "email", "role"] 
          },
          { 
            model: User, 
            as: "target", 
            attributes: ["id", "name", "email", "role"] 
          },
          {
            model: Order,
            as: "order",
            attributes: ["id", "status", "created_at"]
          }
        ],
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

  async toggleReviewStatus(req, res) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { id } = req.params;
      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }

      review.is_active = !review.is_active;
      await review.save();

      const updatedReview = await Review.findByPk(id, {
        include: [
          { 
            model: User, 
            as: "author", 
            attributes: ["id", "name", "email", "role"] 
          },
          { 
            model: User, 
            as: "target", 
            attributes: ["id", "name", "email", "role"] 
          },
          {
            model: Order,
            as: "order",
            attributes: ["id", "status", "created_at"]
          }
        ],
      });

      // Log do toggle de status da avaliação
      await logAdminAction(
        req.user.id,
        review.is_active ? "ACTIVATE" : "DEACTIVATE",
        "reviews",
        review.id,
        `Avaliação de ${updatedReview.author?.name || 'Usuário'} para ${updatedReview.target?.name || 'Usuário'} - Nota: ${updatedReview.rating}/5`
      );

      res.json({ 
        message: `Avaliação ${review.is_active ? 'ativada' : 'desativada'} com sucesso`, 
        review: updatedReview 
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Erro ao alterar status da avaliação", error: err.message });
    }
  },

  async getPendingReviews(req, res) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const completedOrders = await Order.findAll({
        where: { status: "DONE" },
        include: [
          { 
            model: User, 
            as: "provider", 
            attributes: ["id", "name", "email", "role"] 
          },
          { 
            model: User, 
            as: "customer", 
            attributes: ["id", "name", "email", "role"] 
          }
        ],
        order: [["created_at", "DESC"]],
      });

      const pendingReviews = [];

      for (const order of completedOrders) {
        const existingReviews = await Review.findAll({
          where: { order_id: order.id },
          include: [
            { 
              model: User, 
              as: "author", 
              attributes: ["id", "name", "email", "role"] 
            },
            { 
              model: User, 
              as: "target", 
              attributes: ["id", "name", "email", "role"] 
            }
          ]
        });

        const providerReview = existingReviews.find(
          r => r.author_id === order.provider_id
        );

        const customerReview = existingReviews.find(
          r => r.author_id === order.customer_id
        );

        if (!providerReview || !customerReview) {
          pendingReviews.push({
            order: {
              id: order.id,
              status: order.status,
              created_at: order.created_at,
              provider: order.provider,
              customer: order.customer
            },
            provider_review: providerReview || null,
            customer_review: customerReview || null,
            missing_provider_review: !providerReview,
            missing_customer_review: !customerReview
          });
        }
      }

      res.json(pendingReviews);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Erro ao buscar avaliações pendentes", error: err.message });
    }
  },
};
