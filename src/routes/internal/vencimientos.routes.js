const express = require("express");
const router = express.Router();

const authInternal = require("../../middleware/authInternal");
const { ejecutarVencimientos } = require("../../services/vencimientos.service");

router.post("/ejecutar", authInternal, async (req, res) => {
  try {
    const result = await ejecutarVencimientos();

    res.json({
      ok: true,
      message: "Vencimientos ejecutados manualmente",
      result,
    });
  } catch (error) {
    console.error("❌ Error ejecutar vencimientos:", error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
});

module.exports = router;