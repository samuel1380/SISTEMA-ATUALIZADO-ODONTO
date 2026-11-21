import { IsAlphanumeric, IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComponenteEmpresaDto } from '../../componenteEmpresa/dto/componenteEmpresa.dto';
import { CorEmpresaDto } from '../../corEmpresa/dto/corEmpresa.dto';
import { DentistaDto } from '../../dentista/dto/dentista.dto';
import { ProdutoEmpresaDto } from '../../produtosEmpresa/dto/produtosEmpresa.dto';

export class CadastroComplementarEmpresaDto {

  @IsOptional()
  @IsNumber()
  idCadastroComplementarEmpresa?: number;

  @IsOptional()
  @IsNumber()
  idTabelaPrecoProduto?: number;

  @IsOptional()
  @IsNumber()
  porcentagemDesconto?: number;

  @IsOptional()
  @IsBoolean()
  utilizaInterfaces?: boolean;

  @IsOptional()
  @IsBoolean()
  scannerProprio?: boolean;

  @IsOptional()
  @IsNumber()
  diaPagamento?: number;

  @IsOptional()
  @IsString()
  tipoPagamento?: string;

  @IsOptional()
  @IsArray()
  produtos: ProdutoEmpresaDto[]

  @IsOptional()
  @IsArray()
  componentes: ComponenteEmpresaDto[]

  @IsOptional()
  @IsArray()
  cores: CorEmpresaDto[]
  
  @IsOptional()
  @IsArray()
  dentistas: DentistaDto[]
  
}
