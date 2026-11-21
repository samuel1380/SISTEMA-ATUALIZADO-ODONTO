import { PartialType } from '@nestjs/mapped-types';
import { CreateAlmoxarifadoDto } from './create-almoxarifado.dto';

export class UpdateAlmoxarifadoDto extends PartialType(CreateAlmoxarifadoDto) {}
