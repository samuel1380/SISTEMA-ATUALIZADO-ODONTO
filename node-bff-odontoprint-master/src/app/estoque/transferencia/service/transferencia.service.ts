import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstoqueService } from '../../estoque/service/estoque.service';
import { CreateTransferenciaDto } from '../domain/dto/create-transferencia.dto';
import { Transferencia } from '../domain/transferencia.entity';
import { AlmoxarifadoService } from '../../almoxarifado/service/almoxarifado.service';

@Injectable()
export class TransferenciaService {
  constructor(
    @InjectRepository(Transferencia)
    private readonly transferenciaRepository: Repository<Transferencia>,
    private readonly estoqueService: EstoqueService,
    private readonly almoxarifadoService: AlmoxarifadoService,
  ) {}

  async create(dto: CreateTransferenciaDto): Promise<Transferencia> {
    const [almoxarifadoOrigem, almoxarifadoDestino] = await Promise.all([
      this.almoxarifadoService['almoxarifadoRepository'].findOne({ where: { idAlmoxarifado: dto.idAlmoxarifadoOrigem } }),
      this.almoxarifadoService['almoxarifadoRepository'].findOne({ where: { idAlmoxarifado: dto.idAlmoxarifadoDestino } }),
    ]);

    if (!almoxarifadoOrigem) {
      console.warn('Almoxarifado de origem não encontrado:', dto.idAlmoxarifadoOrigem, " Registrando débito global");
      // throw new BadRequestException(`Almoxarifado de origem com ID ${dto.idAlmoxarifadoOrigem} não encontrado.`);
    }

    if (!almoxarifadoDestino) {
      throw new BadRequestException(`Almoxarifado de destino com ID ${dto.idAlmoxarifadoDestino} não encontrado.`);
    }
    
    if (dto.idAlmoxarifadoOrigem === dto.idAlmoxarifadoDestino) {
      throw new BadRequestException('O almoxarifado de origem e destino não podem ser o mesmo.');
    }
    
    if(dto.idAlmoxarifadoOrigem) {
      // 1. Encontrar o estoque de origem
      const estoqueOrigem = await this.estoqueService['estoqueRepository'].findOne({
        where: { idAlmoxarifado: dto.idAlmoxarifadoOrigem, idComponente: dto.idComponente },
      });

      if (!estoqueOrigem || estoqueOrigem.quantidade < dto.quantidade) {
        throw new BadRequestException(`Estoque insuficiente do produto no almoxarifado de origem.`);
      }
    }

    return await this.transferenciaRepository.save(dto);
  }

  findAll(): Promise<Transferencia[]> {
    return this.transferenciaRepository.find({
      order: { dataTransferencia: 'DESC' },
    });
  }

  /**
   * Retorna a lista de produtos/estoque que um almoxarifado "emprestou" para outros.
   * (Onde ele é a origem)
   */
async findDebtsByAlmoxarifado(idAlmoxarifado: number): Promise<any[]> {
    const rawResults = await this.transferenciaRepository
      .createQueryBuilder('transferencia')
      .select('componente.idComponente', 'idComponente')
      .addSelect('componente.nome', 'nome')
      .addSelect('SUM(transferencia.quantidade)', 'quantidade')
      .innerJoin('transferencia.componente', 'componente')
      .where('transferencia.idAlmoxarifadoDestino = :idAlmoxarifado', { idAlmoxarifado })
      .andWhere('transferencia.baixado = :baixado', { baixado: false })
      .groupBy('componente.idComponente, componente.nome')
      .orderBy('componente.nome', 'ASC')
      .getRawMany();


    return rawResults.map((item) => ({
      idComponente: item.idComponente,
      nome: item.nome,
      quantidade: parseInt(item.quantidade, 10) || 0,
    }));
  }

  /**
   * Retorna a lista de produtos/estoque que um almoxarifado "pegou emprestado" de outros.
   * (Onde ele é o destino)
   */
  async findCreditsByAlmoxarifado(idAlmoxarifado: number): Promise<any[]> {
    const rawResults = await this.transferenciaRepository
      .createQueryBuilder('transferencia')
      .select('componente.idComponente', 'idComponente')
      .addSelect('componente.nome', 'nome')
      .addSelect('SUM(transferencia.quantidade)', 'quantidade')
      .innerJoin('transferencia.componente', 'componente')
      .where('transferencia.idAlmoxarifadoOrigem = :idAlmoxarifado', { idAlmoxarifado })
      .andWhere('transferencia.baixado = :baixado', { baixado: false })
      .groupBy('componente.idComponente, componente.nome')
      .orderBy('componente.nome', 'ASC')
      .getRawMany();

    return rawResults.map((item) => ({
      idComponente: item.idComponente,
      nome: item.nome,
      quantidade: parseInt(item.quantidade, 10) || 0,
    }));
  }
}
