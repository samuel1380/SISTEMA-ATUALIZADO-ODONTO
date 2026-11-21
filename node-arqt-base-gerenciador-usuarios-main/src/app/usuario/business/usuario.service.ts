import { Injectable } from '@nestjs/common';
import { generate } from 'generate-password';
import { BadRequest } from 'src/libs/badRequest';
import { HttpClient } from 'src/libs/httpClient/httpClient';
import { EncryptaService } from '../../../utils/encrypta.sevice';
import { EmailService } from '../../email/business/email.service';
import { EmpresaService } from '../../empresa/business/empresa.service';
import { PermissaoService } from '../../permissao/permissao/business/permissao.service';
import { Usuario } from '../domain/usuario.entity';
import { UsuarioCadastroDto } from '../dto/usuarioCadastro.dto';
import { UsuarioRepository } from '../repository/usuario.repository';
import { Criptografia } from './crypto';

@Injectable()
export class UsuarioService {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private encrypta: EncryptaService,
    private httpClient: HttpClient,
    private emailService: EmailService,
    private criptografia: Criptografia,
    private empresaService: EmpresaService,
    private permissaoService: PermissaoService,
  ) { }

  async autentica(email: string, senha: string) {
    const senhaCripto = this.criptografia.criptografaTexto(senha);

    console.log("senhaCripto" + senhaCripto);
    const usuario = await this.usuarioRepository.buscarUsuarioPorEmailSenha(
      email,
      senhaCripto
    );

    console.log("busca usuario" + usuario);
    if (!usuario) return undefined;

    const permissoes = usuario?.permissoes?.map(p => p.ativo && p.nome);
    return { ...usuario, permissoes };
  }

  buscarUsuarioPorId(usuarioId: number) {
    return this.usuarioRepository.buscarUsuarioPorId(usuarioId);
  }

  buscarUsuarioPorEmail(email: string) {
    return this.usuarioRepository.buscarUsuarioPorEmail(email);
  }

  buscarUsuariosPorEmpresaId(empresaId: number) {
    return this.usuarioRepository.buscarUsuarioPorEmpresaId(empresaId);
  }

  async cadastrarUsuario(usuario: UsuarioCadastroDto) {
    const usuarioJaExiste = await this.usuarioRepository.buscarUsuarioPorEmail(usuario.email);

    if (usuarioJaExiste) throw new BadRequest('Email inválido');

    usuario.senha = this.gerarSenha();
    const senhaCriptografada = this.criptografaSenha(usuario.senha);

    const novoUsuario = await this.usuarioRepository.cadastrarUsuario({
      nome: usuario.nome,
      email: usuario.email,
      senha: senhaCriptografada,
      tipoUsuario: usuario.tipoUsuario,
      ativo: usuario.ativo,
      token: this.encrypta.generateCode(15), // TODO: enviar por email
      dataExpiracaoToken: this.addHours(new Date(), 1), // TODO: enviar por email
      bloqueado: usuario.bloqueado,
      idUsuarioCadastro: usuario.idUsuarioCadastro || 0
    });

    if (!novoUsuario) throw new BadRequest('Cadastro inválido');

    const { idUsuario, nome, email } = novoUsuario;

    usuario.permissoes.forEach(permissao => {
      this.adicionarPermissao(idUsuario, permissao);
    });

    console.log(`Envio de email com senha: ${usuario.senha}`);
    // implementar envio de email com o token de ativação

    return { idUsuario, nome, email };
  }

  async editarUsuario(usuarioId: number, usuario: UsuarioCadastroDto) {
    const usuarioJaExiste = await this.usuarioRepository.buscarUsuarioPorId(usuarioId);

    if (!usuarioJaExiste) throw new BadRequest('Erro ao atualizar usuário');

    const novoUsuario = await this.usuarioRepository.editarUsuario(usuarioId, {
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      idUsuarioCadastro: usuario.idUsuarioCadastro || 0
    });

    if (!novoUsuario) throw new BadRequest('Cadastro inválido');

    const { nome, email } = await this.usuarioRepository.buscarUsuarioPorId(usuarioId);

    return { nome, email };
  }

  async adicionarUsuarioNaEmpresa(idUsuario: number, idEmpresa: number) {
    try {
      const usuarioJaExiste = await this.usuarioRepository.buscarUsuarioPorId(idUsuario);
      const empresaIdJaExiste = await this.empresaService.buscarEmpresasPorId(idEmpresa);

      if (!usuarioJaExiste) throw new BadRequest('Erro ao adicionar usuário');
      if (!empresaIdJaExiste) throw new BadRequest('Erro ao adicionar usuário');

      if (!usuarioJaExiste.empresas) {
        usuarioJaExiste.empresas = [];
      }

      const usuarioAssociadoEmpresa = usuarioJaExiste.empresas.find((empresa) => empresa.idEmpresa == idEmpresa);
      if (!usuarioAssociadoEmpresa) {
        usuarioJaExiste.empresas.push(empresaIdJaExiste);
        
        await this.usuarioRepository.save(usuarioJaExiste);
      }

      const { nome, email } = usuarioJaExiste;
      return { nome, email }
    } catch (e) {
      console.log(e)
    }
  }

  async removerUsuarioNaEmpresa(idUsuario: number, idEmpresa: number) {
    const usuarioJaExiste = await this.usuarioRepository.buscarUsuarioPorId(idUsuario);
    const empresaIdJaExiste = await this.empresaService.buscarEmpresasPorId(idEmpresa);

    if (!usuarioJaExiste) throw new BadRequest('Erro ao adicionar usuário');
    if (!empresaIdJaExiste) throw new BadRequest('Erro ao adicionar usuário');

    const idEmpresaArray = usuarioJaExiste.empresas.map((empresa) => empresa.idEmpresa);
    const indexEmpresaExistente = idEmpresaArray.indexOf(idEmpresa);

    if (indexEmpresaExistente >= 0) {
      usuarioJaExiste.empresas = usuarioJaExiste.empresas.slice(indexEmpresaExistente, 1);

      await this.usuarioRepository.save(usuarioJaExiste);
    }

    const { nome, email } = usuarioJaExiste;
    return { nome, email }
  }


  async adicionarPermissao(idUsuario: number, permissaoNome: string) {
    try {
      console.log(idUsuario, permissaoNome);
      const usuarioExiste = await this.usuarioRepository.buscarUsuarioPorId(idUsuario);
      const permissaoExiste = await this.permissaoService.buscarPermissaoPorNome(permissaoNome);

      if (!usuarioExiste) throw new BadRequest('Erro ao adicionar permissão - U');
      if (!permissaoExiste) throw new BadRequest('Erro ao adicionar permissão - P');

      if (!usuarioExiste.permissoes) {
        usuarioExiste.permissoes = [];
      }

      const usuarioAssociadoPermissao = usuarioExiste.permissoes.find((permissao) => permissao.idPermissao == permissaoExiste.idPermissao);

      const usuario = new Usuario();
      usuario.permissoes = usuarioExiste.permissoes;
      
      if (!usuarioAssociadoPermissao) {
        usuario.idUsuario = idUsuario;
        usuario.permissoes.push(permissaoExiste);
        
        await this.usuarioRepository.save(usuario);
      }

      const { nome, email } = usuarioExiste;
      return { nome, email }
    } catch(e) {
      console.log(e);
    }
  }


  async removerPermissao(idUsuario: number, permissaoNome: string) {
    const usuarioExiste = await this.usuarioRepository.buscarUsuarioPorId(idUsuario);
    const permissaoExiste = await this.permissaoService.buscarPermissaoPorNome(permissaoNome);

    if (!usuarioExiste) throw new BadRequest('Erro ao remover permissão');
    if (!permissaoExiste) throw new BadRequest('Erro ao remover permissão');

    const idPermissaoArray = usuarioExiste.permissoes.map((permissao) => permissao.idPermissao);
    const indexPermissaoExistente = idPermissaoArray.indexOf(permissaoExiste.idPermissao);

    if (indexPermissaoExistente >= 0) {
      usuarioExiste.empresas.splice(indexPermissaoExistente, 1);

      await this.usuarioRepository.update(idUsuario, usuarioExiste);
    }

    const { nome, email } = usuarioExiste;
    return { nome, email }
  }

  // async alteraSenhaUsuario(usuario: UsuarioAlteracaoSenhaDto) {
  //   const isUsuario = await this.usuarioRepository.buscarUsuarioPorEmailTokenExpiracao(
  //     usuario.email,
  //     usuario.tokenAcesso
  //   );

  //   if (!isUsuario || isUsuario.ativo === false)
  //     throw new BadRequest('Erro ao alterar senha');

  //   const novaSenhaCriptografada = this.criptografaSenha(usuario.novaSenha);

  //   try {
  //     await this.usuarioRepository.alteraSenhaUsuarioComResetToken(
  //       isUsuario.idUsuario,
  //       novaSenhaCriptografada
  //     );
  //     return;
  //   } catch (error) {
  //     console.error(error);
  //     throw new BadRequest('Erro ao alterar a senha');
  //   }
  // }

  private gerarSenha() {
    return generate({
      length: 10,
      numbers: true
    });
  }

  private criptografaSenha(senha) {
    return this.criptografia.criptografaTexto(senha);
  }

  private addHours(date: Date, hours: number): Date {
    date.setHours(date.getHours() + hours);

    return date;
  }
}
