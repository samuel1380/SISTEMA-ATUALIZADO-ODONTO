import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Pedido } from '../../pedido/domain/pedido.entity';
import { Usuario } from '../../usuario/domain/usuario.entity';


@Entity('TbEmpresa')
export class Empresa {
  @PrimaryGeneratedColumn()
  idEmpresa?: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razaoSocial?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  documento?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tipoEmpresa?: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  cep: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  logradouro: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complemento?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  bairro: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  cidade: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  uf: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  responsavelTecnico: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  numeroDocumentoResponsavelTecnico: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeResponsavelFinanceiro?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  telefoneFinanceiro?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailFinanceiro?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nomeResponsavel: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  telefone?: string;

  @Column({ type: 'boolean', default: false })
  aprovada?: boolean;

  @Column({ type: 'boolean', default: false })
  ativo: boolean;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @OneToMany(type => Pedido, (pedido) => pedido.empresa)
  pedido?: Pedido;

  @ManyToMany(type => Usuario)
  @JoinTable({
    name: 'TbUsuarioTbEmpresa',
    joinColumn: {
      name: "idEmpresa",
      referencedColumnName: "idEmpresa"
    },
    inverseJoinColumn: {
      name: "idUsuario",
      referencedColumnName: "idUsuario"
    }
  })
  usuarios?: Usuario[]
}
