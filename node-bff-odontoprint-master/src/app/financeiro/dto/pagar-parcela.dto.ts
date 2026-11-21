import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { MeioPagamento } from "../domain/parcela.entity";

export class PagarParcelaDto {
    @IsInt()
    @IsNotEmpty()
    idConta: number;

    @IsString()
    @IsNotEmpty()
    dataPagamento: string;

    @IsNumber()
    @Min(0.01)
    @IsNotEmpty()
    valor: number;

    /** Juros/multa (contas a receber); somados ao caixa e persistidos em parcela.valorAcrescimoAcumulado. */
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    acrescimo?: number;

    @IsOptional()
    @IsEnum(MeioPagamento)
    meioPagamento?: MeioPagamento;
}
