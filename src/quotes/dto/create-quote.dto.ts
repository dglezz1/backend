import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, IsArray, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear una cotización de pastel
 */
export class CreateQuoteDto {
  @ApiProperty({ description: 'Nombre y apellido del cliente' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Número de contacto' })
  @IsString()
  contact: string;

  @ApiPropertyOptional({ description: 'Perfil de redes sociales' })
  @IsOptional()
  @IsString()
  socialMedia?: string;

  @ApiProperty({ description: 'Cantidad de invitados' })
  @IsInt()
  guests: number;

  @ApiPropertyOptional({ description: 'Cambios al diseño' })
  @IsOptional()
  @IsString()
  designChanges?: string;

  @ApiProperty({ description: 'Tipo de pastel' })
  @IsString()
  cakeType: string;

  @ApiPropertyOptional({ description: 'Sabor de pastel 3 leches' })
  @IsOptional()
  @IsString()
  threeMilkFlavor?: string;

  @ApiPropertyOptional({ description: 'Sabor de pan' })
  @IsOptional()
  @IsString()
  breadFlavor?: string;

  @ApiPropertyOptional({ description: 'Sabor de relleno' })
  @IsOptional()
  @IsString()
  fillingFlavor?: string;

  @ApiPropertyOptional({ description: 'Pastel premium' })
  @IsOptional()
  @IsString()
  premiumCake?: string;

  @ApiProperty({ description: '¿Tiene alergias?' })
  @IsBoolean()
  allergies: boolean;

  @ApiPropertyOptional({ description: 'Descripción de alergias' })
  @ValidateIf((o: CreateQuoteDto) => o.allergies)
  @IsOptional()
  @IsString()
  allergyDescription?: string;

  @ApiProperty({ description: 'Fecha de entrega' })
  @IsDateString()
  deliveryDate: string;

  @ApiProperty({ description: 'Horario de entrega' })
  @IsString()
  deliveryTime: string;

  @ApiProperty({ description: 'Tipo de entrega' })
  @IsString()
  deliveryType: string;

  @ApiPropertyOptional({ description: 'Dirección de entrega (si aplica)' })
  @ValidateIf((o: CreateQuoteDto) => o.deliveryType === 'home')
  @IsOptional()
  @IsString()
  homeDeliveryAddress?: string;

  @ApiProperty({ description: 'Acepta términos y condiciones' })
  @IsBoolean()
  agreement: boolean;

  @ApiPropertyOptional({ description: 'URLs de imágenes subidas' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];
}
