import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socio } from '../domain/socio.entity';
import { Credor } from '../domain/credor.entity';
import { FinanceiroService } from './financeiro.service';
import { TipoConta } from '../domain/conta.entity';

export interface CreateSocioDto {
  nome: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  idEmpresa?: number;
}

export interface CreateCredorDto {
  nome: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  idEmpresa?: number;
}

@Injectable()
export class SocioCredorService {
  constructor(
    @InjectRepository(Socio)
    private readonly socioRepository: Repository<Socio>,
    @InjectRepository(Credor)
    private readonly credorRepository: Repository<Credor>,
    private readonly financeiroService: FinanceiroService,
  ) {}

  // =================================================================
  // GESTÃO DE SÓCIOS
  // =================================================================

  async criarSocio(dto: CreateSocioDto): Promise<Socio> {
    // Criar conta automaticamente para o sócio
    const conta = await this.financeiroService.criarConta({
      nome: `Conta - ${dto.nome}`,
      tipo: TipoConta.CONTA_CORRENTE,
      saldoInicial: 0,
      idEmpresa: dto.idEmpresa,
    });

    // Criar sócio vinculado à conta
    const socio = this.socioRepository.create({
      ...dto,
      idConta: conta.idConta,
    });

    return this.socioRepository.save(socio);
  }

  async listarSocios(idEmpresa?: number): Promise<Socio[]> {
    const where: any = { ativo: true };
    if (idEmpresa) {
      where.idEmpresa = idEmpresa;
    }
    return this.socioRepository.find({
      where,
      relations: ['conta'],
      order: { nome: 'ASC' },
    });
  }

  async buscarSocioPorId(idSocio: number): Promise<Socio> {
    const socio = await this.socioRepository.findOne({
      where: { idSocio },
      relations: ['conta'],
    });
    if (!socio) {
      throw new NotFoundException(`Sócio com ID ${idSocio} não encontrado.`);
    }
    return socio;
  }

  async atualizarSocio(idSocio: number, dto: Partial<CreateSocioDto>): Promise<Socio> {
    const socio = await this.buscarSocioPorId(idSocio);
    Object.assign(socio, dto);
    return this.socioRepository.save(socio);
  }

  async excluirSocio(idSocio: number): Promise<void> {
    const socio = await this.buscarSocioPorId(idSocio);
    socio.ativo = false;
    await this.socioRepository.save(socio);
  }

  // =================================================================
  // GESTÃO DE CREDORES
  // =================================================================

  async criarCredor(dto: CreateCredorDto): Promise<Credor> {
    // Criar conta automaticamente para o credor
    const conta = await this.financeiroService.criarConta({
      nome: `Conta - ${dto.nome}`,
      tipo: TipoConta.CONTA_CORRENTE,
      saldoInicial: 0,
      idEmpresa: dto.idEmpresa,
    });

    // Criar credor vinculado à conta
    const credor = this.credorRepository.create({
      ...dto,
      idConta: conta.idConta,
    });

    return this.credorRepository.save(credor);
  }

  async listarCredores(idEmpresa?: number): Promise<Credor[]> {
    const where: any = { ativo: true };
    if (idEmpresa) {
      where.idEmpresa = idEmpresa;
    }
    return this.credorRepository.find({
      where,
      relations: ['conta'],
      order: { nome: 'ASC' },
    });
  }

  async buscarCredorPorId(idCredor: number): Promise<Credor> {
    const credor = await this.credorRepository.findOne({
      where: { idCredor },
      relations: ['conta'],
    });
    if (!credor) {
      throw new NotFoundException(`Credor com ID ${idCredor} não encontrado.`);
    }
    return credor;
  }

  async atualizarCredor(idCredor: number, dto: Partial<CreateCredorDto>): Promise<Credor> {
    const credor = await this.buscarCredorPorId(idCredor);
    Object.assign(credor, dto);
    return this.credorRepository.save(credor);
  }

  async excluirCredor(idCredor: number): Promise<void> {
    const credor = await this.buscarCredorPorId(idCredor);
    credor.ativo = false;
    await this.credorRepository.save(credor);
  }
}

