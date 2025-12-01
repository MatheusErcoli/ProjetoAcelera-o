const { User, Address } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Senha incorreta" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
};

module.exports.register = async (req, res) => {
  try {
    const { name, email, whatsapp, password, role, address, services } = req.body;

    // Validações básicas
    if (!name || !email || !whatsapp || !password || !role) {
      return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos" });
    }

    // Verifica se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Cria o usuário
    const user = await User.create({
      name,
      email,
      whatsapp,
      password_hash,
      role: role.toUpperCase(), // Garante que está em maiúsculas
      photo_url: 'https://via.placeholder.com/150', // Foto padrão temporária
    });

    // Cria o endereço se fornecido
    if (address) {
      await Address.create({
        user_id: user.id,
        cep: address.cep,
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento || null,
        bairro: address.bairro,
        cidade: address.cidade,
        uf: address.uf,
      });
    }

    // Associa serviços se for prestador
    if (role.toLowerCase() === 'prestador' && services && services.length > 0) {
      const { ProviderService } = require("../models");
      
      // Cria as associações na tabela provider_services
      const serviceAssociations = services.map(serviceId => ({
        provider_id: user.id,
        service_id: serviceId,
      }));
      
      await ProviderService.bulkCreate(serviceAssociations);
    }

    // Gera token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
};

module.exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'whatsapp', 'photo_url']
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      whatsapp: user.whatsapp,
      photo_url: user.photo_url
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
};
