


import PDFDocument from 'pdfkit';
// Si sigue el error, usar: import * as PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
const LOGO_PATH = 'public/assets/img/FRIMOUSSE_PATISSERIE__2_-removebg-preview.png';
const WHATSAPP_NUMBER = '771-722-7089';
const WHATSAPP_LINK = `https://wa.me/52${WHATSAPP_NUMBER.replace(/-/g, '')}?text=Hola%20Frimousse,%20me%20interesa%20cotizar%20un%20pastel`;



export async function generateQuotePdf(quote: Partial<any>): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40 });
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // Banner superior con logo y número de cotización
  doc.rect(0, 0, doc.page.width, 60).fill('#f8bbd0');
  try {
    const logoBuffer = fs.readFileSync(LOGO_PATH);
    doc.image(logoBuffer, doc.page.width / 2 - 60, 10, { width: 120, height: 40 });
  } catch {}
  // Generar número de cotización: fecha (ddmmyy) + id
  let quoteNumber = '';
  if (quote.createdAt && quote.id) {
    const now = new Date(quote.createdAt);
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    quoteNumber = `${day}${month}${year}-${quote.id}`;
  }
  doc.fillColor('#fff').fontSize(28).font('Helvetica-Bold').text('Frimousse Pâtisserie', 0, 18, { align: 'center', width: doc.page.width });
  doc.moveDown(0.5);
  doc.fillColor('black').font('Helvetica').fontSize(20).text('🎂 Cotización de Pastel', { align: 'center' });
  if (quoteNumber) {
    doc.fontSize(14).fillColor('#c2185b').text(`No. Cotización: ${quoteNumber}`, { align: 'center' });
  }
  doc.moveDown();

  // Datos del cliente y cotización en tabla
  const dataRows = [
    ['Nombre', quote.fullName],
    ['Contacto', quote.contact],
    ['Redes sociales', quote.socialMedia || '-'],
    ['Invitados', quote.guests],
    ['Tipo de pastel', quote.cakeType],
    ['Sabor 3 leches', quote.threeMilkFlavor || '-'],
    ['Sabor de pan', quote.breadFlavor || '-'],
    ['Sabor de relleno', quote.fillingFlavor || '-'],
    ['Pastel premium', quote.premiumCake || '-'],
    ['Cambios al diseño', quote.designChanges || '-'],
    ['Alergias', quote.allergies ? 'Sí' : 'No'],
    ['Descripción de alergias', quote.allergyDescription || '-'],
    ['Fecha de entrega', quote.deliveryDate],
    ['Horario de entrega', quote.deliveryTime],
    ['Tipo de entrega', quote.deliveryType],
    ['Dirección de entrega', quote.homeDeliveryAddress || '-'],
    ['Aceptó términos', quote.agreement ? 'Sí' : 'No'],
  ];
  let y = doc.y + 10;
  for (const [label, value] of dataRows) {
    doc.fillColor('#c2185b').text(label + ':', 60, y, { continued: true, width: 180 });
    doc.fillColor('black').text(' ' + (value ?? '-'), { continued: false });
    y = doc.y;
  }
  doc.moveDown();

  // Imágenes de referencia
  if (quote.imageUrls && Array.isArray(quote.imageUrls) && quote.imageUrls.length > 0) {
    doc.addPage();
    doc.fontSize(16).fillColor('#c2185b').font('Helvetica-Bold').text('Imágenes de referencia', { align: 'center' });
    doc.moveDown();
    let x = 60;
    let imgY = doc.y;
    const maxWidth = 200;
    const maxHeight = 150;
    for (const url of quote.imageUrls) {
      try {
const LOGO_URL = 'https://res.cloudinary.com/djtww9ixh/image/upload/v1710000000/assets/img/FRIMOUSSE_PATISSERIE__2_-removebg-preview.png';
const WHATSAPP_NUMBER = '771-722-7089';
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(response.data, 'binary');
        doc.rect(x - 5, imgY - 5, maxWidth + 10, maxHeight + 10).stroke('#c2185b');
        doc.image(imgBuffer, x, imgY, { fit: [maxWidth, maxHeight], align: 'center', valign: 'center' });
        x += maxWidth + 30;
        if (x + maxWidth > doc.page.width - 60) {
          x = 60;
          imgY += maxHeight + 40;
        }
      } catch (e) {
        doc.fontSize(10).fillColor('red').text(`No se pudo cargar la imagen: ${url}`, x, imgY);
        imgY += maxHeight + 40;
      }
    }
    doc.fillColor('black');
    doc.moveDown(2);
  }

  // Banner final con WhatsApp y descarga
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 120).fill('#c2185b');
  doc.fillColor('#fff').fontSize(22).font('Helvetica-Bold').text('¿Listo para tu cotización?', 0, 30, { align: 'center', width: doc.page.width });
  doc.fontSize(14).font('Helvetica').text('Contáctanos por WhatsApp para recibir tu precio final y resolver tus dudas.', 0, 60, { align: 'center', width: doc.page.width });
  doc.moveDown(2);
  doc.fillColor('#fff').fontSize(16).text('WhatsApp: ' + WHATSAPP_NUMBER, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).fillColor('#fff').text('Para descargar este PDF, usa el botón de descarga en la web.', { align: 'center' });

  // Pie de página
  doc.fillColor('gray').fontSize(10).text('Frimousse Pâtisserie · Cotización generada automáticamente', 0, doc.page.height - 40, { align: 'center', width: doc.page.width });

  doc.end();
  return Buffer.concat(buffers);
}
