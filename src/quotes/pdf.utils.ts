import PDFDocument from 'pdfkit';

export function generateQuotePdf(quote: Partial<any>): Buffer {
  const doc = new PDFDocument({ margin: 40 });
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(20).text('🎂 Cotización de Pastel', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Nombre: ${quote.fullName}`);
  doc.text(`Contacto: ${quote.contact}`);
  if (quote.socialMedia) doc.text(`Redes sociales: ${quote.socialMedia}`);
  doc.text(`Invitados: ${quote.guests}`);
  doc.text(`Tipo de pastel: ${quote.cakeType}`);
  if (quote.threeMilkFlavor) doc.text(`Sabor 3 leches: ${quote.threeMilkFlavor}`);
  if (quote.breadFlavor) doc.text(`Sabor de pan: ${quote.breadFlavor}`);
  if (quote.fillingFlavor) doc.text(`Sabor de relleno: ${quote.fillingFlavor}`);
  if (quote.premiumCake) doc.text(`Pastel premium: ${quote.premiumCake}`);
  if (quote.designChanges) doc.text(`Cambios al diseño: ${quote.designChanges}`);
  doc.text(`Alergias: ${quote.allergies ? 'Sí' : 'No'}`);
  if (quote.allergyDescription) doc.text(`Descripción de alergias: ${quote.allergyDescription}`);
  doc.text(`Fecha de entrega: ${quote.deliveryDate}`);
  doc.text(`Horario de entrega: ${quote.deliveryTime}`);
  doc.text(`Tipo de entrega: ${quote.deliveryType}`);
  if (quote.homeDeliveryAddress) doc.text(`Dirección de entrega: ${quote.homeDeliveryAddress}`);
  doc.text(`Aceptó términos: ${quote.agreement ? 'Sí' : 'No'}`);
  doc.moveDown();
  doc.fontSize(10).fillColor('gray').text('Nota: Los precios NO se muestran en este documento. La cotización final será enviada únicamente por WhatsApp al 771-722-7089.', { align: 'center' });
  doc.end();
  return Buffer.concat(buffers);
}
