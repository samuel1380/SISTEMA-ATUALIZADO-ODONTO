import { Request, Response } from "express";

export function loggerMiddleware(req: Request, res: Response, next: Function) {
  console.log(`[INFO] [${new Date().toISOString()}] | ip=${req.ip} method=${req.method} path=${req.path} ` +
  `| body=${JSON.stringify(req.body)} | headers=${JSON.stringify(req.headers)}`)
  next();
}
