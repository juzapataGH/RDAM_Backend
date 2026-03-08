const express = require("express");
const router = express.Router();

const authInternal = require("../../middleware/authInternal");
const solicitudesService = require("../../services/solicitudes.service");

/**
 * =====================================
 * LISTAR SOLICITUDES (ADMIN / OPERADOR)
 * =====================================
 */
router.get("/", authInternal, async (req, res) => {
  try {
    const { estado, fechaDesde, fechaHasta } = req.query;

    const solicitudes = await solicitudesService.listarSolicitudesInternas(
      req.user,
      { estado, fechaDesde, fechaHasta }
    );

    res.json({
      ok: true,
      filtros: {
        estado: estado || null,
        fechaDesde: fechaDesde || null,
        fechaHasta: fechaHasta || null,
      },
      items: solicitudes,
    });

  } catch (error) {
    console.error("❌ Error listar solicitudes internas:", error);

    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message
    });
  }
});


/**
 * =====================================
 * PUBLICAR SOLICITUD
 * =====================================
 */
router.put("/:id/publicar", authInternal, async (req, res) => {
  try {
    const solicitudId = Number(req.params.id);

    const result = await solicitudesService.publicarSolicitud(solicitudId, req.user);

    if (!result.ok) {
      return res.status(result.status).json({
        ok: false,
        message: result.message
      });
    }

    res.json({
      ok: true,
      estado: result.estado
    });

  } catch (error) {
    console.error("❌ Error publicar solicitud:", error);

    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message
    });
  }
});

module.exports = router;