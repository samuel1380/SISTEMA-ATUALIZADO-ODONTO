import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmpresaService } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios'
import { EmpresaCadastroDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/dto/empresaCadastro.dto';
import { UsuarioCadastroDto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/usuario/dto/usuarioCadastro.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GerenciadorEmpresaService {
  constructor(
    private empresaService: EmpresaService,
    private eventEmitter: EventEmitter2,
  ) { }

  async cadastraEmpresa(body: EmpresaCadastroDto) {
    const empresa = await this.empresaService.cadastrarEmpresa({} as any, body);

    this.eventEmitter.emit('empresa.created', { idEmpresa: empresa.idEmpresa, nome: empresa.nome });
    await this.aprovaEmpresa(empresa.idEmpresa);
    return empresa;
  }

  async editarEmpresa(idEmpresa: number, body: EmpresaCadastroDto) {
    return await this.empresaService.editarEmpresa({} as any, idEmpresa, body);
  }

  async emitirEventosEmpresas() {
    const empresas = await this.empresaService.buscarEmpresas();

    for (const empresa of empresas) {
      this.eventEmitter.emit('empresa.created', { idEmpresa: empresa.idEmpresa, nome: empresa.nome });
    }
  }

  async buscarEmpresas() {
    return await this.empresaService.buscarEmpresas();
  }

  async buscarEmpresasAguardandoAprovacao() {
    return await this.empresaService.buscarEmpresasAguardandoAprovacao();
  }

  async buscarEmpresa(idEmpresa: number) {
    return await this.empresaService.buscarEmpresasPorId(idEmpresa);
  }

  async desabilitarEmpresa(idEmpresa: number): Promise<any> {
    return await this.empresaService.desabilitarEmpresa(idEmpresa);
  }

  async aprovaEmpresa(idEmpresa: number): Promise<any> {
    const response = await this.empresaService.aprovaEmpresa(idEmpresa);
    if (response.affected != 1) {
      new HttpException('Erro ao aprovar empresa', HttpStatus.BAD_REQUEST);
    }

    const empresaAprovada = await this.empresaService.buscarEmpresasPorId(idEmpresa);
    const usuarioCadastroDto = new UsuarioCadastroDto();

    usuarioCadastroDto.nome = empresaAprovada.nome;
    usuarioCadastroDto.email = empresaAprovada.email;
    usuarioCadastroDto.ativo = true;
    usuarioCadastroDto.bloqueado = false;
    usuarioCadastroDto.permissoes = ['comum'];
    usuarioCadastroDto.tipoUsuario = 'externo';
    usuarioCadastroDto.idUsuarioCadastro = 1;

    // const usuario = await this.usuarioService.cadastrarUsuario(usuarioCadastroDto);
    // await this.usuarioService.adicionarUsuarioNaEmpresa(usuario.idUsuario, idEmpresa);

    // const dentistaDto = new DentistaDto();
    // dentistaDto.nome = empresaAprovada.nome;
    // dentistaDto.email = empresaAprovada.email;
    // dentistaDto.idEmpresa = idEmpresa.toString();
    
    // const dentista = await this.dentistaService.cadastrarDentista({user: { idUsuario: 1 }} as any, idEmpresa, dentistaDto);

    return response;
  }
}
