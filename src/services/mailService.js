const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // 587 => false
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function enviarCodigoOTP(destinatario, codigo) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: destinatario,
    subject: "Código de verificación RDAM",
    text: `Tu código de verificación es: ${codigo}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>RDAM - Verificación de acceso</h2>
        <p>Tu código de verificación es:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
          ${codigo}
        </div>
        <p>Este código vence en unos minutos.</p>
      </div>
    `,
  });
}

module.exports = { enviarCodigoOTP };