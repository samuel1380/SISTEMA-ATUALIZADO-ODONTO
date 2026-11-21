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
import { Permissao } from '../../permissao/domain/permissao.entity';

@Entity('TbGrupoPermissao')
export class GrupoPermissao {
  @PrimaryGeneratedColumn()
  idGrupoPermissao: number;

  @Column({
    type: 'varchar',
    length: 70,
    nullable: false
  })
  nome: string;

  @Column({ type: 'boolean', default: false })
  ativo: number;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @ManyToMany(() => Permissao)
  @JoinTable({
    name: 'TbGrupoPermissaoTbPermissao',
    joinColumn: {
      name: 'idGrupoPermissao',
      referencedColumnName: 'idGrupoPermissao'
    },
    inverseJoinColumn: {
      name: 'idPermissao',
      referencedColumnName: 'idPermissao'
    }
  })
  permissoes?: Permissao;
}
