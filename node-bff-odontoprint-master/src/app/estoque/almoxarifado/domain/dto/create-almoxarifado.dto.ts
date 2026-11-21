import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAlmoxarifadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNotEmpty()
  idEmpresa: number;
  
}
