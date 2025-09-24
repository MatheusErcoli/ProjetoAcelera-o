const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB conectado");
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Falha ao iniciar:", err.message);
    process.exit(1);
  }
})();
