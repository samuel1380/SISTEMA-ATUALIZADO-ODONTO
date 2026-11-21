import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class EmailDto {    
    @IsString()
    @Length(3, 150)
    remetenteNome: string;

    @IsString()
    @Length(10, 150)
    remetenteEmail: string;

    @IsString()
    @Length(0, 150)
    receptor: string;

    @IsOptional()
    @IsString()
    @Length(0, 500)
    comCopia: string;

    @IsString()
    @Length(0, 150)
    assunto: string;

    @IsString()
    @Length(0, 500)
    mensagem: string;

    @IsOptional()
    @IsString()
    @Length(5, 500)
    caminho: string;

    @IsOptional()
    @IsString()
    @Length(0, 10)
    type: string;
}
