import { IsOptional, IsString } from 'class-validator';

export class ResetarSenhaDto {
  @IsOptional()
  @IsString()
  novaSenha?: string;

  @IsOptional()
  @IsString()
  senha?: string;
}

