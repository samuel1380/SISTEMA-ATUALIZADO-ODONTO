import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { UsuarioService as BaseUsuarioService } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { UsuarioCadastroDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/dto/usuarioCadastro.dto';
import { Usuario } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/domain/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangePasswordDto } from '../dto/change-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    private readonly baseUsuarioService: BaseUsuarioService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async listarUsuarios(idEmpresa?: number): Promise<Usuario[]> {
    if (idEmpresa) {
      return this.baseUsuarioService.buscarUsuariosPorEmpresaId(idEmpresa);
    }
    
    // Se não especificou empresa, busca todos os usuários
    // Usa query direta no repositório
    return this.usuarioRepository.find({
      relations: ['empresas', 'permissoes'],
    });
  }

  async buscarUsuarioPorId(idUsuario: number): Promise<Usuario> {
    const usuario = await this.baseUsuarioService.buscarUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${idUsuario} não encontrado.`);
    }
    return usuario;
  }

  async criarUsuario(dto: CreateUsuarioDto, currentUser: any): Promise<Usuario> {
    const usuarioCadastroDto = new UsuarioCadastroDto();
    usuarioCadastroDto.nome = dto.nome;
    usuarioCadastroDto.email = dto.email;
    usuarioCadastroDto.tipoUsuario = dto.tipoUsuario;
    usuarioCadastroDto.permissoes = dto.permissoes || [];
    usuarioCadastroDto.ativo = dto.ativo !== undefined ? dto.ativo : true;
    usuarioCadastroDto.bloqueado = dto.bloqueado !== undefined ? dto.bloqueado : false;
    usuarioCadastroDto.idUsuarioCadastro = currentUser.user.idUsuario;

    try {
      const resultado = await this.baseUsuarioService.cadastrarUsuario(usuarioCadastroDto);
      
      // Se foi especificada uma empresa, adiciona o usuário a ela
      if (dto.idEmpresa) {
        await this.baseUsuarioService.adicionarUsuarioNaEmpresa(resultado.idUsuario, dto.idEmpresa);
      }

      // Busca o usuário completo para retornar
      return await this.buscarUsuarioPorId(resultado.idUsuario);
    } catch (error) {
      this.logger.error(`Erro ao criar usuário: ${error.message}`, error.stack);
      throw new BadRequestException(`Erro ao criar usuário: ${error.message}`);
    }
  }

  async editarUsuario(idUsuario: number, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuarioExistente = await this.buscarUsuarioPorId(idUsuario);
    
    const usuarioCadastroDto = new UsuarioCadastroDto();
    usuarioCadastroDto.nome = dto.nome || usuarioExistente.nome;
    usuarioCadastroDto.email = dto.email || usuarioExistente.email;
    usuarioCadastroDto.tipoUsuario = dto.tipoUsuario || usuarioExistente.tipoUsuario;
    usuarioCadastroDto.idUsuarioCadastro = usuarioExistente.idUsuarioCadastro;

    try {
      await this.baseUsuarioService.editarUsuario(idUsuario, usuarioCadastroDto);
      return await this.buscarUsuarioPorId(idUsuario);
    } catch (error) {
      this.logger.error(`Erro ao editar usuário: ${error.message}`, error.stack);
      throw new BadRequestException(`Erro ao editar usuário: ${error.message}`);
    }
  }

  async ativarUsuario(idUsuario: number): Promise<Usuario> {
    const usuario = await this.buscarUsuarioPorId(idUsuario);
    
    await this.usuarioRepository.update(idUsuario, { ativo: true });
    
    this.logger.log(`Usuário ${idUsuario} ativado`);
    return await this.buscarUsuarioPorId(idUsuario);
  }

  async inativarUsuario(idUsuario: number): Promise<Usuario> {
    const usuario = await this.buscarUsuarioPorId(idUsuario);
    
    await this.usuarioRepository.update(idUsuario, { ativo: false });
    
    this.logger.log(`Usuário ${idUsuario} inativado`);
    return await this.buscarUsuarioPorId(idUsuario);
  }

  async adicionarPermissao(idUsuario: number, permissao: string): Promise<Usuario> {
    await this.buscarUsuarioPorId(idUsuario);
    
    try {
      await this.baseUsuarioService.adicionarPermissao(idUsuario, permissao);
      this.logger.log(`Permissão ${permissao} adicionada ao usuário ${idUsuario}`);
      return await this.buscarUsuarioPorId(idUsuario);
    } catch (error) {
      this.logger.error(`Erro ao adicionar permissão: ${error.message}`, error.stack);
      throw new BadRequestException(`Erro ao adicionar permissão: ${error.message}`);
    }
  }

  async removerPermissao(idUsuario: number, permissao: string): Promise<Usuario> {
    await this.buscarUsuarioPorId(idUsuario);
    
    try {
      await this.baseUsuarioService.removerPermissao(idUsuario, permissao);
      this.logger.log(`Permissão ${permissao} removida do usuário ${idUsuario}`);
      return await this.buscarUsuarioPorId(idUsuario);
    } catch (error) {
      this.logger.error(`Erro ao remover permissão: ${error.message}`, error.stack);
      throw new BadRequestException(`Erro ao remover permissão: ${error.message}`);
    }
  }

  async listarUsuariosPorEmpresa(idEmpresa: number): Promise<Usuario[]> {
    return this.baseUsuarioService.buscarUsuariosPorEmpresaId(idEmpresa);
  }

  private criptografarNovaSenha(senha: string): string {
    const secret = process.env.CHAVE_SECRETA || 'hunter_segredo';
    return crypto.createHmac('sha256', secret).update(senha).digest('hex');
  }

  private gerarSenhaAleatoria(): string {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    // Garantir regras
    retVal += "aA1!"; 
    for (let i = 0, n = charset.length; i < length - 4; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    // shuffle
    return retVal.split('').sort(() => 0.5 - Math.random()).join('');
  }

  async resetarSenha(idUsuario: number): Promise<{ senhaGerada: string }> {
    const usuario = await this.buscarUsuarioPorId(idUsuario);
    const novaSenha = this.gerarSenhaAleatoria();
    const senhaCriptografada = this.criptografarNovaSenha(novaSenha);

    await this.usuarioRepository.update(idUsuario, { senha: senhaCriptografada });
    
    this.logger.log(`Senha do usuário ${idUsuario} resetada`);
    return { senhaGerada: novaSenha };
  }

  async alterarSenha(idUsuario: number, dto: ChangePasswordDto): Promise<void> {
    const usuario = await this.buscarUsuarioPorId(idUsuario);
    
    const senhaAtualCriptografada = this.criptografarNovaSenha(dto.senhaAtual);
    if (usuario.senha !== senhaAtualCriptografada) {
      throw new BadRequestException('A senha atual está incorreta');
    }

    const novaSenhaCriptografada = this.criptografarNovaSenha(dto.novaSenha);
    await this.usuarioRepository.update(idUsuario, { senha: novaSenhaCriptografada });
    
    this.logger.log(`Senha do usuário ${idUsuario} alterada com sucesso`);
  }
}
