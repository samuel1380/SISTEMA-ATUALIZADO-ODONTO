"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let HttpClient = class HttpClient {
    async get(paramsRequest) {
        paramsRequest.method = 'GET';
        return this.callRequest(paramsRequest);
    }
    async post(paramsRequest) {
        paramsRequest.method = 'POST';
        return this.callRequest(paramsRequest);
    }
    async put(paramsRequest) {
        paramsRequest.method = 'PUT';
        return this.callRequest(paramsRequest);
    }
    async delete(paramsRequest) {
        paramsRequest.method = 'DELETE';
        return this.callRequest(paramsRequest);
    }
    async callRequest(paramsRequest) {
        console.log(`------ [INFO] [${new Date().toISOString()}] | method=${paramsRequest.method} path=${paramsRequest.url}`);
        return new Promise((resolve, reject) => {
            (0, axios_1.default)(paramsRequest.url, this.getRequestConfig(paramsRequest))
                .then((response) => {
                resolve(response.data);
            })
                .catch((reason) => {
                reject(reason);
            });
        });
    }
    getRequestConfig(paramsRequest) {
        return {
            headers: paramsRequest.headers,
            data: paramsRequest.data,
            params: paramsRequest.params,
            method: paramsRequest.method,
            responseType: paramsRequest.responseType
        };
    }
};
exports.HttpClient = HttpClient;
exports.HttpClient = HttpClient = __decorate([
    (0, common_1.Injectable)()
], HttpClient);
//# sourceMappingURL=httpClient.js.map