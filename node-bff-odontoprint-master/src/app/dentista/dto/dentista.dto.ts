import { Exclude } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class DentistaDto {

  @IsOptional()
  @IsNumber()
  idDentista?: number;

  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @Exclude()
  idEmpresa: string;

}
