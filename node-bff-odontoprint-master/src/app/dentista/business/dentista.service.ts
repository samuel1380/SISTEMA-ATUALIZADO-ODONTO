import { UsuarioService } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { UsuarioCadastroDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/dto/usuarioCadastro.dto';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dentista } from '../domain/dentista.entity';
import { DentistaDto } from '../dto/dentista.dto';
import { Usuario } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/domain/usuario.entity';

interface retornoCadastroUsuario {
  idUsuario: number;
  nome: string;
  email: string;
}

@Injectable()
export class DentistaService {
  constructor(
    @InjectRepository(Dentista)
    private readonly dentistaRepository: Repository<Dentista>,
    private readonly usuarioService: UsuarioService,
  ) {}

  async cadastrarDentista(
    currentUser: any,
    idEmpresa: number,
    dentistaDto: DentistaDto,
  ): Promise<Dentista> {
    const dentistasExistentes = await this.buscaDentistaPorEmail(
      dentistaDto.email
    );

    if (dentistasExistentes?.length > 0) {
      return dentistasExistentes[0];
    }

    let usuarioCadastrado: Usuario = await this.usuarioService.buscarUsuarioPorEmail(
      dentistaDto.email
    );

    let retornoUsuarioCadastrado: retornoCadastroUsuario;

    if (!usuarioCadastrado) {
      const usuarioCadastroDto = new UsuarioCadastroDto();

      usuarioCadastroDto.idUsuarioCadastro = currentUser.user.idUsuario;
      usuarioCadastroDto.ativo = true;
      usuarioCadastroDto.email = dentistaDto.email;
      usuarioCadastroDto.nome = dentistaDto.nome;
      usuarioCadastroDto.permissoes = ['comum'];
      usuarioCadastroDto.tipoUsuario = 'externo';
      usuarioCadastroDto.bloqueado = false;

      retornoUsuarioCadastrado = await this.usuarioService.cadastrarUsuario(
        usuarioCadastroDto
      );
     
      await this.usuarioService.adicionarUsuarioNaEmpresa(
        retornoUsuarioCadastrado.idUsuario,
        idEmpresa
      );
    }

    const dentistaDomain = new Dentista();

    dentistaDomain.idDentista = dentistaDto.idDentista;
    dentistaDomain.nome = dentistaDto.nome;
    dentistaDomain.email = dentistaDto.email;
    dentistaDomain.idEmpresa = dentistaDto.idEmpresa;
    dentistaDomain.ativo = true;
    dentistaDomain.idUsuarioCadastro = currentUser.user.idUsuario;
    dentistaDomain.idUsuarioSistema = usuarioCadastrado?.idUsuario || retornoUsuarioCadastrado?.idUsuario;
    
    return this.dentistaRepository.save(dentistaDomain);
  }

  async atualizaDentista(currentUser: any, idEmpresa: number, dentista: Partial<Dentista>) {
    const dentistaExistente = await this.buscaDentistaPorEmail(dentista.email);
    dentista.idUsuarioCadastro = currentUser.user.idUsuario;
    dentista.ativo = true;

    if (!dentistaExistente.length) {
      throw new HttpException(
        `Dentista não cadastrado`,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.usuarioService.adicionarUsuarioNaEmpresa(
      dentistaExistente[0].idUsuarioSistema,
      idEmpresa
    );

    return this.dentistaRepository.save(dentista);
  }

  async buscaDentistas() {
    return this.dentistaRepository.find({ where: { ativo: true } });
  }

  async desativarDentista(idEmpresa: number, idDentista: number) {
    const dentista = await this.dentistaRepository.findOne({where: { idDentista } });

    if (!dentista) {
      throw new NotFoundException(`Dentista com ID ${idDentista} não encontrado.`);
    }

    await this.dentistaRepository.update(idDentista, { ativo: false });
    await this.usuarioService.removerUsuarioNaEmpresa(
      dentista.idUsuarioSistema,
      idEmpresa
    );
  }

  async buscaDentistaPorEmail(email: string): Promise<Dentista[]> {
    return this.dentistaRepository.find({ where: { email } });
  }

  async buscaDentistaPorId(idDentista: number): Promise<Dentista[]> {
    return this.dentistaRepository.find({ where: { idDentista } });
  }

  async buscaDentistaPorEmpresaId(idEmpresa: string) {
    return this.dentistaRepository.find({ where: { idEmpresa } });
  }
}

