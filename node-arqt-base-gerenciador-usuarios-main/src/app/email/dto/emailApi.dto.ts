import { IsEmail, IsObject, IsString } from 'class-validator';

export class EmailApiDto {
  @IsString()
  idioma: string; // pt-BR / en-US / es-ES

  @IsEmail()
  destinatario: string;

  @IsString()
  nomeTemplate: string;

  @IsObject()
  variaveisAmbiente: object;
}
