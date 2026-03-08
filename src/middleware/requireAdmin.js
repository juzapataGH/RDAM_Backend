function requireAdmin(req, res, next) {
  if (!req.user || req.user.scope !== "INTERNAL") {
    return res.status(401).json({
      ok: false,
      message: "No autenticado",
    });
  }

  if (req.user.rol !== "ADMIN") {
    return res.status(403).json({
      ok: false,
      message: "Acceso restringido a administradores",
    });
  }

  next();
}

module.exports = requireAdmin;