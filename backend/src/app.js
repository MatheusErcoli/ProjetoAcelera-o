require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const healthRoutes = require("./routes/health.routes");
const servicesRoutes = require("./routes/services.routes");
const authRoutes = require("./routes/auth.routes");
const providersRoutes = require("./routes/providers.routes");
const usersRoutes = require("./routes/users.routes");
const adminRoutes = require("./routes/admin.routes");
const ordersRoutes = require("./routes/orders.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const availabilityRoutes = require("./routes/availability.routes");
const galleryRoutes = require("./routes/gallery.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.get("/", (req, res) => {
  res.send("API Prestaclimber rodando!");
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Rotas
app.use("/health", healthRoutes);
app.use("/services", servicesRoutes);
app.use("/providers", providersRoutes);
app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/users", usersRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/admin", adminRoutes);
app.use("/availability", availabilityRoutes);
app.use("/gallery", galleryRoutes);

app.use(errorHandler);

module.exports = app;
