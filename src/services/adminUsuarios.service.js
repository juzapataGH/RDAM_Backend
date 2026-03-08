const bcrypt = require("bcrypt");
const pool = require("../db/pool");

async function listarUsuariosInternos() {
  const [rows] = await pool.query(
    `SELECT 
        ui.id,
        ui.nombre,
        ui.apellido,
        ui.email,
        ui.activo,
        ui.created_at,
        r.id AS rol_id,
        r.nombre AS rol,
        d.id AS distrito_id,
        d.nombre AS distrito
     FROM usuarios_internos ui
     INNER JOIN roles r ON ui.rol_id = r.id
     LEFT JOIN distritos d ON ui.distrito_id = d.id
     ORDER BY ui.created_at DESC`
  );

  return rows;
}

async function crearUsuarioInterno({ nombre, apellido, email, password, rolId, distritoId }) {
  const [exists] = await pool.query(
    `SELECT id FROM usuarios_internos WHERE email = ? LIMIT 1`,
    [email]
  );

  if (exists.length > 0) {
    return { ok: false, status: 400, message: "Ya existe un usuario con ese email" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO usuarios_internos
     (nombre, apellido, email, password_hash, rol_id, distrito_id, activo)
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [nombre, apellido, email, passwordHash, rolId, distritoId || null]
  );

  return {
    ok: true,
    id: result.insertId,
  };
}

async function activarUsuario(id) {
  const [result] = await pool.query(
    `UPDATE usuarios_internos
     SET activo = TRUE
     WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 0) {
    return { ok: false, status: 404, message: "Usuario no encontrado" };
  }

  return { ok: true };
}

async function desactivarUsuario(id) {
  const [result] = await pool.query(
    `UPDATE usuarios_internos
     SET activo = FALSE
     WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 0) {
    return { ok: false, status: 404, message: "Usuario no encontrado" };
  }

  return { ok: true };
}

module.exports = {
  listarUsuariosInternos,
  crearUsuarioInterno,
  activarUsuario,
  desactivarUsuario,
};