const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authPublic = require("../middleware/authPublic");
const paymentsService = require("../services/payments.service");
const { buildAutoSubmitHtml } = require("../services/pluspagos.service");

// Ciudadano inicia el pago de una solicitud propia
router.post("/create", authPublic, async (req, res) => {
  const { solicitudId } = req.body;

  if (!solicitudId) {
    return res.status(400).json({
      ok: false,
      message: "solicitudId es requerido",
    });
  }

  const result = await paymentsService.iniciarPago({
    solicitudId,
    email: req.user.email,
  });

  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      message: result.message,
    });
  }

  // URL para abrir en navegador y redirigir realmente a PlusPagos Mock
  const redirectUrl = `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/payments/redirect/${solicitudId}?token=${encodeURIComponent(
    req.headers.authorization.replace("Bearer ", "")
  )}`;

  res.json({
    ok: true,
    message: "Pago inicializado",
    redirectUrl,
    pluspagosAction: result.pluspagos.action,
  });
});

// Ruta para abrir en navegador y hacer POST automático a PlusPagos Mock
router.get("/redirect/:solicitudId", async (req, res) => {
  try {
    const token = req.query.token;
    const solicitudId = Number(req.params.solicitudId);

    if (!token) {
      return res.status(401).send("<h1>Falta token</h1>");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.scope !== "PUBLIC") {
      return res.status(403).send("<h1>Token inválido para pagos públicos</h1>");
    }

    const result = await paymentsService.iniciarPago({
      solicitudId,
      email: payload.email,
    });

    if (!result.ok) {
      return res.status(result.status).send(`<h1>${result.message}</h1>`);
    }

    const html = buildAutoSubmitHtml(result.pluspagos);
    res.send(html);
  } catch (error) {
    res.status(401).send(`<h1>Error de autenticación</h1><p>${error.message}</p>`);
  }
});

// Webhook de la pasarela
router.post("/webhook", async (req, res) => {
  const result = await paymentsService.procesarWebhookPago(req.body);

  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      message: result.message,
    });
  }

  res.json({
    ok: true,
    nuevoEstado: result.nuevoEstado,
  });
});

// Callback de éxito
router.post("/callback/success", (req, res) => {
  console.log("✅ Callback success recibido:", req.body);
  res.json({ ok: true });
});

// Callback de cancelación / rechazo
router.post("/callback/cancel", (req, res) => {
  console.log("❌ Callback cancel recibido:", req.body);
  res.json({ ok: true });
});

// Resultado para el usuario
router.get("/resultado", (req, res) => {
  const { status, solicitudId } = req.query;
  const ok = status === "success";

  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Resultado del pago</title>
  <style>
    body { font-family: system-ui; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f8fafc; }
    .card { background:#fff; padding:32px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.1); max-width:520px; text-align:center; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${ok ? "✅ Pago procesado" : "❌ Pago rechazado"}</h1>
    <p>Solicitud ID: ${solicitudId || "-"}</p>
    <p>${ok ? "La pasarela informó el resultado. Podés volver al sistema." : "No se pudo completar el pago."}</p>
  </div>
</body>
</html>`);
});

module.exports = router;