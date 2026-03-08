const jwt = require("jsonwebtoken");

function authInternal(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: "Falta token Bearer",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.scope !== "INTERNAL") {
      return res.status(403).json({
        ok: false,
        message: "Token inválido para acceso interno",
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      message: "Token interno inválido o expirado",
    });
  }
}

module.exports = authInternal;