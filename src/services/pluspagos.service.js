const CryptoJS = require("crypto-js");

function encryptString(plainText, secretKey) {
  const key = CryptoJS.SHA256(secretKey);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const combined = iv.concat(encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(combined);
}

function buildPlusPagosPayload({ solicitud, producto = "Certificado RDAM" }) {
  const pluspagosUrl = process.env.PLUSPAGOS_URL;
  const merchantGuid = process.env.PLUSPAGOS_MERCHANT_GUID;
  const secret = process.env.PLUSPAGOS_SECRET_KEY;
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  // Monto fijo de ejemplo: $2500
  const montoPesos = 2500;
  const montoCentavos = String(montoPesos * 100);

  const transaccionId = String(solicitud.id);

  const callbackSuccess = `${appBaseUrl}/api/payments/callback/success?solicitudId=${solicitud.id}`;
  const callbackCancel = `${appBaseUrl}/api/payments/callback/cancel?solicitudId=${solicitud.id}`;

  const urlSuccess = `${appBaseUrl}/api/payments/resultado?status=success&solicitudId=${solicitud.id}`;
  const urlError = `${appBaseUrl}/api/payments/resultado?status=error&solicitudId=${solicitud.id}`;

  const informacion = JSON.stringify({
    producto,
    nombre: solicitud.nombre,
    apellido: solicitud.apellido,
    email: solicitud.email,
    nroTramite: solicitud.nro_tramite,
  });

  return {
    action: pluspagosUrl,
    form: {
      Comercio: merchantGuid,
      TransaccionComercioId: transaccionId,
      Monto: encryptString(montoCentavos, secret),
      CallbackSuccess: encryptString(callbackSuccess, secret),
      CallbackCancel: encryptString(callbackCancel, secret),
      UrlSuccess: encryptString(urlSuccess, secret),
      UrlError: encryptString(urlError, secret),
      Informacion: encryptString(informacion, secret),
      "Producto[0]": producto,
      "MontoProducto[0]": montoCentavos,
    },
  };
}

function buildAutoSubmitHtml({ action, form }) {
  const inputs = Object.entries(form)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, "&quot;")}">`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Redirigiendo a PlusPagos</title>
  <style>
    body { font-family: system-ui; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#0f172a; color:#fff; }
    .box { text-align:center; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Redirigiendo a la pasarela de pago...</h1>
    <p>Por favor aguardá unos segundos.</p>
  </div>
  <form id="pluspagosForm" action="${action}" method="POST">
    ${inputs}
  </form>
  <script>
    document.getElementById("pluspagosForm").submit();
  </script>
</body>
</html>`;
}

module.exports = {
  buildPlusPagosPayload,
  buildAutoSubmitHtml,
};