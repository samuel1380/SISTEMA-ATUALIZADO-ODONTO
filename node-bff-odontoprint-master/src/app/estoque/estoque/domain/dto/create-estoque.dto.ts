import { Exclude } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateEstoqueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @Min(0)
  quantidade: number;

  @IsInt()
  @IsOptional()
  quantidadeParafusos?: number;

  @Exclude()
  idEmpresa: number;

  @IsInt()
  idComponente: number;

  @IsInt()
  idAlmoxarifado: number;
}
