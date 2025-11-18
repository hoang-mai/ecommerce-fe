import {format} from "date-fns";
import {jwtDecode, JwtPayload} from "jwt-decode";

interface JwtDecodedPayload extends JwtPayload {
  role: string;
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