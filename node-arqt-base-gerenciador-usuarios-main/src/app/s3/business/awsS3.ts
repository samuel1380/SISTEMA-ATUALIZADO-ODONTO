import { Global, HttpException, HttpStatus } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Body } from 'aws-sdk/clients/s3';
import { BadRequest } from 'src/libs/badRequest';
import { Readable } from 'stream';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { ConfigAws } from '../interface/configAws.interface';

@Global()
export class AwsS3 {
  private s3: AWS.S3;

  constructor(configuracaoAws: ConfigAws) {
    this.s3 = new AWS.S3({
      endpoint: configuracaoAws.endpoint,
      credentials: {
        accessKeyId: configuracaoAws.accessKeyId,
        secretAccessKey: configuracaoAws.privateKey,
      },
      s3ForcePathStyle: true
    })
  }

  async upload(currentUser: CurrentUserDto, body: Body, key: string, bucketName: string) {
    const data = await this.s3.upload({
      Bucket: `${bucketName}`,
      Body: body,
      Key: decodeURIComponent(key)
    }).promise();

    if (data && data.Location) {
      return {
        url: `${bucketName}/${encodeURIComponent(key)}`
      };
    }

    throw new BadRequest('Falha ao enviar arquivo!');
  }

  async download(currentUser: CurrentUserDto, key: string, bucketName: string): Promise<Readable> {
    return new Promise(async (resolve, reject) => {
      this.s3.headObject({ Bucket: bucketName, Key: decodeURIComponent(key) }, async (err, data) => {
        if (err?.code) {
          return reject(new HttpException(err?.code, err.statusCode));
        }

        const leitura = this.s3
          .getObject({ Bucket: bucketName, Key: decodeURIComponent(key) })
          .createReadStream();

        if (leitura) {
          return resolve(leitura);
        }

        reject(new HttpException(`Falha ao realizar download do arquivo ${key}`, HttpStatus.BAD_REQUEST));
      });
    });
  }

  async delete(currentUser: CurrentUserDto, key: string, bucketName: string): Promise<AWS.S3.DeleteObjectOutput> {
    return new Promise(async (resolve, reject) => {
      this.s3.headObject({ Bucket: bucketName, Key: decodeURIComponent(key) }, async (err, data) => {
        if (err?.code) {
          return reject(new HttpException(err?.code, err.statusCode));
        }

        this.s3
          .deleteObject({ Bucket: bucketName, Key: decodeURIComponent(key) },
            (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => {
              if (err) {
                reject(new HttpException(`Falha ao realizar remoção do arquivo ${key}`, HttpStatus.BAD_REQUEST));
              }

              resolve(data);
            })
      });
    });
  }
}
