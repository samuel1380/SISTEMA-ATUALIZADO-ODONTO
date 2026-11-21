import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, IsInt, ValidateIf } from 'class-validator';

export class CreateFornecedorDto {
  /** CNPJ (texto livre, sem validação de formato). */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cnpj?: string;

  /** CPF (texto livre, sem validação de formato). */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cpf?: string;

  /** Categoria de despesa padrão para contas a pagar deste fornecedor. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  idCategoria?: number | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razaoSocial: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  cep?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logradouro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complemento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bairro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  uf?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
