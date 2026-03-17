const express = require("express");
const router = express.Router();

const authPublic = require("../../middleware/authPublic");
const solicitudesService = require("../../services/solicitudes.service");
const certificadoService = require("../../services/certificado.service");
// POST /api/public/solicitudes
router.post("/", authPublic, async (req, res) => {
  const { cuil, nombre, apellido, distritoId } = req.body;

  if (!cuil || !nombre || !apellido || !distritoId) {
    return res.status(400).json({
      ok: false,
      message: "cuil, nombre, apellido y distritoId son requeridos",
    });
  }

  const email = req.user.email;

  const result = await solicitudesService.crearSolicitud({
    email,
    cuil,
    nombre,
    apellido,
    distritoId,
  });

  res.status(201).json({
    ok: true,
    ...result,
  });
});

// GET /api/public/solicitudes
router.get("/", authPublic, async (req, res) => {
  const email = req.user.email;
  const rows = await solicitudesService.listarSolicitudes(email);

  res.json({
    ok: true,
    items: rows,
  });
});

// GET /api/public/solicitudes/historial
router.get("/historial", authPublic, async (req, res) => {
  const email = req.user.email;
  const rows = await solicitudesService.listarSolicitudes(email);

  res.json({
    ok: true,
    items: rows,
  });
});

// GET /api/public/solicitudes/:id
router.get("/:id", authPublic, async (req, res) => {
  const email = req.user.email;
  const id = Number(req.params.id);

  const row = await solicitudesService.obtenerSolicitudPorId(email, id);

  if (!row) {
    return res.status(404).json({
      ok: false,
      message: "Solicitud no encontrada",
    });
  }

  res.json({
    ok: true,
    item: row,
  });
});
router.get("/:id/certificado", authPublic, async (req, res) => {
  const email = req.user.email;
  const id = Number(req.params.id);

  const solicitud = await solicitudesService.obtenerSolicitudPublicadaPorId(email, id);

  if (!solicitud) {
    return res.status(404).json({
      ok: false,
      message: "Solicitud no encontrada",
    });
  }

  if (solicitud.estado !== "PUBLICADO") {
    return res.status(400).json({
      ok: false,
      message: "El certificado solo puede descargarse cuando la solicitud está PUBLICADA",
    });
  }

  const pdfBuffer = await certificadoService.generarCertificadoPDF(solicitud);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificado-${solicitud.nro_tramite}.pdf"`
  );

  res.send(pdfBuffer);
});
module.exports = router;