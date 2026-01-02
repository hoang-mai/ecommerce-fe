import {format, formatDistanceToNow, parseISO } from "date-fns";
import {jwtDecode, JwtPayload} from "jwt-decode";
import {Role} from "@/types/enum";
import {vi} from "date-fns/locale";

interface JwtDecodedPayload extends JwtPayload {
  role: Role;
  "user-id": string;
}

export function formatDateTime(date: string) {
  const parsed = parseISO(date + "Z");
  if (isNaN(parsed.getTime())) return "";
  return format(parsed, "HH:mm:ss dd/MM/yyyy");
}

export function formatDate(date: string) {
  const parsed = parseISO(date + "Z");
  if (isNaN(parsed.getTime())) return "";
  return format(parsed, "HH:mm:ss dd/MM/yyyy");
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
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'k';
  }
  return number.toString();
}

export function getTimeAgo(date: string) {
  const parsed = parseISO(date + "Z");
  if (isNaN(parsed.getTime())) return "";
  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale: vi,
  });
}