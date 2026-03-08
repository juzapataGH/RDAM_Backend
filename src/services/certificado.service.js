const PDFDocument = require("pdfkit");

function generarCertificadoPDF(solicitud) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      doc
        .fontSize(18)
        .text("CERTIFICADO DIGITAL DE ANTECEDENTES", {
          align: "center",
        });

      doc.moveDown(2);

      doc
        .fontSize(12)
        .text(`Número de trámite: ${solicitud.nro_tramite}`)
        .text(`Solicitante: ${solicitud.nombre} ${solicitud.apellido}`)
        .text(`CUIL: ${solicitud.cuil}`)
        .text(`Email: ${solicitud.email}`)
        .text(`Distrito: ${solicitud.distrito}`)
        .text(`Estado: ${solicitud.estado}`)
        .text(
          `Fecha de publicación: ${
            solicitud.fecha_publicacion
              ? new Date(solicitud.fecha_publicacion).toLocaleString()
              : "-"
          }`
        );

      doc.moveDown(2);

      doc.text(
        "Se certifica que la presente constancia fue emitida por el sistema RDAM.",
        { align: "justify" }
      );

      doc.moveDown(4);

      doc.text("Firma digital institucional", {
        align: "right",
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generarCertificadoPDF };