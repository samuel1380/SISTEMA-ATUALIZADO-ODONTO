import { Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';

import { HttpClient } from 'src/libs/httpClient/httpClient';
import { ParamsRequest } from 'src/libs/httpClient/paramsRequest';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { AwsS3 } from '../../s3/business/awsS3';
import { EmailDto } from '../dto/email.dto';
import { EmailApiDto } from '../dto/emailApi.dto';

@Injectable()
export class EmailService {
  private configEmail: any = {
    email: process.env.EMAIL_AWS,
    emailUser: process.env.EMAIL_USER_AWS,
    emailUserPassword: process.env.EMAIL_PASSWORD_AWS,
    emailHost: process.env.EMAIL_HOST_AWS,
    emailPort: process.env.EMAIL_PORT_AWS
  };
  private transporter = nodemailer.createTransport({
    host: this.configEmail.emailHost,
    port: this.configEmail.emailPort,
    secure: false,
    auth: {
      user: this.configEmail.emailUser,
      pass: this.configEmail.emailUserPassword
    }
  });

  constructor(private awsS3: AwsS3, private httpClient: HttpClient) {}

  async enviar(currentUser: CurrentUserDto, email: EmailDto): Promise<any> {
    try {

      const mailOptions: any = {
        from: email.remetenteNome,
        to: email.receptor,
        cc: email.comCopia,
        subject: email.assunto,
        text: email.mensagem,
        sender: email.remetenteEmail
      };

      if (!!email.caminho) {
        const nomeArquivo: string = email.caminho.split('/').pop();
        const stream = await this.awsS3.download(
          currentUser,
          nomeArquivo,
          process.env.BUCKET_AWS
        );

        mailOptions.type = email.type;
        mailOptions.attachments = [
          {
            filename: `${nomeArquivo}.${email.type.toLocaleLowerCase()}`,
            content: stream
          }
        ];
        mailOptions.attachment = nomeArquivo;
      }

      return new Promise((resolve, reject) => {
        this.transporter.sendMail(mailOptions, (error: any, info: any) => {
          if (!!info) {
            resolve({
              msg: 'Email enviado com sucesso'
            });
          } else {
            reject({ error });
          }
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  async enviarEmail(headers: any, data: EmailApiDto) {
    const paramsRequest = new ParamsRequest();

    paramsRequest.url = `${process.env.EMAIL_ENDPOINT}/email`;
    paramsRequest.headers = headers;

    paramsRequest.data = {
      idioma: data.idioma,
      remetente: 'noreply@odontoprint.com.br',
      destinatario: data.destinatario,
      status: 'Pendente',
      tipoEmail: data.nomeTemplate,
      variaveisAmbiente: JSON.stringify(data.variaveisAmbiente),
      idUsuarioCadastro: 1
    };
    return this.httpClient.post(paramsRequest);
  }
}
