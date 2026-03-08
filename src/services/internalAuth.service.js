const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

async function login({ email, password }) {
  const [rows] = await pool.query(
    `SELECT 
        ui.id,
        ui.nombre,
        ui.apellido,
        ui.email,
        ui.password_hash,
        ui.activo,
        r.id AS rol_id,
        r.nombre AS rol_nombre,
        d.id AS distrito_id,
        d.nombre AS distrito_nombre
     FROM usuarios_internos ui
     INNER JOIN roles r ON ui.rol_id = r.id
     LEFT JOIN distritos d ON ui.distrito_id = d.id
     WHERE ui.email = ?
     LIMIT 1`,
    [email]
  );

  if (rows.length === 0) {
    return { ok: false, status: 401, message: "Credenciales inválidas" };
  }

  const user = rows[0];

  if (!user.activo) {
    return { ok: false, status: 403, message: "Usuario inactivo" };
  }

  const matches = await bcrypt.compare(password, user.password_hash);

  if (!matches) {
    return { ok: false, status: 401, message: "Credenciales inválidas" };
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      rolId: user.rol_id,
      rol: user.rol_nombre,
      distritoId: user.distrito_id,
      distrito: user.distrito_nombre,
      scope: "INTERNAL",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_INTERNAL_EXPIRES || "8h" }
  );

  return {
    ok: true,
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rolId: user.rol_id,
      rol: user.rol_nombre,
      distritoId: user.distrito_id,
      distrito: user.distrito_nombre,
    },
  };
}

module.exports = { login };