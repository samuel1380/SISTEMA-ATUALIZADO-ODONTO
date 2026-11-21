import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsDateString, IsInt, Min, ValidateNested, IsArray, ArrayMinSize, IsOptional } from 'class-validator';
import { MeioPagamento } from '../domain/parcela.entity';
import { TipoLancamento } from '../domain/tipo-lancamento.enum';

class PagamentoImediatoDto {
  @IsInt()
  @IsNotEmpty()
  idConta: number;

  @IsString()
  @IsNotEmpty()
  dataPagamento: string;
}

export class ParcelaDto {
  @IsInt()
  @Min(1)
  numeroParcela: number;

  @IsNumber()
  @Min(0.01)
  valor: number;

  @IsString()
  dataVencimento: string;

  @IsEnum(MeioPagamento)
  meioPagamento: MeioPagamento;

  @IsOptional()
  dadosAdicionais?: any;

  @IsOptional()
  gerarJuros?: boolean;
}

export class CreateLancamentoDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(TipoLancamento)
  tipo: TipoLancamento;

  @IsNumber()
  @Min(0.01)
  valorTotal: number;

  @IsString()
  dataCompetencia: string;

  @IsOptional()
  @IsString()
  dataEmissao?: string;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @IsOptional()
  @IsInt()
  idOrdemServico?: number;

  @IsOptional()
  @IsInt()
  idFatura?: number;

  @IsOptional()
  @IsInt()
  idClienteFornecedor?: number;

  @IsOptional()
  @IsInt()
  idFornecedor?: number;

  @IsOptional()
  @IsInt()
  idCategoria?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ParcelaDto)
  parcelas: ParcelaDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PagamentoImediatoDto)
  pagamentoImediato?: PagamentoImediatoDto;

  /** Pagamento de empréstimo recebido (categoria com DRE saída de financiamento). */
  @IsOptional()
  @IsInt()
  @Min(1)
  idEmprestimo?: number;
}
