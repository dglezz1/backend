import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva cotización en la base de datos
   * @param data Datos del formulario recibidos del frontend
   */
  async createQuote(data: any) {
    // Se recomienda validar el DTO antes de llamar a este método
    return this.prisma.quote.create({ data });
  }

  /**
   * Obtiene una cotización por ID
   */
  async getQuoteById(id: number) {
    return this.prisma.quote.findUnique({ where: { id } });
  }
}
