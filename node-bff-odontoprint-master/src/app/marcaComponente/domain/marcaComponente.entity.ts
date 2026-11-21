import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('TbMarcaComponente')
export class MarcaComponente {
  @PrimaryGeneratedColumn()
  idMarcaComponente?: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;

  @Column({ type: "boolean", default: true })
  ativo: number;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  // @OneToMany(type => CadastroComplementarEmpresa, (cadastroComplementarEmpresa) => cadastroComplementarEmpresa.produtosEmpresa)
  // @JoinColumn({ name: 'idEmpresa' })
  // cadastroComplementarEmpresa?: CadastroComplementarEmpresa;

}
