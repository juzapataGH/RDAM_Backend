const cron = require("node-cron");
const { ejecutarVencimientos } = require("../services/vencimientos.service");

function iniciarCronVencimientos() {
  // Todos los días a las 02:00
  cron.schedule("0 2 * * *", async () => {
    console.log("🕑 Ejecutando job de vencimientos...");
    try {
      await ejecutarVencimientos();
    } catch (error) {
      console.error("❌ Error en job de vencimientos:", error.message);
    }
  });

  console.log("✅ Job de vencimientos programado (todos los días a las 02:00)");
}

module.exports = { iniciarCronVencimientos };