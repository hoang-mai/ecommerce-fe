import {useMemo} from "react";

type Props ={
  baseUrl: string;
  queryParams?: Record<string, string | number | boolean | undefined | null>;
}
export const useBuildUrl = ({baseUrl,queryParams}:Props) => {
  return useMemo(() => {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return baseUrl;
    }
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return `${baseUrl}?${params.toString()}`;
  }, [baseUrl, queryParams]);
}