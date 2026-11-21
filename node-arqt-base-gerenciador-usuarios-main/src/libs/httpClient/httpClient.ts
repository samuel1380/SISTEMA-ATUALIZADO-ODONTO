import { Injectable } from '@nestjs/common';
import Axios, { AxiosRequestConfig } from 'axios';
import { ParamsRequest } from './paramsRequest';

@Injectable()
export class HttpClient {
  async get<T = any>(paramsRequest: ParamsRequest): Promise<T> {
    paramsRequest.method = 'GET';
    return this.callRequest<T>(paramsRequest);
  }

  async post<T = any>(paramsRequest: ParamsRequest): Promise<T> {
    paramsRequest.method = 'POST';
    return this.callRequest<T>(paramsRequest);
  }

  async put<T = any>(paramsRequest: ParamsRequest): Promise<T> {
    paramsRequest.method = 'PUT';
    return this.callRequest<T>(paramsRequest);
  }

  async delete<T = any>(paramsRequest: ParamsRequest): Promise<T> {
    paramsRequest.method = 'DELETE';
    return this.callRequest<T>(paramsRequest);
  }

  private async callRequest<T = any>(paramsRequest: ParamsRequest): Promise<T> {
    console.log(`------ [INFO] [${new Date().toISOString()}] | method=${paramsRequest.method} path=${paramsRequest.url} ` +
    `| body=${JSON.stringify(paramsRequest.data)} | headers=${JSON.stringify(paramsRequest.headers)}`)
    
    return new Promise((resolve, reject) => {
      Axios(paramsRequest.url, this.getRequestConfig(paramsRequest))
        .then((response: any) => {
          resolve(response.data);
        })
        .catch((reason: any) => {
          reject(reason);
        });
    });
  }

  private getRequestConfig(paramsRequest: ParamsRequest): AxiosRequestConfig {
    return {
      headers: paramsRequest.headers,
      data: paramsRequest.data,
      params: paramsRequest.params,
      method: paramsRequest.method,
      responseType: paramsRequest.responseType
    };
  }
}
