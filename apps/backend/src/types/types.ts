import { Request } from "express";

export type Base64 = string;

export interface AuthedRequest extends Request {
  user: { userId: number };
}
