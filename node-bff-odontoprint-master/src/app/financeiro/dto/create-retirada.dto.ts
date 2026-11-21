import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TipoRetirada } from '../domain/retirada.entity';

export class CreateRetiradaDto {
  @IsOptional()
  @IsInt()
  idSocio?: number;

  @IsString()
  @IsNotEmpty()
  dataRetirada: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  valor: number;

  @IsEnum(TipoRetirada)
  @IsNotEmpty()
  tipo: TipoRetirada;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsInt()
  idCategoria?: number;

  @IsOptional()
  @IsInt()
  idConta?: number;

  @IsOptional()
  @IsString()
  meioPagamento?: string;
}
