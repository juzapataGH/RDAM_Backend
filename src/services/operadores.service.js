const pool = require("../db/pool");

async function listarOperadores() {
  const [rows] = await pool.query(
    `
    SELECT 
      ui.id,
      ui.nombre,
      ui.apellido,
      ui.email,
      ui.distrito_id,
      ui.activo,
      ui.created_at,
      d.nombre AS distrito
    FROM usuarios_internos ui
    INNER JOIN roles r ON ui.rol_id = r.id
    LEFT JOIN distritos d ON ui.distrito_id = d.id
    WHERE r.nombre = 'OPERADOR'
    ORDER BY ui.created_at DESC
    `
  );

  return rows;
}

async function crearOperador({ nombre, apellido, email, passwordHash, distritoId }) {
  const [result] = await pool.query(
    `
    INSERT INTO usuarios_internos
    (nombre, apellido, email, password_hash, rol_id, distrito_id, activo)
    VALUES (?, ?, ?, ?, 2, ?, true)
    `,
    [nombre, apellido, email, passwordHash, distritoId]
  );

  return { id: result.insertId };
}

async function editarOperador(id, { nombre, apellido, email, distritoId }) {
  const [result] = await pool.query(
    `
    UPDATE usuarios_internos
    SET nombre = ?, apellido = ?, email = ?, distrito_id = ?
    WHERE id = ? AND rol_id = 2
    `,
    [nombre, apellido, email, distritoId, id]
  );

  return result.affectedRows > 0;
}

async function eliminarOperador(id) {
  const [result] = await pool.query(
    `
    UPDATE usuarios_internos
    SET activo = false
    WHERE id = ? AND rol_id = 2
    `,
    [id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  listarOperadores,
  crearOperador,
  editarOperador,
  eliminarOperador,
};