const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");
const apiRouter = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "RDAM API",
  });
});

// DB ping
app.get("/db/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({
      db: "ok",
      result: rows[0],
    });
  } catch (err) {
    console.error("❌ Error DB ping:", err.message);
    res.status(500).json({
      db: "error",
      message: err.message,
    });
  }
});

// Router principal
app.use("/api", apiRouter);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Ruta no encontrada",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error general:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: err.message || "Error interno",
  });
});

module.exports = app;