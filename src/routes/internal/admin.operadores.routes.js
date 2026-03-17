const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const authInternal = require("../../middleware/authInternal");
const operadoresService = require("../../services/operadores.service");

function soloAdmin(req, res, next) {
  if (req.user.rol !== "ADMIN") {
    return res.status(403).json({
      ok: false,
      message: "Solo ADMIN puede gestionar operadores",
    });
  }

  next();
}

router.get("/", authInternal, soloAdmin, async (req, res) => {
  const rows = await operadoresService.listarOperadores();

  res.json({
    ok: true,
    items: rows,
  });
});

router.post("/", authInternal, soloAdmin, async (req, res) => {
  try {
    const { nombre, apellido, email, password, distritoId } = req.body;

    if (!nombre || !apellido || !email || !password || !distritoId) {
      return res.status(400).json({
        ok: false,
        message: "Todos los campos son requeridos",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await operadoresService.crearOperador({
      nombre,
      apellido,
      email,
      passwordHash,
      distritoId,
    });

    res.status(201).json({
      ok: true,
      id: result.id,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

router.put("/:id", authInternal, soloAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, apellido, email, distritoId } = req.body;

  const ok = await operadoresService.editarOperador(id, {
    nombre,
    apellido,
    email,
    distritoId,
  });

  if (!ok) {
    return res.status(404).json({
      ok: false,
      message: "Operador no encontrado",
    });
  }

  res.json({ ok: true });
});

router.delete("/:id", authInternal, soloAdmin, async (req, res) => {
  const id = Number(req.params.id);

  const ok = await operadoresService.eliminarOperador(id);

  if (!ok) {
    return res.status(404).json({
      ok: false,
      message: "Operador no encontrado",
    });
  }

  res.json({ ok: true });
});

module.exports = router;