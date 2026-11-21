import { IsOptional, IsString } from 'class-validator';

export class EmailAlteracaoSenhaDTO {
  @IsString()
  destinatario: string;

  @IsString()
  nome: string;

  @IsString()
  link: string;

  @IsOptional()
  @IsString()
  idioma?: string;
}
