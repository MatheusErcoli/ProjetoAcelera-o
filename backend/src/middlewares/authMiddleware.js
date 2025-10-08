const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = { authMiddleware };
