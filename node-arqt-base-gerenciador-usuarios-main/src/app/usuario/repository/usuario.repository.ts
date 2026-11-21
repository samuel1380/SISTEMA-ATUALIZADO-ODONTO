import { ArrayContains } from 'class-validator';
import {
  Connection,
  EntityRepository,
  Repository
} from 'typeorm';
import { Usuario } from '../domain/usuario.entity';
import { UsuarioAtivacaoEnum, UsuarioBloqueioEnum } from '../enum/usuario.enum';

@EntityRepository(Usuario)
export class UsuarioRepository extends Repository<Usuario> {

  buscarUsuarioPorEmailSenha(email: string, senha: string): Promise<Usuario> {
    return this.findOne({
      where: {
        email: email,
        senha: senha,
        ativo: UsuarioAtivacaoEnum.ativo,
        bloqueado: UsuarioBloqueioEnum.liberado
      }
    });
  }

  // buscarUsuarioPorEmailTokenExpiracao(
  //   email: string,
  //   tokenAcesso: string
  // ): Promise<Usuario> {
  //   return this.findOne({
  //     where: {
  //       email,
  //       tokenAcesso,
  //       expiracaoToken: MoreThanOrEqual(new Date())
  //     }
  //   });
  // }
  buscarUsuarioPorEmail(email: string) {
    return this.findOne({
      where: {
        email: email
      }
    });
  }

  buscarUsuarioPorEmpresaId(empresaId: number) {
    return this.find({
      where: {
        email: ArrayContains([empresaId])
      }
    });
  }

  cadastrarUsuario(usuario: Usuario) {
    return this.save(usuario);
  }

  editarUsuario(usuarioId: number, usuario: Partial<Usuario>) {
    return this.update(usuarioId, usuario);
  }

  buscarUsuarioPorId(usuarioId: number) {
    return this.findOne({
      where: {
        idUsuario: usuarioId,
      },
    });
  }

  // ativaUsuario(usuario: Usuario) {
  //   return this.save(usuario);
  // }

  // alteraSenhaUsuarioComResetToken(id: number, novaSenha: string) {
  //   return this.update(id, {
  //     senha: novaSenha,
  //     tokenAcesso: null,
  //     expiracaoToken: null
  //   });
  // }

  // alteraTokenExpiracaoUsuario(
  //   id: number,
  //   novoTokenAcesso: string,
  //   novaExpiracaoToken: Date
  // ): Promise<Usuario> {
  //   return this.save({
  //     idUsuario: id,
  //     tokenAcesso: novoTokenAcesso,
  //     expiracaoToken: novaExpiracaoToken
  //   });
  // }
}

export const UsuarioRepositoryProvider = {
  provide: UsuarioRepository,
  useFactory: (connection: Connection) =>
    connection.getCustomRepository(UsuarioRepository),
  inject: [Connection]
};
