import { Controller, Post, Body, UseInterceptors, UploadedFiles, BadRequestException, Res, Param, Get } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { configureCloudinary, uploadToCloudinary } from './cloudinary.utils';
import { Response } from 'express';
import { generateQuotePdf } from './pdf.utils';
import { ApiTags, ApiConsumes, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

/**
 * Controlador para cotizaciones de pasteles
 */
@ApiTags('Cotizaciones')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /**
   * Recibe la cotización y archivos del formulario
   */
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos de la cotización y archivos de imagen',
    type: CreateQuoteDto,
  })
  @ApiResponse({ status: 201, description: 'Cotización creada correctamente.' })
  @UseInterceptors(AnyFilesInterceptor())
  async createQuote(
    @Body() body: CreateQuoteDto,
    @UploadedFiles() files: Array<any>
  ) {
    try {
      configureCloudinary();
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadResults = await Promise.all(
          files.map((file) => uploadToCloudinary(file))
        );
        imageUrls = uploadResults.map((res) => res.secure_url);
      }
      // Convertir guests a número si viene como string
      const guests = typeof body.guests === 'string' ? parseInt(body.guests, 10) : body.guests;
      // Convertir allergies y agreement a booleano si vienen como string
      const allergies = typeof body.allergies === 'string' ? (body.allergies === 'true' || body.allergies === 'yes') : !!body.allergies;
      const agreement = typeof body.agreement === 'string' ? (body.agreement === 'true' || body.agreement === 'yes') : !!body.agreement;
      const quote = await this.quotesService.createQuote({ ...body, guests, allergies, agreement, imageUrls });
      // Generar número de cotización: fecha (ddmmyy) + id usando createdAt
      let quoteNumber = '';
      if (quote.createdAt && quote.id) {
        const now = new Date(quote.createdAt);
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        quoteNumber = `${day}${month}${year}-${quote.id}`;
      }
      // Banner visual para frontend con botones de WhatsApp y descarga PDF (solo como datos, no HTML)
      const pdfUrl = `/api/quotes/${quote.id}/pdf`;
      const pdfPreviewUrl = `/api/quotes/${quote.id}/pdf/preview`;
      const whatsappNumber = '+52 771-722-7089';
      // Mensaje con enlace único
      const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
      const whatsappMessage = encodeURIComponent(`Hola Frimousse, me interesa cotizar un pastel. Aquí está mi cotización: ${baseUrl}${pdfPreviewUrl}`);
      const whatsappLink = `https://wa.me/527717227089?text=${whatsappMessage}`;
      return {
        success: true,
        data: {
          quoteNumber,
          whatsappNumber,
          pdfUrl,
          pdfPreviewUrl,
          quote,
          banner: {
            logo: '/assets/img/FRIMOUSSE_PATISSERIE__2_-removebg-preview.png',
            title: '¡Cotización enviada!',
            message: 'Puedes contactarnos por WhatsApp para recibir tu precio final o descargar tu PDF.',
            whatsappLink,
            pdfUrl,
            pdfPreviewUrl,
            brand: 'Frimousse Pâtisserie · Cotización generada automáticamente'
          }
        }
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Vista previa del PDF en el navegador (inline)
   */
  @Get(':id/pdf/preview')
  @ApiParam({ name: 'id', description: 'ID de la cotización' })
  @ApiResponse({ status: 200, description: 'Vista previa PDF.' })
  async previewQuotePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const quote = await this.quotesService.getQuoteById(Number(id));
      if (!quote) {
        throw new BadRequestException('Cotización no encontrada');
      }
      let pdfBuffer;
      try {
        pdfBuffer = await generateQuotePdf(quote);
      } catch (pdfErr) {
        // Loguea el error de PDF
        console.error('Error al generar PDF (preview):', pdfErr);
        throw new BadRequestException('Error interno al generar el PDF (preview): ' + (pdfErr?.message || pdfErr));
      }
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="cotizacion_${id}.pdf"`,
      });
      res.end(pdfBuffer);
    } catch (err) {
      // Loguea el error general
      console.error('Error en previewQuotePdf:', err);
      throw err;
    }
  }

  /**
   * Genera y descarga el PDF de la cotización
   */
  @Get(':id/pdf')
  @ApiParam({ name: 'id', description: 'ID de la cotización' })
  @ApiResponse({ status: 200, description: 'PDF generado correctamente.' })
  async getQuotePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const quote = await this.quotesService.getQuoteById(Number(id));
      if (!quote) {
        throw new BadRequestException('Cotización no encontrada');
      }
      let pdfBuffer;
      try {
        pdfBuffer = await generateQuotePdf(quote);
      } catch (pdfErr) {
        // Loguea el error de PDF
        console.error('Error al generar PDF (descarga):', pdfErr);
        throw new BadRequestException('Error interno al generar el PDF (descarga): ' + (pdfErr?.message || pdfErr));
      }
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cotizacion_${id}.pdf"`,
      });
      res.end(pdfBuffer);
    } catch (err) {
      // Loguea el error general
      console.error('Error en getQuotePdf:', err);
      throw err;
    }
  }
}
