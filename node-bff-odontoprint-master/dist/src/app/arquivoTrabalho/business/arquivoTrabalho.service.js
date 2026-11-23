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
exports.ArquivoTrabalhoService = void 0;
const awsS3_1 = require("@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/s3/business/awsS3");
const common_1 = require("@nestjs/common");
const arquivoTrabalho_entity_1 = require("../domain/arquivoTrabalho.entity");
const arquivoTrabalho_repository_1 = require("../repository/arquivoTrabalho.repository");
const geradorGuid_service_1 = require("./geradorGuid.service");
let ArquivoTrabalhoService = class ArquivoTrabalhoService {
    constructor(arquivoTrabalhoRepository, uploadFileS3, geradorGuidService) {
        this.arquivoTrabalhoRepository = arquivoTrabalhoRepository;
        this.uploadFileS3 = uploadFileS3;
        this.geradorGuidService = geradorGuidService;
    }
    async cadastrarArquivosTrabalho(currentUser, idEmpresa, idTrabalho, file) {
        const arquivoTrabalho = new arquivoTrabalho_entity_1.ArquivoTrabalho();
        arquivoTrabalho.idEmpresa = idEmpresa;
        arquivoTrabalho.idTrabalho = idTrabalho;
        arquivoTrabalho.nomeArquivo = this.geradorGuidService.gerarGuid();
        arquivoTrabalho.nomeOriginal = file.originalname;
        arquivoTrabalho.tamanho = file.size;
        arquivoTrabalho.tipo = file.mimetype;
        arquivoTrabalho.path = `${idEmpresa}/${arquivoTrabalho.nomeArquivo}`;
        arquivoTrabalho.bucket = `${process.env.BUCKET_AWS}`;
        arquivoTrabalho.ordem = 1;
        arquivoTrabalho.idUsuarioCadastro = 0;
        await this.uploadFileS3.upload(currentUser, file.buffer, arquivoTrabalho.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);
        return this.arquivoTrabalhoRepository.salvaTrabalho(arquivoTrabalho);
    }
    async deletarArquivo(currentUser, idEmpresa, idTrabalho, idArquivo, tipoUsuario) {
        const arquivo = await this.arquivoTrabalhoRepository.buscaArquivo(idArquivo);
        if (arquivo.idEmpresa !== idEmpresa && tipoUsuario == "externo") {
            throw new common_1.HttpException("Não Autorizado", common_1.HttpStatus.UNAUTHORIZED);
        }
        if (arquivo.idTrabalho !== idTrabalho && tipoUsuario == "externo") {
            throw new common_1.HttpException("Não Autorizado", common_1.HttpStatus.UNAUTHORIZED);
        }
        if (tipoUsuario == "interno") {
            idEmpresa = arquivo.idEmpresa;
        }
        await this.arquivoTrabalhoRepository.deleteArquivo(arquivo);
        return await this.uploadFileS3.delete(currentUser, arquivo.nomeArquivo, `${process.env.BUCKET_AWS}/${idEmpresa}`);
    }
    async buscarArquivo(currentUser, idEmpresa, arquivoNome) {
        return await this.uploadFileS3.download(currentUser, arquivoNome, `${process.env.BUCKET_AWS}/${idEmpresa}`);
    }
};
exports.ArquivoTrabalhoService = ArquivoTrabalhoService;
exports.ArquivoTrabalhoService = ArquivoTrabalhoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [arquivoTrabalho_repository_1.ArquivoTrabalhoRepository,
        awsS3_1.AwsS3,
        geradorGuid_service_1.GeradorGuidService])
], ArquivoTrabalhoService);
//# sourceMappingURL=arquivoTrabalho.service.js.map