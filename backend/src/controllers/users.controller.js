const { User, Address, Service } = require("../models");
const bcrypt = require("bcrypt");

module.exports = {
  async createUser(req, res) {
    try {
      const {
        name,
        email,
        whatsapp,
        photo_url,
        role,
        password,
        address,
      } = req.body;

      // Basic validation
      if (!name || !email || !whatsapp || !photo_url || !password) {
        return res.status(400).json({ message: "Campos obrigatórios faltando" });
      }

      // Check unique constraints: email and whatsapp
      const existingByEmail = await User.findOne({ where: { email } });
      if (existingByEmail) {
        return res.status(409).json({ message: "Email já cadastrado" });
      }

      const existingByWhatsapp = await User.findOne({ where: { whatsapp } });
      if (existingByWhatsapp) {
        return res.status(409).json({ message: "Whatsapp já cadastrado" });
      }

      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const sequelize = User.sequelize;
      const result = await sequelize.transaction(async (t) => {
        const newUser = await User.create(
          {
            name,
            email,
            whatsapp,
            photo_url,
            role: role || undefined,
            password_hash,
          },
          { transaction: t }
        );

        if (address && typeof address === "object") {
          await newUser.createAddress(
            {
              logradouro: address.logradouro,
              numero: address.numero,
              complemento: address.complemento,
              bairro: address.bairro,
              cep: address.cep,
              cidade: address.cidade,
              uf: address.uf,
            },
            { transaction: t }
          );
        }

        return newUser;
      });

      // Reload with address to return
      const created = await User.findByPk(result.id, {
        attributes: { exclude: ["password_hash"] },
        include: [{ model: Address, as: "address" }],
      });

      return res.status(201).json(created);
    } catch (err) {
      console.error(err);
      // Handle specific sequelize unique constraint errors (fallback)
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ message: "Conflito de unicidade", error: err.message });
      }
      return res.status(500).json({ message: "Erro ao criar usuário", error: err.message });
    }
  },

  async getUser(req, res) {
    try {
      // Buscar todos os usuários primeiro
      const users = await User.findAll({
        attributes: { exclude: ["password_hash"] },
        include: [
          { model: Address, as: "address" }
        ],
        order: [["id", "ASC"]],
      });

      // Para cada usuário, buscar serviços apenas se for prestador
      const usersWithServices = await Promise.all(
        users.map(async (user) => {
          const userData = user.toJSON();
          
          if (user.role === 'PRESTADOR') {
            // Buscar serviços apenas para prestadores
            const userWithServices = await User.findByPk(user.id, {
              attributes: { exclude: ["password_hash"] },
              include: [
                { model: Address, as: "address" },
                {
                  model: Service, 
                  as: "services", 
                  through: { attributes: [] },
                  required: false
                }
              ]
            });
            return userWithServices.toJSON();
          }
          
          // Para não prestadores, retornar sem o campo services
          return userData;
        })
      );

      return res.json(usersWithServices);

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao listar usuários", error: err.message });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      if (!id || Number.isNaN(Number(id))) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ["password_hash"] },
        include: [{ model: Address, as: "address" }],
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao buscar usuário", error: err.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      if (!id || Number.isNaN(Number(id))) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const {
        name,
        email,
        whatsapp,
        photo_url,
        role,
        is_active,
        password,
        address,
      } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const sequelize = User.sequelize;

      await sequelize.transaction(async (t) => {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (whatsapp !== undefined) updates.whatsapp = whatsapp;
        if (photo_url !== undefined) updates.photo_url = photo_url;
        if (role !== undefined) updates.role = role;
        if (is_active !== undefined) updates.is_active = is_active;
        if (password !== undefined && password !== null && password !== "") {
          const saltRounds = 10;
          updates.password_hash = await bcrypt.hash(password, saltRounds);
        }

        // Only update if there are fields
        if (Object.keys(updates).length > 0) {
          await user.update(updates, { transaction: t });
        }

        if (address && typeof address === "object") {
          // se o usuario ja tiver um endereco, atualize-o; caso contrario, crie um novo
          const existingAddress = await Address.findOne({ where: { user_id: user.id }, transaction: t });
          const addrPayload = {
            logradouro: address.logradouro,
            numero: address.numero,
            complemento: address.complemento,
            bairro: address.bairro,
            cep: address.cep,
            cidade: address.cidade,
            uf: address.uf,
          };

          if (existingAddress) {
            await existingAddress.update(addrPayload, { transaction: t });
          } else {
            await user.createAddress(addrPayload, { transaction: t });
          }
        }
      });

      const updated = await User.findByPk(id, {
        attributes: { exclude: ["password_hash"] },
        include: [{ model: Address, as: "address" }],
      });

      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao atualizar usuário", error: err.message });
    }
  },

  async deleteUser(req, res) {

    
    return res.status(501).json({ message: "Não implementado" });
  },
};
