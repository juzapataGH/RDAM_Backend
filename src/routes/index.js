const express = require("express");
const router = express.Router();

// Importar rutas existentes
const publicAuthRoutes = require("./public/auth.routes");
const publicSolicitudesRoutes = require("./public/solicitudes.routes");
const paymentsRoutes = require("./payments.routes");
const internalAuthRoutes = require("./internal/auth.routes");
const internalSolicitudesRoutes = require("./internal/solicitudes.routes");
const internalVencimientosRoutes = require("./internal/vencimientos.routes");
const internalAdminUsuariosRoutes = require("./internal/admin.usuarios.routes");
const internalAuditoriaRoutes = require("./internal/auditoria.routes");
// Ruta base de la API
router.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API RDAM funcionando"
  });
});

// Autenticación pública (ciudadanos)
router.use("/public/auth", publicAuthRoutes);

// Solicitudes del ciudadano
router.use("/public/solicitudes", publicSolicitudesRoutes);

// Pagos
router.use("/payments", paymentsRoutes);

// Auth interna
router.use("/internal/auth", internalAuthRoutes);
router.use("/internal/solicitudes", internalSolicitudesRoutes);
router.use("/internal/vencimientos", internalVencimientosRoutes);
router.use("/internal/admin/usuarios", internalAdminUsuariosRoutes);
router.use("/internal/auditoria", internalAuditoriaRoutes);
module.exports = router;