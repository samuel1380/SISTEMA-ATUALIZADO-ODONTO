import { Injectable } from '@nestjs/common';
import { BadRequest } from 'src/libs/badRequest';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { EmailService } from '../../email/business/email.service';
import { UsuarioService } from '../../usuario/business/usuario.service';
import { EmpresaCadastroDto } from '../dto/empresaCadastro.dto';
import { EmpresaRepository } from '../repository/empresa.repository';

@Injectable()
export class EmpresaService {
  constructor(
    private empresaRepository: EmpresaRepository,
    private emailService: EmailService
  ) { }

  async buscarEmpresasPorId(empresaId: number) {
    return this.empresaRepository.buscarEmpresasPorId(empresaId);
  }

  async buscarEmpresasAprovadas() {
    return this.empresaRepository.buscarEmpresasAprovadas();
  }

  async buscarEmpresas(query?: string) {
    return this.empresaRepository.buscarEmpresas(query);
  }

  async buscarEmpresasAguardandoAprovacao() {
    return this.empresaRepository.buscarEmpresasAguardandoAprovacao();
  }

  async cadastrarEmpresa(currentUser: CurrentUserDto, empresa: EmpresaCadastroDto) {
    const empresaJaExiste = await this.empresaRepository.buscarEmpresaPorEmail(empresa.email);

    if (empresaJaExiste) throw new BadRequest('Email inválido');

    const novaEmpresa = await this.empresaRepository.cadastrarEmpresa({
      nome: empresa.nome,
      razaoSocial: empresa.razaoSocial,
      documento: empresa.documento,
      tipoEmpresa: empresa.tipoEmpresa,
      cep: empresa.cep,
      logradouro: empresa.logradouro,
      complemento: empresa.complemento,
      bairro: empresa.bairro,
      cidade: empresa.cidade,
      uf: empresa.uf,
      responsavelTecnico: empresa.responsavelTecnico,
      numeroDocumentoResponsavelTecnico: empresa.numeroDocumentoResponsavelTecnico,
      nomeResponsavelFinanceiro: empresa.nomeResponsavelFinanceiro,
      telefoneFinanceiro: empresa.telefoneFinanceiro,
      emailFinanceiro: empresa.emailFinanceiro,
      nomeResponsavel: empresa.nomeResponsavel,
      telefone: empresa.telefone,
      email: empresa.email,
      ativo: true,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 0
    });

    if (!novaEmpresa) throw new BadRequest('Cadastro inválido');

    const { idEmpresa, nome, email } = novaEmpresa;

    return { idEmpresa, nome, email };
  }

  async editarEmpresa(currentUser: CurrentUserDto, empresaId: number, empresa: EmpresaCadastroDto) {
    const empresaJaExiste = await this.empresaRepository.buscarEmpresaPorId(empresaId);

    if (!empresaJaExiste) throw new BadRequest('Erro ao atualizar empresa');

    const empresaAtualizada = await this.empresaRepository.atualizarEmpresa(empresaId, {
      nome: empresa.nome,
      email: empresa.email,
      cep: empresa.cep,
      logradouro: empresa.logradouro,
      complemento: empresa.complemento,
      bairro: empresa.bairro,
      cidade: empresa.cidade,
      uf: empresa.uf,
      responsavelTecnico: empresa.responsavelTecnico,
      numeroDocumentoResponsavelTecnico: empresa.numeroDocumentoResponsavelTecnico,
      nomeResponsavel: empresa.nomeResponsavel,
      telefone: empresa.telefone,
      ativo: true,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 0
    });

    if (!empresaAtualizada) throw new BadRequest('Erro ao atualizar empresa');

    const { nome, email } = await this.empresaRepository.buscarEmpresaPorId(empresaId);;

    return { nome, email };
  }

  async desabilitarEmpresa(idEmpresa: number) {
    return await this.empresaRepository.atualizarEmpresa(idEmpresa, {
      ativo: false
    });
  }

  async ativarEmpresa(idEmpresa: number) {
    return await this.empresaRepository.atualizarEmpresa(idEmpresa, {
      ativo: true
    });
  }

  async aprovaEmpresa(idEmpresa: number) {
    return await this.empresaRepository.atualizarEmpresa(idEmpresa, {
      aprovada: true
    });
  }
}
