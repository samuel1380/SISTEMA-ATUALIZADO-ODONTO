import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusTrabalho } from '../domain/trabalho.entity';
import { TrabalhoCadastroDto } from './trabalhoCadastro.dto';

export class TrabalhoEditarDto extends TrabalhoCadastroDto {
  @IsOptional()
  @IsNumber()
  idTrabalho?: number;

  @IsOptional()
  @IsEnum(StatusTrabalho)
  status?: StatusTrabalho

  @IsOptional()
  @IsBoolean()
  retrabalho?: boolean;

  @IsOptional()
  @IsBoolean()
  bonificacao?: boolean;
}
