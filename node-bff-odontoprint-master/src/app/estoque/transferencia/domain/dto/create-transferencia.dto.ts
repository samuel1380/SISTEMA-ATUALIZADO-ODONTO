import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateTransferenciaDto {
  @IsInt()
  @IsNotEmpty()
  idAlmoxarifadoOrigem?: number;

  @IsInt()
  @IsNotEmpty()
  idAlmoxarifadoDestino: number;

  @IsInt()
  @IsNotEmpty()
  idComponente: number;

  @IsInt()
  @IsPositive({ message: 'A quantidade deve ser um número positivo.' })
  quantidade: number;
}
