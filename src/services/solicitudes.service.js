const pool = require("../db/pool");
const auditoriaService = require("./auditoria.service");

function buildNroTramite() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rnd = String(Math.floor(1000 + Math.random() * 9000));

  return `RDAM-${yyyy}${mm}${dd}-${rnd}`;
}

async function crearSolicitud({ email, cuil, nombre, apellido, distritoId }) {

  const distritoIdFinal = distritoId || 1;

  console.log("Distrito usado:", distritoIdFinal);

  const nroTramite = buildNroTramite();

  await pool.query(
    `INSERT INTO solicitudes
     (email, cuil, nombre, apellido, distrito_id, nro_tramite, estado)
     VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
    [email, cuil, nombre, apellido, distritoIdFinal, nroTramite]
  );

  return {
    nroTramite,
    estado: "PENDIENTE",
  };
}

async function listarSolicitudes(email) {
  const [rows] = await pool.query(
    `SELECT 
        s.id,
        s.nro_tramite,
        s.estado,
        s.referencia_pago,
        s.fecha_pago,
        s.fecha_publicacion,
        s.fecha_vencimiento,
        s.created_at,
        s.updated_at,
        s.cuil,
        s.nombre,
        s.apellido,
        s.distrito_id,
        d.nombre AS distrito
     FROM solicitudes s
     INNER JOIN distritos d ON s.distrito_id = d.id
     WHERE s.email = ?
     ORDER BY s.created_at DESC`,
    [email]
  );

  return rows;
}

async function obtenerSolicitudPorId(email, id) {
  const [rows] = await pool.query(
    `SELECT 
        s.id,
        s.nro_tramite,
        s.estado,
        s.referencia_pago,
        s.fecha_pago,
        s.fecha_publicacion,
        s.fecha_vencimiento,
        s.created_at,
        s.updated_at,
        s.cuil,
        s.nombre,
        s.apellido,
        s.email,
        s.distrito_id,
        d.nombre AS distrito
     FROM solicitudes s
     INNER JOIN distritos d ON s.distrito_id = d.id
     WHERE s.email = ? AND s.id = ?
     LIMIT 1`,
    [email, id]
  );

  return rows[0] || null;
}

async function obtenerSolicitudPublicadaPorId(email, id) {
  const [rows] = await pool.query(
    `SELECT 
        s.id,
        s.nro_tramite,
        s.estado,
        s.email,
        s.cuil,
        s.nombre,
        s.apellido,
        s.distrito_id,
        d.nombre AS distrito,
        s.referencia_pago,
        s.fecha_pago,
        s.fecha_publicacion,
        s.fecha_vencimiento,
        s.created_at,
        s.updated_at
     FROM solicitudes s
     INNER JOIN distritos d ON s.distrito_id = d.id
     WHERE s.email = ? AND s.id = ?
     LIMIT 1`,
    [email, id]
  );

  return rows[0] || null;
}

async function listarSolicitudesInternas(user, filtros = {}) {
  const { estado, fechaDesde, fechaHasta, q } = filtros;

  let sql = `
    SELECT 
      s.*,
      d.nombre AS distrito
    FROM solicitudes s
    INNER JOIN distritos d ON s.distrito_id = d.id
    WHERE 1 = 1
  `;

  const params = [];

  // Si es operador, solo ve su distrito
  if (user.rol !== "ADMIN") {
    sql += ` AND s.distrito_id = ?`;
    params.push(user.distritoId);
  }

  if (estado) {
    sql += ` AND s.estado = ?`;
    params.push(estado);
  }

  if (fechaDesde) {
    sql += ` AND DATE(s.created_at) >= ?`;
    params.push(fechaDesde);
  }

  if (fechaHasta) {
    sql += ` AND DATE(s.created_at) <= ?`;
    params.push(fechaHasta);
  }

  if (q) {
    sql += `
      AND (
        s.nro_tramite LIKE ?
        OR s.cuil LIKE ?
        OR s.nombre LIKE ?
        OR s.apellido LIKE ?
        OR s.email LIKE ?
      )
    `;

    const like = `%${q}%`;
    params.push(like, like, like, like, like);
  }

  sql += ` ORDER BY s.created_at DESC`;

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function publicarSolicitud(solicitudId, user) {

  const [rows] = await pool.query(
    `SELECT id, estado
     FROM solicitudes
     WHERE id = ?
     LIMIT 1`,
    [solicitudId]
  );

  if (rows.length === 0) {
    return { ok: false, status: 404, message: "Solicitud no encontrada" };
  }

  const solicitud = rows[0];

  if (solicitud.estado !== "PAGADO") {
    return {
      ok: false,
      status: 400,
      message: "Solo se puede publicar una solicitud en estado PAGADO",
    };
  }

  const [result] = await pool.query(
    `UPDATE solicitudes
     SET estado = 'PUBLICADO',
         fecha_publicacion = NOW()
     WHERE id = ?`,
    [solicitudId]
  );

  if (result.affectedRows === 0) {
    return { ok: false, status: 404, message: "No se pudo actualizar la solicitud" };
  }

  await auditoriaService.registrarCambioEstado({
    solicitudId,
    usuarioInternoId: user.id,
    estadoAnterior: "PAGADO",
    estadoNuevo: "PUBLICADO",
    accion: "PUBLICAR_SOLICITUD",
    observaciones: "Solicitud publicada por usuario interno",
  });

  return { ok: true, estado: "PUBLICADO" };
}

module.exports = {
  crearSolicitud,
  listarSolicitudes,
  obtenerSolicitudPorId,
  obtenerSolicitudPublicadaPorId,
  listarSolicitudesInternas,
  publicarSolicitud,
};