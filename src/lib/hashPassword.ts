import { SHA256 as sha256 } from "crypto-js";

// We hash the user entered password using crypto.js
export const hashPassword = (string: string): string => {
  return sha256(string).toString();
};
