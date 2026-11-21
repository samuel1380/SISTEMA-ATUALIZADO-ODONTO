import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Almoxarifado } from '../../almoxarifado/domain/almoxarifado.entity';
import { EstoqueHistoricoConsumo } from './estoque-historico-consumo.entity';
import { Componente } from '@src/app/componente/domain/componente.entity';
@Entity('TbEstoque')
export class Estoque {
  @PrimaryGeneratedColumn()
  idEstoque: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'int', nullable: false })
  quantidade: number;

  @Column({ type: 'int' })
  idEmpresa: number;

  @Column({ name: 'idComponente', type: 'int' })
  idComponente: number;

  @Column({ type: 'int', nullable: false })
  idAlmoxarifado: number;

  @ManyToOne(() => Empresa, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa: Empresa;

  @ManyToOne(() => Componente, { eager: true })
  @JoinColumn({ name: 'idComponente' })
  componente: Componente;

  @ManyToOne(() => Almoxarifado, (almoxarifado) => almoxarifado.estoques, { eager: true })
  @JoinColumn({ name: 'idAlmoxarifado' })
  almoxarifado: Almoxarifado;

  @OneToMany(() => EstoqueHistoricoConsumo, (historico) => historico.estoque)
  historicosConsumo: EstoqueHistoricoConsumo[];

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;
}


