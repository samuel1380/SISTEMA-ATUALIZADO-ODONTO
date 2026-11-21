import { Injectable, NotFoundException } from '@nestjs/common';
import { MarcaComponente } from '../domain/marcaComponente.entity';
import { MarcaComponenteDto } from '../dto/marcaComponente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MarcaComponenteService {
  constructor(
    @InjectRepository(MarcaComponente)
    private readonly marcaComponenteRepository: Repository<MarcaComponente>,
  ) {}

async cadastrarMarcaComponente(
    currentUser: any,
    marcaComponenteDto: MarcaComponenteDto,
  ): Promise<MarcaComponente> {
    const marcaComponente = this.marcaComponenteRepository.create({
      ...marcaComponenteDto,
      ativo: 1,
      idUsuarioCadastro: currentUser.user.idUsuario,
    });
    return this.marcaComponenteRepository.save(marcaComponente);
  }

  async buscarMarcaComponente(): Promise<MarcaComponente[]> {
    return this.marcaComponenteRepository.find({ where: { ativo: 1 } });
  }

  async buscarMarcaPorId(idMarcaComponente: number): Promise<MarcaComponente | null> {
    return this.marcaComponenteRepository.findOne({where: { idMarcaComponente } });
  }

async editarMarcaComponente(
    idMarcaComponente: number,
    marcaComponenteDto: Partial<MarcaComponenteDto>,
  ): Promise<MarcaComponente> {
    const marca = await this.marcaComponenteRepository.preload({
      idMarcaComponente,
      ...marcaComponenteDto,
    });
    if (!marca) {
      throw new NotFoundException(`Marca de Componente com ID ${idMarcaComponente} não encontrada.`);
    }
    return this.marcaComponenteRepository.save(marca);
  }

}
