const bcrypt = require("bcrypt");
const pool = require("../db/pool");
const jwt = require("jsonwebtoken");

function generate6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function requestCode(email) {
  const code = generate6DigitCode();

  const codeHash = await bcrypt.hash(code, 10);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await pool.query(
    `INSERT INTO public_login_tokens (email, code_hash, expires_at)
     VALUES (?, ?, ?)`,
    [email, codeHash, expiresAt]
  );

  await enviarCodigoOTP(email, code);

  return { ok: true };
}

async function verifyCode(email, code) {
  const [rows] = await pool.query(
    `SELECT id, code_hash, expires_at, consumed_at, attempts
     FROM public_login_tokens
     WHERE email = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  if (rows.length === 0) {
    return { ok: false, status: 400, message: "No hay código solicitado para ese email" };
  }

  const row = rows[0];

  if (row.consumed_at) {
    return { ok: false, status: 400, message: "El código ya fue utilizado" };
  }

  if (new Date() > new Date(row.expires_at)) {
    return { ok: false, status: 400, message: "El código expiró" };
  }

  if (row.attempts >= 5) {
    return { ok: false, status: 429, message: "Demasiados intentos. Solicitá un nuevo código." };
  }

  const matches = await bcrypt.compare(code, row.code_hash);

  if (!matches) {
    await pool.query(`UPDATE public_login_tokens SET attempts = attempts + 1 WHERE id = ?`, [row.id]);
    return { ok: false, status: 401, message: "Código inválido" };
  }

  await pool.query(`UPDATE public_login_tokens SET consumed_at = NOW() WHERE id = ?`, [row.id]);

  const token = jwt.sign(
    { email, scope: "PUBLIC" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_PUBLIC_EXPIRES || "1h" }
  );

  return { ok: true, token };
}

module.exports = { requestCode, verifyCode };