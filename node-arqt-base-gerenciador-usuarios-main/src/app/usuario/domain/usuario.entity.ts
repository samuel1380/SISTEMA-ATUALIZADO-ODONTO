import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Empresa } from '../../empresa/domain/empresa.entity';
import { Permissao } from '../../permissao/permissao/domain/permissao.entity';
@Entity('TbUsuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  idUsuario?: number;

  @Column({ type: 'varchar', length: 70, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 70, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 70, nullable: false })
  senha: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  token?: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  tipoUsuario: string;

  @Column({ type: 'datetime', nullable: true, default: null })
  dataExpiracaoToken?: Date;

  @Column({ type: 'boolean', default: false })
  bloqueado?: boolean;

  @Column({ type: 'boolean', default: false })
  ativo?: boolean;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @ManyToMany(() => Empresa, {
    onDelete: 'CASCADE',
    onUpdate:'CASCADE',
    eager: true
  })
  @JoinTable({
    name: 'TbUsuarioTbEmpresa',
    joinColumn: {
      name: 'idUsuario',
      referencedColumnName: 'idUsuario'
    },
    inverseJoinColumn: {
      name: 'idEmpresa',
      referencedColumnName: 'idEmpresa'
    }
  })
  empresas?: Empresa[];


  @ManyToMany(type => Permissao, {
    cascade: true,
    eager: true
  })
  @JoinTable({
    name: 'TbUsuarioTbPermissao',
    joinColumn: {
      name: 'idUsuario',
      referencedColumnName: 'idUsuario'
    },
    inverseJoinColumn: {
      name: 'idPermissao',
      referencedColumnName: 'idPermissao'
    }
  })
  permissoes?: Permissao[];
}
