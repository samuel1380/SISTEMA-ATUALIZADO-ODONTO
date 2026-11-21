import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ComponentesTrabalhoDto {
  @IsOptional()
  @IsNumber()
  idComponenteTrabalho: number;

  @IsString()
  nome: string;
  
}
