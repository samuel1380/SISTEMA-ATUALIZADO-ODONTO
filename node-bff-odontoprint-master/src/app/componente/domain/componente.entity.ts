import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Exclusion,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ComponenteEmpresa } from '../../componenteEmpresa/domain/componenteEmpresa.entity';
import { Trabalho } from '@src/app/trabalho/domain/trabalho.entity';
import { MarcaComponente } from '@src/app/marcaComponente/domain/marcaComponente.entity';

@Entity('TbComponente')
export class Componente {
  @PrimaryGeneratedColumn()
  idComponente?: number;

  @Column({ type: 'int', nullable: false })
  idMarcaComponente: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: 'decimal', nullable: false })
  preco: number;

  @Column({ type: 'boolean', default: false })
  hasParafuso: boolean;

  @Column({ type: "boolean", default: true, select: false })
  ativo: number;

  @Column({ type: 'int', nullable: false, select: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  @Column({ select: false })
  dataInclusao?: Date;

  @UpdateDateColumn()
  @Column({ select: false })
  dataAlteracao?: Date;

  @DeleteDateColumn()
  @Column({ select: false })
  dataExclusao?: Date;

  // @OneToMany(type => CadastroComplementarEmpresa, (cadastroComplementarEmpresa) => cadastroComplementarEmpresa.produtosEmpresa)
  // @JoinColumn({ name: 'idEmpresa' })
  // cadastroComplementarEmpresa?: CadastroComplementarEmpresa;

  @OneToMany(type => ComponenteEmpresa, (componenteEmpresa) => componenteEmpresa.componente)
  componenteEmpresa?: ComponenteEmpresa[];

  @ManyToMany(type => Trabalho)
  @JoinTable({
    name: 'TbComponentesTbTrabalho',
    joinColumn: {
      name: "idComponente",
      referencedColumnName: "idComponente"
    },
    inverseJoinColumn: {
      name: "idTrabalho",
      referencedColumnName: "idTrabalho"
    }
  })
  trabalho?: Trabalho[]

  @OneToOne(type => MarcaComponente, { eager: true })
  @JoinColumn({ name: 'idMarcaComponente' })
  marca: MarcaComponente;
}
