const jwt = require("jsonwebtoken");

function authPublic(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "Token no enviado",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    console.log("PAYLOAD TOKEN PUBLICO:", payload);

    if (payload.scope !== "Public") {
      return res.status(403).json({
        ok: false,
        message: "Token invalido para scope Public",
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("Error en authPublic:", error.message);

    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
}

module.exports = authPublic;