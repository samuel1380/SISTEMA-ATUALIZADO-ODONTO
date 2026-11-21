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
import { Usuario } from '../../../usuario/domain/usuario.entity';

@Entity('TbPermissao')
export class Permissao {
  @PrimaryGeneratedColumn()
  idPermissao: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  nome: string;

  @Column({ type: 'boolean', default: true })
  ativo: number;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @ManyToMany(type => Usuario)
  @JoinTable({
    name: 'TbUsuarioTbPermissao',
    joinColumn: {
      name: "idPermissao",
      referencedColumnName: "idPermissao"
    },
    inverseJoinColumn: {
      name: "idUsuario",
      referencedColumnName: "idUsuario"
    }
  })
  usuarios?: Usuario[]

}
