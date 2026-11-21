import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricoStatusTrabalho } from '../domain/historicoStatusTrabalho.entity';

@Injectable()
export class HistoricoStatusTrabalhoService {
  constructor(
    @InjectRepository(HistoricoStatusTrabalho)
    private readonly historicoStatusTrabalhoRepository: Repository<HistoricoStatusTrabalho>,
  ) {}

  async cadastrarHistoricoStatusTrabalho(currentUser: any, idTrabalho: number, statusAnterior: string, statusAtual: string) {

    const historicoStatusTrabalhoDomain = new HistoricoStatusTrabalho();

    historicoStatusTrabalhoDomain.nome = "Mudança de status";
    historicoStatusTrabalhoDomain.idTrabalho = idTrabalho;
    historicoStatusTrabalhoDomain.statusAterior = statusAnterior;
    historicoStatusTrabalhoDomain.statusAtual = statusAtual;
    historicoStatusTrabalhoDomain.ativo = 1;
    historicoStatusTrabalhoDomain.idUsuarioCadastro = currentUser.user.idUsuario;

    return this.historicoStatusTrabalhoRepository.save(historicoStatusTrabalhoDomain);
  }

  async buscaHistoricoStatusTrabalho(idTrabalho: number) {
    return this.historicoStatusTrabalhoRepository.find({
      where: {
        idTrabalho,
        ativo: 1,
      },
      order: { dataInclusao: 'ASC' },
    });
  }
}
