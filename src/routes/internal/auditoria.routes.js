const express = require("express");
const router = express.Router();

const authInternal = require("../../middleware/authInternal");
const auditoriaService = require("../../services/auditoria.service");

router.get("/solicitud/:id", authInternal, async (req, res) => {
  try {
    const solicitudId = Number(req.params.id);
    const { fechaDesde, fechaHasta } = req.query;

    const rows = await auditoriaService.listarAuditoriaPorSolicitud(
      solicitudId,
      { fechaDesde, fechaHasta }
    );

    res.json({
      ok: true,
      filtros: {
        fechaDesde: fechaDesde || null,
        fechaHasta: fechaHasta || null,
      },
      items: rows,
    });
  } catch (error) {
    console.error("❌ Error listar auditoría:", error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
});

module.exports = router;