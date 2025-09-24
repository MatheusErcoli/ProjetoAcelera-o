require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const healthRoutes = require("./routes/health.routes");
const servicesRoutes = require("./routes/services.routes");
const providersRoutes = require("./routes/providers.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Rotas
app.use("/health", healthRoutes);
app.use("/services", servicesRoutes);
app.use("/providers", providersRoutes);

// Handler de erro (sempre por último)
app.use(errorHandler);

module.exports = app;
