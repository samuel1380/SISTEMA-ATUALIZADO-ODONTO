import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ElementosTrabalhoDto {
  @IsOptional()
  @IsNumber()
  idElementoTrabalho: number;

  @IsString()
  nome: string;
  
}
