import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cor } from '../domain/cor.entity';
import { CorDto } from '../dto/cor.dto';

@Injectable()
export class CorService {
  constructor(
    @InjectRepository(Cor)
    private readonly corRepository: Repository<Cor>,
  ) {}

  async cadastrarCor(currentUser: any, corDto: CorDto): Promise<Cor> {
    const cor = this.corRepository.create({
      ...corDto,
      ativo: 1,
      idUsuarioCadastro: currentUser.user.idUsuario,
    });
    return this.corRepository.save(cor);
  }

  async buscaCores(): Promise<Cor[]> {
    return this.corRepository.find({ where: { ativo: 1 } });
  }

  async editarCor(idCor: number, corDto: Partial<CorDto>): Promise<Cor> {
    const cor = await this.corRepository.preload({
      idCor,
      ...corDto,
    });
    if (!cor) {
      throw new NotFoundException(`Cor com ID ${idCor} não encontrada.`);
    }
    return this.corRepository.save(cor);
  }

  async buscaCorPorId(idCor: number): Promise<Cor | null> {
    return this.corRepository.findOne({where: { idCor } });
  }

  async desativarCor(idCor: number): Promise<void> {
    const result = await this.corRepository.update(idCor, { ativo: 0 });
    if (result.affected === 0) {
      throw new NotFoundException(`Cor com ID ${idCor} não encontrada.`);
    }
  }
}
