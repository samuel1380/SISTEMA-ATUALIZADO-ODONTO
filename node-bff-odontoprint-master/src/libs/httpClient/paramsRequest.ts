import { Method, ResponseType } from "axios";

export class ParamsRequest {
  headers?: { [key: string]: any };
  data?: any;
  params?: { [key: string]: any };
  url: string;
  method?: Method;
  baseURL: string;
  responseType: ResponseType;
}
