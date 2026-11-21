import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorEmpresa } from '../domain/corEmpresa.entity';
import { CorEmpresaDto } from '../dto/corEmpresa.dto';

@Injectable()
export class CorEmpresaService {
  constructor(
    @InjectRepository(CorEmpresa)
    private readonly corEmpresaRepository: Repository<CorEmpresa>,
  ) {}

  /**
   * Sincroniza as cores associadas a uma empresa.
   * Remove as que não estão na lista e adiciona as que são novas.
   */
  async sincronizarCoresEmpresa(
    currentUser: any,
    idEmpresa: number,
    coresDto: CorEmpresaDto[],
  ): Promise<CorEmpresa[]> {
    const idUsuarioCadastro = currentUser.user.idUsuario;

    // 1. Buscar o estado atual das associações de cores.
    const coresAtuais = await this.corEmpresaRepository.find({
      where: { idEmpresa },
    });

    // 2. Usar Map e Set para performance.
    const mapaCoresAtuais = new Map(coresAtuais.map((c) => [c.idCor, c]));
    const idsCoresDto = new Set(coresDto.map((c) => c.idCor));

    // 3. Identificar e remover cores que não estão mais na lista.
    const coresParaRemover = coresAtuais.filter((c) => !idsCoresDto.has(c.idCor));
    if (coresParaRemover.length > 0) {
      await this.corEmpresaRepository.remove(coresParaRemover);
    }

    // 4. Identificar e adicionar novas cores.
    const coresParaAdicionar = coresDto
      .filter((dto) => !mapaCoresAtuais.has(dto.idCor))
      .map((dto) =>
        this.corEmpresaRepository.create({
          idEmpresa,
          idCor: dto.idCor,
          ativo: 1,
          idUsuarioCadastro,
        }),
      );

    if (coresParaAdicionar.length > 0) {
      await this.corEmpresaRepository.save(coresParaAdicionar);
    }

    // 5. Retornar o estado final e atualizado.
    return this.corEmpresaRepository.find({ where: { idEmpresa } });
  }

  async buscarPorEmpresa(idEmpresa: number): Promise<CorEmpresa[]> {
    return this.corEmpresaRepository.find({ where: { idEmpresa } });
  }
}

