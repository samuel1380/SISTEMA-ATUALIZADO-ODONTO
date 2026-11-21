import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from "class-validator";
import { MeioPagamento } from "../domain/parcela.entity";

class ItemPagamentoDto {
    @IsInt()
    @IsNotEmpty()
    idOrdemServicoItem: number;

    @IsNumber()
    @Min(0.01)
    @IsNotEmpty()
    valor: number;
}

export class PagarItensFaturaDto {
    @IsInt()
    @IsNotEmpty()
    idFatura: number;

    @IsInt()
    @IsNotEmpty()
    idConta: number;

    @IsString()
    @IsNotEmpty()
    dataPagamento: string;

    @IsEnum(MeioPagamento)
    meioPagamento: MeioPagamento;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemPagamentoDto)
    itens: ItemPagamentoDto[];
}
