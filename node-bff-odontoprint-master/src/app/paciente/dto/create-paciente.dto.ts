import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsNumber()
  @IsNotEmpty()
  idEmpresa: number;

  @IsNumber()
  @IsOptional()
  idProfissional?: number;
}
