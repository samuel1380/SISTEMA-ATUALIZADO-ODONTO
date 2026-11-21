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
import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';
import { TabelaPrecoProduto } from '@src/app/tabelaPrecoProduto/domain/tabelaPrecoProduto.entity';

@Entity('TbEmpresaTabelaPreco')
export class EmpresaTabelaPreco {
  @PrimaryGeneratedColumn()
  idEmpresaTabelaPreco?: number;

  @Column({ type: 'int', nullable: false })
  idEmpresa: number;

  @Column({ type: 'int', nullable: false })
  idTabelaPrecoProduto: number;

  @Column({ 
    type: 'date', 
    nullable: false,
    transformer: {
      to: (value: Date) => {
        if (!value) return value;
        // Extrair apenas ano, mês e dia (ignorar hora)
        const ano = value.getUTCFullYear();
        const mes = value.getUTCMonth();
        const dia = value.getUTCDate();
        // Retornar string no formato MySQL date (YYYY-MM-DD)
        return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      },
      from: (value: string | Date | null) => {
        if (!value) return value;
        // Se já é Date, extrair apenas a parte da data
        if (value instanceof Date) {
          const ano = value.getUTCFullYear();
          const mes = value.getUTCMonth();
          const dia = value.getUTCDate();
          return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
        }
        // Converter string MySQL (YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss) para Date em UTC
        if (typeof value === 'string') {
          const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            const ano = parseInt(match[1], 10);
            const mes = parseInt(match[2], 10) - 1; // Mês é 0-indexed
            const dia = parseInt(match[3], 10);
            return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
          }
        }
        return value;
      }
    }
  })
  dataInicio: Date;

  @Column({ 
    type: 'date', 
    nullable: true,
    transformer: {
      to: (value: Date | null | undefined) => {
        if (!value) return null;
        // Extrair apenas ano, mês e dia (ignorar hora)
        const ano = value.getUTCFullYear();
        const mes = value.getUTCMonth();
        const dia = value.getUTCDate();
        // Retornar string no formato MySQL date (YYYY-MM-DD)
        return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      },
      from: (value: string | Date | null) => {
        if (!value) return null;
        // Se já é Date, extrair apenas a parte da data
        if (value instanceof Date) {
          const ano = value.getUTCFullYear();
          const mes = value.getUTCMonth();
          const dia = value.getUTCDate();
          return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
        }
        // Converter string MySQL (YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss) para Date em UTC
        if (typeof value === 'string') {
          const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            const ano = parseInt(match[1], 10);
            const mes = parseInt(match[2], 10) - 1; // Mês é 0-indexed
            const dia = parseInt(match[3], 10);
            return new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
          }
        }
        return null;
      }
    }
  })
  dataFim?: Date;

  @Column({ type: "boolean", default: true })
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

  @ManyToOne(() => Empresa, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa?: Empresa;

  @ManyToOne(() => TabelaPrecoProduto, { eager: true })
  @JoinColumn({ name: 'idTabelaPrecoProduto' })
  tabelaPrecoProduto?: TabelaPrecoProduto;
}
