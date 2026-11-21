import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ComponenteDto {

  @IsOptional()
  @IsNumber()
  idComponente?: number;

  @IsString()
  nome: string;

  @IsNumber()
  idMarcaComponente: number;

  @IsNumber({maxDecimalPlaces: 2})
  preco: number;

  @ApiProperty({ description: 'Indica se o componente inclui parafuso', example: true, default: false })
  @IsBoolean()
  @IsOptional()
  hasParafuso?: boolean;

}
