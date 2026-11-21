import { CurrentUserDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/auth/guards/dto/currentUser.dto';
import { AwsS3 } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/s3/business/awsS3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FotoPaciente } from '../domain/fotoPaciente.entity';
import { FotoPacienteRepository } from '../repository/fotoPaciente.repository';
import { GeradorGuidService } from './geradorGuid.service';

@Injectable()
export class FotoPacienteService {

  constructor(
    private fotoPacienteRepository: FotoPacienteRepository,
    private uploadFileS3: AwsS3,
    private geradorGuidService: GeradorGuidService
  ) { }

  async cadastrarFotoPacienteTrabalho(currentUser: CurrentUserDto, idEmpresa: number, idTrabalho:number, file: Express.Multer.File, ordem: number) {
    const fotoPaciente = new FotoPaciente();

    fotoPaciente.idEmpresa = idEmpresa;
    fotoPaciente.idTrabalho = idTrabalho;
    fotoPaciente.nomeArquivo = this.geradorGuidService.gerarGuid();
    fotoPaciente.nomeOriginal = file.originalname
    fotoPaciente.tamanho = file.size;
    fotoPaciente.tipo = file.mimetype;
    fotoPaciente.path = `${idEmpresa}/${fotoPaciente.nomeArquivo}`
    fotoPaciente.bucket = `${process.env.BUCKET_AWS}`
    fotoPaciente.ordem = ordem;

    fotoPaciente.idUsuarioCadastro = 0;

    await this.uploadFileS3.upload(currentUser, file.buffer, fotoPaciente.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);

    return this.fotoPacienteRepository.salvaFotoPaciente(fotoPaciente);
  }

  async buscarArquivo(currentUser: CurrentUserDto, idEmpresa: number, arquivoNome: string) {
    return await this.uploadFileS3.download(currentUser, arquivoNome, `${process.env.BUCKET_AWS}/${idEmpresa}`);
  }

  async deletarArquivo(currentUser: CurrentUserDto, idEmpresa: number, idTrabalho: number, idArquivo: number, tipoUsuario: string): Promise<any> {
    const arquivo = await this.fotoPacienteRepository.buscaArquivo(idArquivo);

    if (arquivo.idEmpresa !== idEmpresa && tipoUsuario === "externo") {
      throw new HttpException("Não Autorizado", HttpStatus.UNAUTHORIZED);
    }
    if (arquivo.idTrabalho !== idTrabalho && tipoUsuario === "externo") {
      throw new HttpException("Não Autorizado", HttpStatus.UNAUTHORIZED);
    }

    if (tipoUsuario == "interno") {
      idEmpresa = arquivo.idEmpresa;
    }

    await this.fotoPacienteRepository.deleteArquivo(arquivo);

    return await this.uploadFileS3.delete(currentUser, arquivo.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);
  }


}
