import { Between, Connection, In, Repository } from "typeorm";
import { StatusTrabalho, Trabalho } from "../domain/trabalho.entity";
import { InjectRepository } from "@nestjs/typeorm";

export class TrabalhoRepository {

  constructor(
    @InjectRepository(Trabalho)
    private readonly trabalhoRepository: Repository<Trabalho>
  ) { }
  
  async buscarTrabalhosDaEmpresa(idEmpresa: number, status: StatusTrabalho[]) {
    return this.trabalhoRepository.find({
      where: {
        idEmpresa,
        ativo: true,
        status: In(status)
      },
      order: {
        ordem: "ASC",
        idTrabalho: "ASC",
      }
    });
  }

  async buscarTrabalhosConcluidos(status: StatusTrabalho[], idEmpresa?: number, dataInicio?: string, dataFim?: string) {
    return this.trabalhoRepository.find({
      where: {
        // idEmpresa,
        ativo: true,
        status: In(status),
        // dataConclusao: Between(new Date(dataInicio), new Date(dataFim)),
      },
      order: {
        ordem: "ASC",
        idTrabalho: "ASC",
      }
    });
  }

  async buscarRelatorio(idEmpresa: number, status: StatusTrabalho[], dataInicio: string, dataFim: string) {
    let buscaDataInclusao;
    let buscaDataConclusao;

    if (status.includes(StatusTrabalho.ENVIADO) || status.includes(StatusTrabalho.ENVIADO_PROVA) || status.includes(StatusTrabalho.PAGAMENTO_RECEBIDO)) {
      buscaDataConclusao = true
    } else if (!status.includes(StatusTrabalho.ENVIADO) && !status.includes(StatusTrabalho.ENVIADO_PROVA) && !status.includes(StatusTrabalho.PAGAMENTO_RECEBIDO)) {
      buscaDataInclusao = true
    } else {
      buscaDataConclusao = true;
      buscaDataInclusao = true;
    }

    const dataInicioDate = this.getInicioDia(new Date(dataInicio));
    const dataFimDate = this.getFimDia(new Date(dataFim));
    
    const where = {
      ativo: 1,
      status: In(status),
      dataConclusao: Between(dataInicioDate, dataFimDate), 
    } as any;

    const where2 = {
      ativo: 1,
      status: In(status),
      dataInclusao: Between(dataInicioDate, dataFimDate),
    } as any;

    if (idEmpresa != -1)  {
      if (buscaDataConclusao) {
        where.idEmpresa = idEmpresa;
      }
      if (buscaDataInclusao) {
        where2.idEmpresa = idEmpresa;
      }
    }

    const whereBase = [];

    if (buscaDataConclusao) {
      whereBase.push(where);
    }
    if (buscaDataInclusao) {
      whereBase.push(where2);
    }

    return this.trabalhoRepository.find({
      where: whereBase,
      order: {
        ordem: "ASC",
        idTrabalho: "ASC",
      }
    });
  }

  getInicioDia(data: Date)  {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0); // 00:00:00.000
    return inicio;
  }

  getFimDia(data: Date) {
    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);
    return fim;
  }

  async buscarTrabalhos(status: StatusTrabalho[]) {
    return this.trabalhoRepository.find({
      where: {
        ativo: true,
        status: In(status)
      },
      order: {
        ordem: "ASC",
        idTrabalho: "ASC",
      }
    });
  }

  async buscarProdutoPorId(idTrabalho: number) {
    return this.trabalhoRepository.findOne({
      where: { idTrabalho },
      relations: ['trabalhoMotivos', 'trabalhoMotivos.motivo'],
    });
  }

  async buscarProdutoPorIdComRelacoes(idTrabalho: number) {
    return this.trabalhoRepository.findOne({
      where: { idTrabalho },
      relations: [
        'servicos',
        'servicos.elementos',
        'componentes',
        'componentes.componente',
        'trabalhoMotivos',
        'trabalhoMotivos.motivo',
      ]
    });
  }

  /** Busca vários trabalhos com relações em uma única query (uso em recálculo em lote). */
  async buscarProdutosPorIdsComRelacoes(idsTrabalhos: number[]) {
    if (idsTrabalhos.length === 0) return [];
    return this.trabalhoRepository.find({
      where: { idTrabalho: In(idsTrabalhos) },
      relations: [
        'servicos',
        'servicos.elementos',
        'componentes',
        'componentes.componente',
        'trabalhoMotivos',
        'trabalhoMotivos.motivo',
      ]
    });
  }

  async salvaTrabalho(trabalho: Trabalho) {
    return this.trabalhoRepository.save(trabalho);
  }

  async atualizaTrabalho(trabalhoId: number, trabalho: Trabalho) {
    return this.trabalhoRepository.update(trabalhoId, trabalho);
  }

  async buscarTrabalhosPendentesPorIdEmpresa(idEmpresa: number) {
    return await this.trabalhoRepository.find({ where: { idEmpresa: idEmpresa, status: StatusTrabalho.PENDENTE }, order: { ordem: 'ASC' } });
  }

  async buscarTrabalhosPendentes() {
    return await this.trabalhoRepository.find({ where: { status: StatusTrabalho.PENDENTE } });
  }

  async atualizaOrdem(idTrabalho: number, ordem: number) {
    return this.trabalhoRepository.update(idTrabalho, { ordem });
  }

  async buscaUltimoId() {
    return await this.trabalhoRepository.query('select MAX(ordem) as ordem from TbTrabalho limit 1');
  }

  async buscarTrabalhosDashboard(dataInicio: string, dataFim: string) {
    const dataInicioDate = this.getInicioDia(new Date(dataInicio));
    const dataFimDate = this.getFimDia(new Date(dataFim));

    return this.trabalhoRepository.find({
      where: {
        ativo: true,
        dataInclusao: Between(dataInicioDate, dataFimDate)
      },
      relations: ['empresa', 'trabalhoMotivos', 'trabalhoMotivos.motivo'],
    });
  }
}
