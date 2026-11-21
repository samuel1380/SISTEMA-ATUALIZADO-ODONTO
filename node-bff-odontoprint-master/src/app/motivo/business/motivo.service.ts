import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MotivoDto, MotivoTipo } from '../dto/motivo.dto';
import { Motivo } from '../domain/motivo.entity';

@Injectable()
export class MotivoService {
  constructor(
    @InjectRepository(Motivo)
    private readonly motivoRepository: Repository<Motivo>,
  ) {}

  async cadastrarMotivo(currentUser: any, motivoDto: MotivoDto): Promise<Motivo> {
    const motivo = this.motivoRepository.create({
      ...motivoDto,
      ativo: 1,
      idUsuarioCadastro: currentUser.user.idUsuario,
    });
    return this.motivoRepository.save(motivo);
  }

  async buscaMotivos(tipo?: MotivoTipo, incluirInativos = false): Promise<Motivo[]> {
    const where: any = {};
    if (!incluirInativos) where.ativo = 1;
    if (tipo) where.tipo = tipo;
    return this.motivoRepository.find({ where, order: { nome: 'ASC' } });
  }

  async buscaMotivoPorId(idMotivo: number): Promise<Motivo | null> {
    return this.motivoRepository.findOne({ where: { idMotivo } });
  }

  async editarMotivo(idMotivo: number, motivoDto: Partial<MotivoDto>): Promise<Motivo> {
    const motivo = await this.motivoRepository.preload({
      idMotivo,
      ...motivoDto,
    });
    if (!motivo) {
      throw new NotFoundException(`Motivo com ID ${idMotivo} não encontrado.`);
    }
    return this.motivoRepository.save(motivo);
  }

  async desativarMotivo(idMotivo: number): Promise<void> {
    const result = await this.motivoRepository.update(idMotivo, {
      ativo: 0,
      dataExclusao: new Date(),
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Motivo com ID ${idMotivo} não encontrado.`);
    }
  }
}

