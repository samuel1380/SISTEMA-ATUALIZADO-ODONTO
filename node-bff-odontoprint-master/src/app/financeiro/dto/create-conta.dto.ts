import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { TipoConta } from '../domain/conta.entity';

export class CreateContaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(TipoConta)
  @IsNotEmpty()
  tipo: TipoConta;

  @IsNumber()
  @Min(0)
  saldoInicial: number;

  idEmpresa?: number;
}

