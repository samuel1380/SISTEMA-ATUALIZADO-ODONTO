import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateTransferenciaDto {
    @IsInt()
    @IsNotEmpty()
    idContaOrigem: number;

    @IsInt()
    @IsNotEmpty()
    idContaDestino: number;

    @IsNumber()
    @Min(0.01)
    valor: number;

    @IsString()
    dataTransferencia: string;
}

