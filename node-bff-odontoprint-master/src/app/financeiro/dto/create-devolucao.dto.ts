import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class DevolucaoItemDto {
    @IsInt()
    @IsNotEmpty()
    idOrdemServicoItem: number;

    @IsNumber()
    @IsNotEmpty()
    quantidade: number;
}

export class CreateDevolucaoDto {
    @IsInt()
    @IsNotEmpty()
    idFatura: number;

    @IsString()
    @IsOptional()
    observacao?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DevolucaoItemDto)
    itens: DevolucaoItemDto[];
}
