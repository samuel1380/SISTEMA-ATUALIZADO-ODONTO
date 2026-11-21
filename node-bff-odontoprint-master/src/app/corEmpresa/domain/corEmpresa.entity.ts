import { Produto } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/produto/domain/produto.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { CadastroComplementarEmpresa } from '../../cadastroComplementarEmpresa/domain/cadastroComplementarEmpresa.entity';
import { Cor } from '../../cor/domain/cor.entity';

@Entity('TbCorEmpresa')
export class CorEmpresa {
  @PrimaryGeneratedColumn()
  idCorEmpresa?: number;

  @Column({ type: 'int', nullable: false })
  idCor?: number;

  @Column({ type: 'int', nullable: false })
  idEmpresa?: number;

  @Column({ type: "boolean", default: true, select: false })
  ativo: number;

  @Column({ type: 'int', nullable: false, select: false })
  idUsuarioCadastro: number;

  @CreateDateColumn({ select: false })
  dataInclusao?: Date;

  @UpdateDateColumn({ select: false })
  dataAlteracao?: Date;

  @DeleteDateColumn({ select: false })
  dataExclusao?: Date;

  // @ManyToOne(type => CadastroComplementarEmpresa, (cadastroComplementarEmpresa) => cadastroComplementarEmpresa.corEmpresa)
  // @JoinColumn({ name: 'idEmpresa' })
  // cadastroComplementarEmpresa?: CadastroComplementarEmpresa;

  @ManyToOne(type => Cor, { eager: true })
  @JoinColumn({ name: 'idCor' })
  cor?: Cor;

}
