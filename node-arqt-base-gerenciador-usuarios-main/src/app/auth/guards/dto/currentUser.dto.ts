export interface CurrentUserDto {
  user: {
    idUsuario?: number;
    primeiroNome: string;
    ultimoNome: string;
    email: string;
    roles: string[];
  },
  application: string;
};


