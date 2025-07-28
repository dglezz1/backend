


import * as fs from 'fs';
const path = require('path');
const pdf = require('html-pdf-node');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
const LOGO_PATH = `${PUBLIC_BASE_URL}/assets/img/FRIMOUSSE_PATISSERIE__2_-removebg-preview.png`;
let TEMPLATE_PATH = path.join(__dirname, 'pdf-template.html');
let CSS_PATH = path.join(__dirname, 'pdf-template.css');
// Si no existe en dist, buscar en src
if (!fs.existsSync(TEMPLATE_PATH)) {
  TEMPLATE_PATH = path.join(process.cwd(), 'src', 'quotes', 'pdf-template.html');
}
if (!fs.existsSync(CSS_PATH)) {
  // Buscar en src/quotes
  const srcPath = path.join(process.cwd(), 'src', 'quotes', 'pdf-template.css');
  if (fs.existsSync(srcPath)) {
    CSS_PATH = srcPath;
  } else {
    // Buscar en dist/quotes
    const distPath = path.join(process.cwd(), 'dist', 'quotes', 'pdf-template.css');
    if (fs.existsSync(distPath)) {
      CSS_PATH = distPath;
    }
  }
}



export async function generateQuotePdf(quote: Partial<any>): Promise<Buffer> {
  // Leer el template HTML y CSS
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  let css = fs.readFileSync(CSS_PATH, 'utf8');
  // Preparar los datos para el template
  let quoteNumber = '';
  if (quote.createdAt && quote.id) {
    const now = new Date(quote.createdAt);
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    quoteNumber = `${day}${month}${year}-${quote.id}`;
  }
  // Reemplazar variables en el HTML
  // Enlace único de vista previa PDF
  const previewUrl = `${PUBLIC_BASE_URL}/api/quotes/${quote.id}/pdf`;
  // Mensaje WhatsApp con enlace único
  const whatsappMessage = encodeURIComponent(`Hola Frimousse, me interesa cotizar un pastel. Aquí está mi cotización: ${previewUrl}`);
  html = html.replace(/{{logoPath}}/g, LOGO_PATH)
    .replace(/{{quoteNumber}}/g, quoteNumber)
    .replace(/{{whatsappNumber}}/g, '+52 771-722-7089')
    .replace(/{{whatsappLink}}/g, `https://wa.me/527717227089?text=${whatsappMessage}`)
    .replace(/{{previewUrl}}/g, previewUrl);
  // Renderizar tablas
    function renderRows(rows: Array<[string, any]>): string {
    return rows.map(([campo, valor]: [string, any]) => `<tr><td style="color:rgb(72,66,68);">${campo}</td><td style="color:rgb(72,66,68);">${valor ?? '-'}</td></tr>`).join('');
  }
  html = html.replace(/{{#each clienteRows}}([\s\S]*?){{\/each}}/g, renderRows([
    ['Nombre', quote.fullName],
    ['Contacto', quote.contact],
    ['Redes sociales', quote.socialMedia || '-'],
    ['Invitados', quote.guests],
  ]));
  html = html.replace(/{{#each pastelRows}}([\s\S]*?){{\/each}}/g, renderRows([
    ['Tipo de pastel', quote.cakeType],
    ['Sabor 3 leches', quote.threeMilkFlavor || '-'],
    ['Sabor de pan', quote.breadFlavor || '-'],
    ['Sabor de relleno', quote.fillingFlavor || '-'],
    ['Pastel premium', quote.premiumCake || '-'],
    ['Cambios al diseño', quote.designChanges || '-'],
  ]));
  html = html.replace(/{{#each entregaRows}}([\s\S]*?){{\/each}}/g, renderRows([
    ['Alergias', quote.allergies ? 'Sí' : 'No'],
    ['Descripción de alergias', quote.allergyDescription || '-'],
    ['Fecha de entrega', quote.deliveryDate],
    ['Horario de entrega', quote.deliveryTime],
    ['Tipo de entrega', quote.deliveryType],
    ['Dirección de entrega', quote.homeDeliveryAddress || '-'],
    ['Aceptó términos', quote.agreement ? 'Sí' : 'No'],
  ]));
  // Renderizar imágenes
  if (quote.imageUrls && Array.isArray(quote.imageUrls)) {
    html = html.replace(/{{#each imageUrls}}([\s\S]*?){{\/each}}/g,
      quote.imageUrls.map(url => `<img src="${url}" class="ref-image" width="200" height="150">`).join(''));
  }
  // Inyectar CSS
  html = html.replace('</head>', `<style>${css}</style></head>`);
  // Generar PDF usando html-pdf-node
  const pdfOptions = {
    format: 'A4',
    printBackground: true,
    puppeteerArgs: {
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  };
  const pdfBuffer = await pdf.generatePdf({ content: html }, pdfOptions);
  return pdfBuffer;
}
