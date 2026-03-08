require("dotenv").config();
const app = require("./app");
const { iniciarCronVencimientos } = require("./jobs/vencimientos.job");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ RDAM corriendo en http://localhost:${PORT}`);
  iniciarCronVencimientos();
});