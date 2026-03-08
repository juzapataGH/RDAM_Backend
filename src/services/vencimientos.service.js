const pool = require("../db/pool");

async function vencerSolicitudesPendientes() {
  const [result] = await pool.query(
    `UPDATE solicitudes
     SET estado = 'VENCIDO',
         fecha_vencimiento = NOW(),
         observaciones = COALESCE(observaciones, 'Solicitud vencida por falta de pago')
     WHERE estado = 'PENDIENTE'
       AND created_at <= DATE_SUB(NOW(), INTERVAL 60 DAY)`
  );

  return result.affectedRows || 0;
}

async function vencerSolicitudesPublicadas() {
  const [result] = await pool.query(
    `UPDATE solicitudes
     SET estado = 'PUBLICADO_VENCIDO',
         fecha_vencimiento = NOW(),
         observaciones = COALESCE(observaciones, 'Certificado vencido por plazo de validez')
     WHERE estado = 'PUBLICADO'
       AND fecha_publicacion IS NOT NULL
       AND fecha_publicacion <= DATE_SUB(NOW(), INTERVAL 65 DAY)`
  );

  return result.affectedRows || 0;
}

async function ejecutarVencimientos() {
  const pendientes = await vencerSolicitudesPendientes();
  const publicadas = await vencerSolicitudesPublicadas();

  console.log(
    `⏰ Vencimientos ejecutados | PENDIENTE→VENCIDO: ${pendientes} | PUBLICADO→PUBLICADO_VENCIDO: ${publicadas}`
  );

  return {
    pendientes,
    publicadas,
  };
}

module.exports = {
  vencerSolicitudesPendientes,
  vencerSolicitudesPublicadas,
  ejecutarVencimientos,
};