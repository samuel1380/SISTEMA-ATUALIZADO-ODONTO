
import { CurrentUser, Roles, } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { CurrentUserDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/auth/guards/dto/currentUser.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { FotoPacienteService } from '../business/fotoPaciente.service';
import { Response } from 'express';


@ApiTags('Foto Paciente')
@Controller('paciente')
export class FotoPacienteController {
  constructor(private arquivoTrabalhoService: FotoPacienteService) { }

  @Roles('admin', 'comum')
  @Post("foto/trabalho/:idTrabalho")
  @UseInterceptors(AnyFilesInterceptor())
  async enviarArquivos(
    @CurrentUser() currentUser: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Param("idTrabalho", new ParseIntPipe()) idTrabalho: number,
    @Body() body: any
  ) {
    const idEmpresa = currentUser.user.empresas && currentUser.user.empresas[0]?.idEmpresa;

    const response = []
    for await (const file of files) {
      const ret = await this.arquivoTrabalhoService.cadastrarFotoPacienteTrabalho(currentUser, idEmpresa, idTrabalho, file, body.ordem);
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
  @Get("foto/trabalho/:idEmpresa/:arquivoNome")
  @UseInterceptors(AnyFilesInterceptor())
  async buscaArquivos(
    @CurrentUser() currentUser: any,
    @UploadedFiles() files: Express.Multer.File[],
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
