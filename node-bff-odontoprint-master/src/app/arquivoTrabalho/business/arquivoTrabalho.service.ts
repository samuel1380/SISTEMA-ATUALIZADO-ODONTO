import { CurrentUserDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/auth/guards/dto/currentUser.dto';
import { AwsS3 } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/s3/business/awsS3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ArquivoTrabalho } from '../domain/arquivoTrabalho.entity';
import { ArquivoTrabalhoRepository } from '../repository/arquivoTrabalho.repository';
import { GeradorGuidService } from './geradorGuid.service';

@Injectable()
export class ArquivoTrabalhoService {

  constructor(
    private arquivoTrabalhoRepository: ArquivoTrabalhoRepository,
    private uploadFileS3: AwsS3,
    private geradorGuidService: GeradorGuidService
  ) { }

  async cadastrarArquivosTrabalho(currentUser: CurrentUserDto, idEmpresa: number, idTrabalho: number, file: Express.Multer.File) {
    const arquivoTrabalho = new ArquivoTrabalho();

    arquivoTrabalho.idEmpresa = idEmpresa;
    arquivoTrabalho.idTrabalho = idTrabalho;
    arquivoTrabalho.nomeArquivo = this.geradorGuidService.gerarGuid();
    arquivoTrabalho.nomeOriginal = file.originalname
    arquivoTrabalho.tamanho = file.size;
    arquivoTrabalho.tipo = file.mimetype;
    arquivoTrabalho.path = `${idEmpresa}/${arquivoTrabalho.nomeArquivo}`
    arquivoTrabalho.bucket = `${process.env.BUCKET_AWS}`
    arquivoTrabalho.ordem = 1;

    arquivoTrabalho.idUsuarioCadastro = 0;

    await this.uploadFileS3.upload(currentUser, file.buffer, arquivoTrabalho.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);

    return this.arquivoTrabalhoRepository.salvaTrabalho(arquivoTrabalho);
  }

  async deletarArquivo(currentUser: CurrentUserDto, idEmpresa: number, idTrabalho: number, idArquivo: number, tipoUsuario: string): Promise<any> {
    const arquivo = await this.arquivoTrabalhoRepository.buscaArquivo(idArquivo);


    if (arquivo.idEmpresa !== idEmpresa && tipoUsuario == "externo") {
      throw new HttpException("Não Autorizado", HttpStatus.UNAUTHORIZED);
    }
    if (arquivo.idTrabalho !== idTrabalho && tipoUsuario == "externo") {
      throw new HttpException("Não Autorizado", HttpStatus.UNAUTHORIZED);
    }

    if (tipoUsuario == "interno") {
      idEmpresa = arquivo.idEmpresa;
    }

    await this.arquivoTrabalhoRepository.deleteArquivo(arquivo);

    return await this.uploadFileS3.delete(currentUser, arquivo.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);
  }

  async buscarArquivo(currentUser: CurrentUserDto, idEmpresa: number, arquivoNome: string) {
    return await this.uploadFileS3.download(currentUser, arquivoNome, `${process.env.BUCKET_AWS}/${idEmpresa}`);
  }

}
