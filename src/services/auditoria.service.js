const pool = require("../db/pool");

async function registrarCambioEstado({
  solicitudId,
  usuarioInternoId,
  estadoAnterior,
  estadoNuevo,
  accion,
  observaciones = null,
}) {
  await pool.query(
    `INSERT INTO auditoria_solicitudes
     (solicitud_id, usuario_interno_id, estado_anterior, estado_nuevo, accion, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [solicitudId, usuarioInternoId || null, estadoAnterior, estadoNuevo, accion, observaciones]
  );
}

async function listarAuditoriaPorSolicitud(solicitudId, filtros = {}) {
  const { fechaDesde, fechaHasta } = filtros;

  let sql = `
    SELECT 
      a.id,
      a.solicitud_id,
      a.usuario_interno_id,
      ui.nombre,
      ui.apellido,
      ui.email,
      a.estado_anterior,
      a.estado_nuevo,
      a.accion,
      a.observaciones,
      a.created_at
    FROM auditoria_solicitudes a
    LEFT JOIN usuarios_internos ui ON a.usuario_interno_id = ui.id
    WHERE a.solicitud_id = ?
  `;

  const params = [solicitudId];

  if (fechaDesde) {
    sql += ` AND DATE(a.created_at) >= ?`;
    params.push(fechaDesde);
  }

  if (fechaHasta) {
    sql += ` AND DATE(a.created_at) <= ?`;
    params.push(fechaHasta);
  }

  sql += ` ORDER BY a.created_at DESC`;

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  registrarCambioEstado,
  listarAuditoriaPorSolicitud,
};