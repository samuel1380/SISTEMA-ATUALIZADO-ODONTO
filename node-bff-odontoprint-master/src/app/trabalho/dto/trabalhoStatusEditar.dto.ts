import { IsEnum } from 'class-validator';
import { StatusTrabalho } from '../domain/trabalho.entity';

export class TrabalhoStatusEditarDto {
  @IsEnum(StatusTrabalho)
  status: StatusTrabalho
}
