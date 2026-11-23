import { IsString, IsEmail, IsArray, IsBoolean, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  tipoUsuario: string;

  @IsArray()
  @IsString({ each: true })
  permissoes: string[];

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsBoolean()
  @IsOptional()
  bloqueado?: boolean;

  @IsNumber()
  @IsOptional()
  idEmpresa?: number;

  @IsString()
  @IsOptional()
  senha?: string;
}
