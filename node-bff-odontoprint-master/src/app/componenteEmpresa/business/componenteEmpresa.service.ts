import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponenteEmpresa } from '../domain/componenteEmpresa.entity';
import { ComponenteEmpresaDto } from '../dto/componenteEmpresa.dto';

@Injectable()
export class ComponenteEmpresaService {
  constructor(
    @InjectRepository(ComponenteEmpresa)
    private readonly componenteEmpresaRepository: Repository<ComponenteEmpresa>,
  ) {}

  /**
   * Sincroniza os componentes associados a uma empresa.
   * Remove os que não estão na lista e adiciona os que são novos.
   */
  async sincronizarComponentesEmpresa(
    currentUser: any,
    idEmpresa: number,
    componentesDto: ComponenteEmpresaDto[],
  ): Promise<ComponenteEmpresa[]> {
    const idUsuarioCadastro = currentUser.user.idUsuario;

    // 1. Buscar o estado atual das associações de componentes.
    const componentesAtuais = await this.componenteEmpresaRepository.find({
      where: { idEmpresa },
    });

    // 2. Usar Map e Set para performance.
    const mapaComponentesAtuais = new Map(componentesAtuais.map((c) => [c.idComponente, c]));
    const idsComponentesDto = new Set(componentesDto.map((c) => c.idComponente));

    // 3. Identificar e remover componentes que não estão mais na lista.
    const componentesParaRemover = componentesAtuais.filter((c) => !idsComponentesDto.has(c.idComponente));
    if (componentesParaRemover.length > 0) {
      await this.componenteEmpresaRepository.remove(componentesParaRemover);
    }

    // 4. Identificar e adicionar novos componentes.
    const componentesParaAdicionar = componentesDto
      .filter((dto) => !mapaComponentesAtuais.has(dto.idComponente))
      .map((dto) =>
        this.componenteEmpresaRepository.create({
          idEmpresa,
          idComponente: dto.idComponente,
          ativo: 1,
          idUsuarioCadastro,
        }),
      );

    if (componentesParaAdicionar.length > 0) {
      await this.componenteEmpresaRepository.save(componentesParaAdicionar);
    }

    // 5. Retornar o estado final e atualizado.
    return this.componenteEmpresaRepository.find({ where: { idEmpresa } });
  }

  async buscarPorEmpresa(idEmpresa: number): Promise<ComponenteEmpresa[]> {
    return this.componenteEmpresaRepository.find({ where: { idEmpresa } });
  }

  async buscarPorEmpresaEComponente(idEmpresa: number, idComponente: number): Promise<ComponenteEmpresa | null> {
    return this.componenteEmpresaRepository.findOne({ where: { idEmpresa, idComponente } });
  }
}

