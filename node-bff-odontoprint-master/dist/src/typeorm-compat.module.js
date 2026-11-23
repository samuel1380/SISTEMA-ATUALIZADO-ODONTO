"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmCompatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeormBFF = require('typeorm');
let typeormBase;
try {
    typeormBase = require('@hunter-solucoes/node-arqt-base-gerenciador-usuarios/node_modules/typeorm');
}
catch (e) {
    try {
        typeormBase = require('../../node-arqt-base-gerenciador-usuarios-main/node_modules/typeorm');
    }
    catch (err) { }
}
const providers = [
    {
        provide: typeormBFF.Connection,
        useExisting: typeorm_1.DataSource,
    },
    {
        provide: 'Connection',
        useExisting: typeorm_1.DataSource,
    },
    {
        provide: 'defaultConnection',
        useExisting: typeorm_1.DataSource,
    },
];
if (typeormBase && typeormBase.Connection && typeormBase.Connection !== typeormBFF.Connection) {
    providers.push({
        provide: typeormBase.Connection,
        useExisting: typeorm_1.DataSource,
    });
}
let TypeOrmCompatModule = class TypeOrmCompatModule {
};
exports.TypeOrmCompatModule = TypeOrmCompatModule;
exports.TypeOrmCompatModule = TypeOrmCompatModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers,
        exports: providers.map(p => p.provide),
    })
], TypeOrmCompatModule);
//# sourceMappingURL=typeorm-compat.module.js.map