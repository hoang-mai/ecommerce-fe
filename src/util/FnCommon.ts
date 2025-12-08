import {format, formatDistanceToNow} from "date-fns";
import {jwtDecode, JwtPayload} from "jwt-decode";
import {Role} from "@/types/enum";
import {vi} from "date-fns/locale";

interface JwtDecodedPayload extends JwtPayload {
  role: Role;
  "user-id": string;
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

export function getCurrentUserId(token: string): string {
  const decoded: JwtDecodedPayload = jwtDecode(token);
  return decoded["user-id"];
}

export function formatPrice(price: number) {
  return price.toLocaleString("vi-VN", {style: "currency", currency: "VND"});
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

export function formatNumber(number: number) {
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'k';
  }
  return number.toString();
}

export function getTimeAgo(date: string) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: vi,
  });
}