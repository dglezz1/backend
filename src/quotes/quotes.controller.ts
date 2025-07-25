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
      // Responder con el formato esperado por el frontend
      return {
        success: true,
        data: {
          quoteNumber: quote.id,
          whatsappNumber: '+52 771-722-7089',
          quote
        }
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Genera y descarga el PDF de la cotización
   */
  @Get(':id/pdf')
  @ApiParam({ name: 'id', description: 'ID de la cotización' })
  @ApiResponse({ status: 200, description: 'PDF generado correctamente.' })
  async getQuotePdf(@Param('id') id: string, @Res() res: Response) {
    const quote = await this.quotesService.getQuoteById(Number(id));
    if (!quote) {
      throw new BadRequestException('Cotización no encontrada');
    }
    const pdfBuffer = generateQuotePdf(quote);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cotizacion_${id}.pdf"`,
    });
    res.end(pdfBuffer);
  }
}
