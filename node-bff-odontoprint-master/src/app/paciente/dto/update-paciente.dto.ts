import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { TrabalhoEditarDto } from '@src/app/trabalho/dto/trabalhoEditar.dto';

export class UpdatePacienteDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nome?: string;

  @IsNumber()
  @IsOptional()
  idProfissional?: number;

  @IsNumber()
  @IsOptional()
  idEmpresa?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrabalhoEditarDto)
  trabalhos?: TrabalhoEditarDto[];
}
