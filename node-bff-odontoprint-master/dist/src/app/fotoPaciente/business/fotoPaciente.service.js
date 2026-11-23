"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FotoPacienteService = void 0;
const awsS3_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/s3/business/awsS3");
const common_1 = require("@nestjs/common");
const fotoPaciente_entity_1 = require("../domain/fotoPaciente.entity");
const fotoPaciente_repository_1 = require("../repository/fotoPaciente.repository");
const geradorGuid_service_1 = require("./geradorGuid.service");
let FotoPacienteService = class FotoPacienteService {
    constructor(fotoPacienteRepository, uploadFileS3, geradorGuidService) {
        this.fotoPacienteRepository = fotoPacienteRepository;
        this.uploadFileS3 = uploadFileS3;
        this.geradorGuidService = geradorGuidService;
    }
    async cadastrarFotoPacienteTrabalho(currentUser, idEmpresa, idTrabalho, file, ordem) {
        const fotoPaciente = new fotoPaciente_entity_1.FotoPaciente();
        fotoPaciente.idEmpresa = idEmpresa;
        fotoPaciente.idTrabalho = idTrabalho;
        fotoPaciente.nomeArquivo = this.geradorGuidService.gerarGuid();
        fotoPaciente.nomeOriginal = file.originalname;
        fotoPaciente.tamanho = file.size;
        fotoPaciente.tipo = file.mimetype;
        fotoPaciente.path = `${idEmpresa}/${fotoPaciente.nomeArquivo}`;
        fotoPaciente.bucket = `${process.env.BUCKET_AWS}`;
        fotoPaciente.ordem = ordem;
        fotoPaciente.idUsuarioCadastro = 0;
        await this.uploadFileS3.upload(currentUser, file.buffer, fotoPaciente.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);
        return this.fotoPacienteRepository.salvaFotoPaciente(fotoPaciente);
    }
    async buscarArquivo(currentUser, idEmpresa, arquivoNome) {
        return await this.uploadFileS3.download(currentUser, arquivoNome, `${process.env.BUCKET_AWS}/${idEmpresa}`);
    }
    async deletarArquivo(currentUser, idEmpresa, idTrabalho, idArquivo, tipoUsuario) {
        const arquivo = await this.fotoPacienteRepository.buscaArquivo(idArquivo);
        if (arquivo.idEmpresa !== idEmpresa && tipoUsuario === "externo") {
            throw new common_1.HttpException("Não Autorizado", common_1.HttpStatus.UNAUTHORIZED);
        }
        if (arquivo.idTrabalho !== idTrabalho && tipoUsuario === "externo") {
            throw new common_1.HttpException("Não Autorizado", common_1.HttpStatus.UNAUTHORIZED);
        }
        if (tipoUsuario == "interno") {
            idEmpresa = arquivo.idEmpresa;
        }
        await this.fotoPacienteRepository.deleteArquivo(arquivo);
        return await this.uploadFileS3.delete(currentUser, arquivo.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);
    }
};
exports.FotoPacienteService = FotoPacienteService;
exports.FotoPacienteService = FotoPacienteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fotoPaciente_repository_1.FotoPacienteRepository,
        awsS3_1.AwsS3,
        geradorGuid_service_1.GeradorGuidService])
], FotoPacienteService);
//# sourceMappingURL=fotoPaciente.service.js.map