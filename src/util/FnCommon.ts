import {format} from "date-fns";
import {jwtDecode, JwtPayload} from "jwt-decode";
import {Role} from "@/types/enum";

interface JwtDecodedPayload extends JwtPayload {
  role: Role;
}

export function formatDateTime(date: string) {
  return format(new Date(date), "HH:mm dd/MM/yyyy");
}

export function formatDate(date: string) {
  return format(new Date(date), "dd/MM/yyyy");
}

export function getRoleFromJwtToken(token: string) {
  const decoded: JwtDecodedPayload = jwtDecode(token);
  return decoded.role;
}

export function formatPrice(price: number) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export function isTokenExpired(token: string) {
  const decoded: JwtDecodedPayload = jwtDecode(token);
  if (!decoded.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 60;

  return decoded.exp - bufferTime < currentTime;
}