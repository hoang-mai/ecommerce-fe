import { useMemo } from "react";
import provinceData from "@/util/province.json";
import wardData from "@/util/ward.json";

interface ProvinceData {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

interface WardData {
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

export const useAddressMapping = (selectedProvince?: string) => {
  // Create mapping objects for quick lookup
  const provinceMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(provinceData as Record<string, ProvinceData>).forEach((province) => {
      map.set(province.code, province.name_with_type);
    });
    return map;
  }, []);

  const wardMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(wardData as Record<string, WardData>).forEach((ward) => {
      map.set(ward.code, ward.name_with_type);
    });
    return map;
  }, []);

  // Create options for dropdowns
  const provinceOptions = useMemo(() => {
    return Object.values(provinceData as Record<string, ProvinceData>).map((province) => ({
      id: province.code,
      label: province.name_with_type,
    }));
  }, []);

  const wardOptions = useMemo(() => {
    if (!selectedProvince) return [];
    return Object.values(wardData as Record<string, WardData>)
      .filter((ward) => ward.parent_code === selectedProvince)
      .map((ward) => ({
        id: ward.code,
        label: ward.name_with_type,
      }));
  }, [selectedProvince]);

  // Helper function to get province name from code
  const getProvinceName = (code: string) => provinceMap.get(code) || code;

  // Helper function to get ward name from code
  const getWardName = (code: string) => wardMap.get(code) || code;

  // Helper function to get full address
  const getFullAddress = (detail: string, wardCode: string, provinceCode: string) => {
    return `${detail}, ${getWardName(wardCode)}, ${getProvinceName(provinceCode)}`;
  };

  return {
    provinceMap,
    wardMap,
    provinceOptions,
    wardOptions,
    getProvinceName,
    getWardName,
    getFullAddress,
  };
};
