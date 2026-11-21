import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { StatusFatura } from '../domain/fatura.entity';

@Injectable()
export class ParseStatusArrayPipe implements PipeTransform {
  transform(value: any): StatusFatura[] | undefined {
    // Se não há valor, retorna undefined
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    // Se já é um array, valida e retorna
    if (Array.isArray(value)) {
      return this.validateAndReturn(value);
    }

    // Se é uma string, pode ser separada por vírgula ou ser um único valor
    if (typeof value === 'string') {
      // Se contém vírgula, divide pela vírgula
      if (value.includes(',')) {
        const values = value.split(',').map(v => v.trim()).filter(v => v);
        return this.validateAndReturn(values);
      }
      // Se é um único valor, retorna como array
      return this.validateAndReturn([value.trim()]);
    }

    // Se é um único valor, converte para array
    return this.validateAndReturn([String(value)]);
  }

  private validateAndReturn(values: string[]): StatusFatura[] {
    const validStatuses = Object.values(StatusFatura);
    const statusArray: StatusFatura[] = [];

    for (const val of values) {
      if (validStatuses.includes(val as StatusFatura)) {
        statusArray.push(val as StatusFatura);
      } else {
        throw new BadRequestException(
          `Status inválido: ${val}. Status válidos: ${validStatuses.join(', ')}`
        );
      }
    }

    return statusArray.length > 0 ? statusArray : undefined;
  }
}

