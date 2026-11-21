
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ArquivoTrabalhoService } from '../business/arquivoTrabalho.service';
import { Response } from 'express';


@ApiTags('Arquivo Trabalho')
@Controller('arquivo')
export class ArquivoTrabalhoController {
  constructor(private arquivoTrabalhoService: ArquivoTrabalhoService) { }

  @Roles('admin', 'comum')
  @Post("trabalho/:idTrabalho")
  @UseInterceptors(AnyFilesInterceptor())
  async enviarArquivos(
    @CurrentUser() currentUser: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Param("idTrabalho", new ParseIntPipe()) idTrabalho: number,
  ) {

    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    const response = []
    for await (const file of files) {
      const ret = await this.arquivoTrabalhoService.cadastrarArquivosTrabalho(currentUser, idEmpresa, idTrabalho, file);
      response.push(ret);
    }

    return response;
  }

  @Roles('admin', 'comum')
  @Delete("trabalho/:idTrabalho/arquivo/:idArquivo")
  @UseInterceptors(AnyFilesInterceptor())
  async deletaArquivos(
    @CurrentUser() currentUser: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Param("idTrabalho", new ParseIntPipe()) idTrabalho: number,
    @Param("idArquivo", new ParseIntPipe()) idArquivo: number,
  ): Promise<any> {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    const tipoUsuario = currentUser.user.tipoUsuario;

    return await this.arquivoTrabalhoService.deletarArquivo(currentUser, idEmpresa, idTrabalho, idArquivo, tipoUsuario);
  }

  @Roles('admin', 'comum')
  @Get("trabalho/:idEmpresa/:arquivoNome")
  @UseInterceptors(AnyFilesInterceptor())
  async buscaArquivos(
    @CurrentUser() currentUser: any,
    @Param("idEmpresa", new ParseIntPipe()) idEmpresa: number,
    @Param("arquivoNome") arquivoNome: string,
    @Res() res: Response,
  ) {
    const idEmpresaCurrentUser = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    if (currentUser.user.tipoUsuario === "externo" && idEmpresa !== idEmpresaCurrentUser) {
      throw new HttpException("Não Autorizado", HttpStatus.UNAUTHORIZED);
    }

    const stream = await this.arquivoTrabalhoService.buscarArquivo(currentUser, idEmpresa, arquivoNome);

    res.setHeader('Content-Type', 'application/octet-stream');

    stream.pipe(res);
  }
}
