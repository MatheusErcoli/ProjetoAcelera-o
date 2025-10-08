module.exports = (err, req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Erro interno", detail: err.message });
};
