import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EmpresaCadastroDto {
  @IsString()
  nome: string;

  @IsString()
  razaoSocial: string;

  @IsString()
  documento: string;

  @IsString()
  tipoEmpresa: string;

  @IsString()
  cep: string;

  @IsString()
  logradouro: string;

  @IsString()
  @IsOptional()
  complemento?: string;

  @IsString()
  bairro: string;

  @IsString()
  cidade: string;

  @IsString()
  uf: string;

  @IsString()
  responsavelTecnico: string;

  @IsString()
  numeroDocumentoResponsavelTecnico: string;

  @IsString()
  nomeResponsavelFinanceiro: string;

  @IsString()
  telefoneFinanceiro: string;

  @IsString()
  emailFinanceiro: string;

  @IsString()
  nomeResponsavel: string;

  @IsEmail()
  email: string;

  @IsString()
  telefone: string;

}
