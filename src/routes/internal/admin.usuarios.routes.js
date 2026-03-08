const express = require("express");
const router = express.Router();

const authInternal = require("../../middleware/authInternal");
const requireAdmin = require("../../middleware/requireAdmin");
const adminUsuariosService = require("../../services/adminUsuarios.service");

// Listar usuarios internos
router.get("/", authInternal, requireAdmin, async (req, res) => {
  try {
    const rows = await adminUsuariosService.listarUsuariosInternos();

    res.json({
      ok: true,
      items: rows,
    });
  } catch (error) {
    console.error("❌ Error listar usuarios internos:", error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
});

// Crear usuario interno
router.post("/", authInternal, requireAdmin, async (req, res) => {
  try {
    const { nombre, apellido, email, password, rolId, distritoId } = req.body;

    if (!nombre || !apellido || !email || !password || !rolId) {
      return res.status(400).json({
        ok: false,
        message: "nombre, apellido, email, password y rolId son obligatorios",
      });
    }

    const result = await adminUsuariosService.crearUsuarioInterno({
      nombre,
      apellido,
      email,
      password,
      rolId: Number(rolId),
      distritoId: distritoId ? Number(distritoId) : null,
    });

    if (!result.ok) {
      return res.status(result.status).json({
        ok: false,
        message: result.message,
      });
    }

    res.status(201).json({
      ok: true,
      id: result.id,
      message: "Usuario interno creado correctamente",
    });
  } catch (error) {
    console.error("❌ Error crear usuario interno:", error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
});

// Activar usuario
router.put("/:id/activar", authInternal, requireAdmin, async (req, res) => {
  try {
    const result = await adminUsuariosService.activarUsuario(Number(req.params.id));

    if (!result.ok) {
      return res.status(result.status).json({
        ok: false,
        message: result.message,
      });
    }

    res.json({
      ok: true,
      message: "Usuario activado correctamente",
    });
  } catch (error) {
    console.error("❌ Error activar usuario:", error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
});

// Desactivar usuario
router.put("/:id/desactivar", authInternal, requireAdmin, async (req, res) => {
  try {
    const result = await adminUsuariosService.desactivarUsuario(Number(req.params.id));

    if (!result.ok) {
      return res.status(result.status).json({
        ok: false,
        message: result.message,
      });
    }

    res.json({
      ok: true,
      message: "Usuario desactivado correctamente",
    });
  } catch (error) {
    console.error("❌ Error desactivar usuario:", error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
});

module.exports = router;