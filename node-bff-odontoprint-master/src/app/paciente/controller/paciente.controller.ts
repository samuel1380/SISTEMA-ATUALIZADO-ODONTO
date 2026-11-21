import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PacienteService } from '../business/paciente.service';
import { CreatePacienteDto } from '../dto/create-paciente.dto';
import { UpdatePacienteDto } from '../dto/update-paciente.dto';
import { CurrentUser, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { ApiTags } from '@nestjs/swagger';
import { OptionalParseIntPipe } from '../../financeiro/dto/optional-parse-int';

@ApiTags('Paciente')
@Roles('admin', 'producao', 'vendas', 'financeiro')
@Controller('paciente')
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) {}

  @Post()
  create(@Body() createPacienteDto: CreatePacienteDto, @CurrentUser() currentUser: any) {
    const idUsuarioCadastro = currentUser.user.idUsuario;
    return this.pacienteService.create(createPacienteDto, idUsuarioCadastro);
  }

  // @Get()
  // findAll(@CurrentUser() currentUser: any) {
  //   const idEmpresa = currentUser.user.idEmpresa;
  //   return this.pacienteService.findAll(idEmpresa);
  // }

  @Get('empresa/:idEmpresa')
  findAllByEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    @Query('idProfissional', OptionalParseIntPipe) idProfissional?: number,
  ) {
    return this.pacienteService.findAll(idEmpresa, idProfissional);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: any) {
    const idEmpresa = currentUser.user.idEmpresa;
    return this.pacienteService.findOne(id, idEmpresa);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePacienteDto: UpdatePacienteDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.pacienteService.updatePacienteETrabalhos(id, updatePacienteDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: any) {
    const idEmpresa = currentUser.user.idEmpresa;
    return this.pacienteService.remove(id, idEmpresa);
  }
}
