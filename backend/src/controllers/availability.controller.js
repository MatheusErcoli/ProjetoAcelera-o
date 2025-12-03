const { Availability, Order, OrderService } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  async createAvailability(req, res) {
    try {
      const { weekday, start_time, end_time } = req.body;
      const provider_id = req.user.id;

      if (weekday === undefined || !start_time || !end_time) {
        return res.status(400).json({ message: "Dados incompletos" });
      }

      if (weekday < 0 || weekday > 6) {
        return res.status(400).json({ message: "Dia da semana inválido (0-6)" });
      }

      // Validar formato de horário
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({ message: "Formato de horário inválido (HH:MM)" });
      }

      // Verificar se já existe disponibilidade neste dia e horário
      const existing = await Availability.findOne({
        where: {
          provider_id,
          weekday,
          start_time,
          end_time,
        },
      });

      if (existing) {
        return res.status(400).json({ 
          message: "Já existe uma disponibilidade para este dia e horário" 
        });
      }

      const availability = await Availability.create({
        provider_id,
        weekday,
        start_time,
        end_time,
        is_active: true,
      });

      res.status(201).json(availability);
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        message: "Erro ao criar disponibilidade", 
        error: err.message 
      });
    }
  },

  async getAvailabilities(req, res) {
    try {
      const { providerId } = req.params;

      const availabilities = await Availability.findAll({
        where: { 
          provider_id: providerId,
          is_active: true 
        },
        order: [
          ["weekday", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      res.json(availabilities);
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        message: "Erro ao listar disponibilidades", 
        error: err.message 
      });
    }
  },

  async getAvailableSlots(req, res) {
    try {
      const { providerId } = req.params;
      const { date } = req.query; // formato: YYYY-MM-DD

      if (!date) {
        return res.status(400).json({ message: "Data é obrigatória (formato: YYYY-MM-DD)" });
      }

      const [year, month, day] = date.split('-').map(Number);
      const requestedDate = new Date(year, month - 1, day);
      const weekday = requestedDate.getDay();

      const availabilities = await Availability.findAll({
        where: {
          provider_id: providerId,
          weekday,
          is_active: true,
        },
      });

      if (availabilities.length === 0) {
        return res.json({ date, weekday, slots: [] });
      }

      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const orders = await Order.findAll({
        where: {
          provider_id: providerId,
          status: { [Op.in]: ["REQUESTED", "CONFIRMED"] },
        },
        include: [
          {
            model: OrderService,
            as: "orderServices",
            where: {
              scheduled_at: {
                [Op.between]: [startOfDay, endOfDay],
              },
            },
            attributes: ["scheduled_at"],
          },
        ],
      });

      const occupiedSlots = new Set();
      orders.forEach((order) => {
        if (order.orderServices) {
          order.orderServices.forEach((service) => {
            if (service.scheduled_at) {
              const scheduledTime = new Date(service.scheduled_at);
              const timeStr = `${String(scheduledTime.getHours()).padStart(2, "0")}:${String(
                scheduledTime.getMinutes()
              ).padStart(2, "0")}`;
              occupiedSlots.add(timeStr);
            }
          });
        }
      });

      const availableSlots = [];
      
      availabilities.forEach((avail) => {
        const [startHour, startMin] = avail.start_time.split(":").map(Number);
        const [endHour, endMin] = avail.end_time.split(":").map(Number);

        let currentHour = startHour;
        let currentMin = startMin;

        while (
          currentHour < endHour ||
          (currentHour === endHour && currentMin < endMin)
        ) {
          const timeStr = `${String(currentHour).padStart(2, "0")}:${String(
            currentMin
          ).padStart(2, "0")}`;

          if (!occupiedSlots.has(timeStr)) {
            availableSlots.push({
              time: timeStr,
              available: true,
            });
          }

          currentMin += 60;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
        }
      });

      res.json({
        date,
        weekday,
        slots: availableSlots.sort((a, b) => a.time.localeCompare(b.time)),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        message: "Erro ao buscar horários disponíveis", 
        error: err.message 
      });
    }
  },

  async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      let { weekday, start_time, end_time, is_active } = req.body;
      const provider_id = req.user.id;

      const availability = await Availability.findOne({
        where: { id, provider_id },
      });

      if (!availability) {
        return res.status(404).json({ message: "Disponibilidade não encontrada" });
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

      if (weekday !== undefined) {
        if (weekday < 0 || weekday > 6) {
          return res.status(400).json({ message: "Dia da semana inválido (0-6)" });
        }
        availability.weekday = weekday;
      }

      if (start_time !== undefined && start_time !== null) {
        if (!timeRegex.test(start_time)) {
          return res.status(400).json({ message: "Formato de horário inicial inválido (HH:MM)" });
        }
        start_time = start_time.substring(0, 5);
        availability.start_time = start_time;
      }

      if (end_time !== undefined && end_time !== null) {
        if (!timeRegex.test(end_time)) {
          return res.status(400).json({ message: "Formato de horário final inválido (HH:MM)" });
        }
        end_time = end_time.substring(0, 5);
        availability.end_time = end_time;
      }

      if (is_active !== undefined) {
        availability.is_active = is_active;
      }

      await availability.save();

      res.json(availability);
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        message: "Erro ao atualizar disponibilidade", 
        error: err.message 
      });
    }
  },

  async deleteAvailability(req, res) {
    try {
      const { id } = req.params;
      const provider_id = req.user.id;

      const availability = await Availability.findOne({
        where: { id, provider_id },
      });

      if (!availability) {
        return res.status(404).json({ message: "Disponibilidade não encontrada" });
      }

      await availability.destroy();

      res.json({ message: "Disponibilidade removida com sucesso" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        message: "Erro ao deletar disponibilidade", 
        error: err.message 
      });
    }
  },
};
