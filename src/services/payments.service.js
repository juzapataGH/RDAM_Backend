const pool = require("../db/pool");
const { buildPlusPagosPayload } = require("./pluspagos.service");

async function iniciarPago({ solicitudId, email }) {
  const [rows] = await pool.query(
    `SELECT id, nro_tramite, estado, email, nombre, apellido
     FROM solicitudes
     WHERE id = ? AND email = ?
     LIMIT 1`,
    [solicitudId, email]
  );

  if (rows.length === 0) {
    return { ok: false, status: 404, message: "Solicitud no encontrada" };
  }

  const solicitud = rows[0];

  if (solicitud.estado !== "PENDIENTE") {
    return {
      ok: false,
      status: 400,
      message: "Solo se puede pagar una solicitud en estado PENDIENTE",
    };
  }

  const pluspagos = buildPlusPagosPayload({ solicitud });

  return {
    ok: true,
    solicitud,
    pluspagos,
  };
}

async function procesarWebhookPago(payload) {
  const { EstadoId, TransaccionComercioId } = payload;

  if (!TransaccionComercioId) {
    return { ok: false, status: 400, message: "Falta TransaccionComercioId" };
  }

  const solicitudId = Number(TransaccionComercioId);

  const [rows] = await pool.query(
    `SELECT id, estado FROM solicitudes WHERE id = ? LIMIT 1`,
    [solicitudId]
  );

  if (rows.length === 0) {
    return { ok: false, status: 404, message: "Solicitud no encontrada" };
  }

  if (String(EstadoId) === "3") {
    await pool.query(
      `UPDATE solicitudes
       SET estado = 'PAGADO',
           fecha_pago = NOW(),
           referencia_pago = ?
       WHERE id = ?`,
      [String(TransaccionComercioId), solicitudId]
    );

    return { ok: true, nuevoEstado: "PAGADO" };
  }

  await pool.query(
    `UPDATE solicitudes
     SET estado = 'RECHAZADO',
         observaciones = 'Pago rechazado por pasarela'
     WHERE id = ?`,
    [solicitudId]
  );

  return { ok: true, nuevoEstado: "RECHAZADO" };
}

module.exports = {
  iniciarPago,
  procesarWebhookPago,
};