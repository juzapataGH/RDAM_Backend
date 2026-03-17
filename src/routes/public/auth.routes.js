const pool = require("../../db/pool");
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const otpStore = {};

router.post("/request-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El email es obligatorio",
      });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      codigo,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Código de verificación RDAM",
      text: `Tu código de verificación es: ${codigo}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>RDAM - Verificación de acceso</h2>
          <p>Tu código de verificación es:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
            ${codigo}
          </div>
          <p>Este código vence en 10 minutos.</p>
        </div>
      `,
    });

    console.log("Código enviado a:", email, "Código:", codigo);

    return res.json({
      ok: true,
      message: "Código enviado correctamente",
    });
  } catch (error) {
    console.error("Error en request-code:", error);

    return res.status(500).json({
      ok: false,
      message: "Error enviando el código",
      error: error.message,
    });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        ok: false,
        message: "Email y código son obligatorios",
      });
    }

    const registro = otpStore[email];

    if (!registro) {
      return res.status(400).json({
        ok: false,
        message: "No hay un código activo para ese email",
      });
    }

    if (Date.now() > registro.expiresAt) {
      delete otpStore[email];
      return res.status(401).json({
        ok: false,
        message: "El código expiró",
      });
    }

    if (registro.codigo !== code) {
      return res.status(401).json({
        ok: false,
        message: "Código incorrecto",
      });
    }

    delete otpStore[email];

    const token = jwt.sign(
      {
        email,
        scope: "Public",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      ok: true,
      message: "Código verificado correctamente",
      token,
    });
  } catch (error) {
    console.error("Error en verify-code:", error);

    return res.status(500).json({
      ok: false,
      message: "Error verificando el código",
      error: error.message,
    });
  }
});

router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El email es obligatorio",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT ui.email, r.nombre AS rol
      FROM usuarios_internos ui
      INNER JOIN roles r ON ui.rol_id = r.id
      WHERE ui.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.json({
        ok: true,
        type: "public",
      });
    }

    const rol = rows[0].rol?.toUpperCase();

    if (rol === "ADMIN" || rol === "OPERADOR") {
      return res.json({
        ok: true,
        type: "internal",
      });
    }

    return res.json({
      ok: true,
      type: "public",
    });
  } catch (error) {
    console.error("Error en check-email:", error);

    return res.status(500).json({
      ok: false,
      message: "Error verificando el email",
      error: error.message,
    });
  }
});

module.exports = router;