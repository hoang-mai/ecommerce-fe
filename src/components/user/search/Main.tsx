"use client";

import React, {Suspense, useEffect, useMemo, useState} from 'react';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import Button from "@/libs/Button";
import {AlertType, ColorButton, RatingNumber} from "@/types/enum";
import DropdownSelect from "@/libs/DropdownSelect";
import ProductCard from "@/components/user/ProductCard";
import {ProductView} from "@/types/interface";
import TextField from "@/libs/TextField";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {PRODUCT_VIEW} from "@/services/api";
import {useSearchParams, useRouter, usePathname} from "next/navigation";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import Pagination from "@/libs/Pagination";


type Filters = {
  priceRange: [number, number];
  minRating: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  pageNo: number;
};

type FilterKey = keyof Filters;

const options: Option[] = [
  {id: "", label: "Mặc định"},
  {id: "totalSold", label: "Phổ biến nhất"},
  {id: "createAt", label: "Mới nhất"},
  {id: "price-asc", label: "Giá thấp đến cao"},
  {id: "price-desc", label: "Giá cao đến thấp"},
  {id: "rating", label: "Đánh giá cao nhất"},
];

 function Search() {
  const {get} = useAxiosContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);
  const [sortByLabel, setSortByLabel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);
  const [startPriceInput, setStartPriceInput] = useState<string>(params.startPrice || "");
  const [endPriceInput, setEndPriceInput] = useState<string>(params.endPrice || "");

  const [filters, setFilters] = useState<Filters>({
    priceRange: [
      params.startPrice ? Number(params.startPrice) : 0,
      params.endPrice ? Number(params.endPrice) : 50000000
    ],
    minRating: params.star ? Number(params.star) : 0,
    sortBy: params.sortBy || "",
    sortDir: (params.sortDir === 'asc' || params.sortDir === 'desc') ? params.sortDir : 'asc',
    pageNo: params.pageNo ? Number(params.pageNo) : 0,
  });

  const url = useBuildUrl({
    baseUrl: PRODUCT_VIEW,
    queryParams: {
      pageNo: filters.pageNo,
      pageSize: 5,
      keyword: params.keyword || null,
      sortBy: filters.sortBy || null,
      sortDir: filters.sortDir || null,
      startPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : null,
      endPrice: filters.priceRange[1] < 50000000 ? filters.priceRange[1] : null,
      star: filters.minRating > 0 ? filters.minRating : null,
      searchId: params.searchId || null,
    }
  })
  const fetcher = (url: string) => get<BaseResponse<PageResponse<ProductView>>>(url).then(res => res.data);
  const {data, isLoading, error} = useSWR(url, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const totalPages = data?.data?.totalPages || 0;
  const dispatch = useDispatch();
  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);


  const handleFilterChange = (type: FilterKey, value: string | [number, number] | number) => {
    setFilters((prev: Filters) => {
      let newFilters: Filters;
      if (type === 'priceRange') {
        newFilters = {...prev, priceRange: value as [number, number], pageNo: 0};
      } else if (type === 'minRating') {
        newFilters = {...prev, minRating: value as number, pageNo: 0};
      } else if (type === 'sortBy') {
        newFilters = {...prev, sortBy: value as string, pageNo: 0};
      } else if (type === 'sortDir') {
        newFilters = {...prev, sortDir: value as 'asc' | 'desc', pageNo: 0};
      } else if (type === 'pageNo') {
        newFilters = {...prev, pageNo: value as number};
      } else {
        newFilters = {...prev, pageNo: 0};
      }
      // Update URL
      handleBuildUrl(newFilters);
      return newFilters;
    });
  };

  const clearFilter = () => {
    const defaultFilters: Filters = {
      priceRange: [0, 50000000],
      minRating: 0,
      sortBy: "",
      sortDir: 'asc',
      pageNo: 0,
    };
    setFilters(defaultFilters);
    setStartPriceInput("");
    setEndPriceInput("");
    handleBuildUrl(defaultFilters);
  };
  const handleBuildUrl = (newFilters: Filters) => {
    const newParams = new URLSearchParams();

    // Keep existing params like keyword and searchId
    if (params.keyword) newParams.set('keyword', params.keyword);
    if (params.searchId) newParams.set('searchId', params.searchId);

    // Add filter params
    if (newFilters.priceRange[0] > 0) newParams.set('startPrice', newFilters.priceRange[0].toString());
    if (newFilters.priceRange[1] < 50000000) newParams.set('endPrice', newFilters.priceRange[1].toString());
    if (newFilters.minRating > 0) newParams.set('star', newFilters.minRating.toString());
    if (newFilters.sortBy) {
      newParams.set('sortBy', newFilters.sortBy);
      newParams.set('sortDir', newFilters.sortDir);
    }
    if (newFilters.pageNo > 0) newParams.set('pageNo', newFilters.pageNo.toString());

    const newUrl = `${pathname}?${newParams.toString()}`;
    router.replace(newUrl, {scroll: false});
  }
  const activeFiltersCount =
    (filters.minRating > 0 ? 1 : 0) +
    ((filters.priceRange[0] > 0 || (filters.priceRange[1] > 0 && filters.priceRange[1] < 50000000)) ? 1 : 0);

  return (


    <div className="max-w-7xl mx-auto px-4 py-6">
      {isLoading && <Loading/>}
      <div className="flex gap-6 flex-row">
        {/* Sidebar bộ lọc */}
        <div
          className={`${showFilters ? 'w-64 opacity-100' : 'w-0 opacity-0'} transition-all duration-300 overflow-hidden`}>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-grey-c700 h-9">Bộ lọc</h3>
              {activeFiltersCount > 0 && (
                <Button
                  color={ColorButton.PRIMARY}
                  type={"button"}
                  onClick={() => clearFilter()}
                  className="text-sm"
                >
                  Xóa tất cả
                </Button>
              )}
            </div>

            <div className={"flex gap-6 flex-col"}>


              {/* Lọc theo số sao */}
              <div>
                <h4 className="font-medium text-grey-c800 mb-3">Đánh giá</h4>
                {(Object.values(RatingNumber).reverse().filter(v => typeof v === 'number') as number[]).map((rating: number) => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', filters.minRating === rating ? 0 : rating)}
                    className={`w-full flex items-center mb-2 p-2 rounded cursor-pointer transition-all ${
                      filters.minRating === rating ? 'bg-primary-c100 text-primary-c700 border-primary-c200' : 'bg-white text-grey-c700 hover:bg-grey-c50 border-grey-c500'
                    } border`}
                  >
                    {
                      Array.from({length: 5}, (_, index) => (
                        <StarRateRoundedIcon
                          key={index}
                          className={`!w-4 !h-4 ${
                            index < rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))
                    }
                    <span className="text-sm">{rating} trở lên</span>
                  </button>
                ))}
              </div>
              {/* Lọc theo khoảng giá */}
              <div>
                <h4 className="font-medium text-grey-c800 mb-3">Khoảng giá</h4>
                <div className={"flex gap-1 items-center mb-3"}>
                  <TextField
                    placeholder={"Từ"}
                    className={"!p-2 !rounded-xl"}
                    value={startPriceInput}
                    onChange={(value) => setStartPriceInput(value)}
                    type="number"
                  />
                  <ArrowRightAltRoundedIcon className={"text-primary-c700"}/>
                  <TextField
                    placeholder={"Đến"}
                    className={"!p-2 !rounded-xl"}
                    value={endPriceInput}
                    onChange={(value) => setEndPriceInput(value)}
                    type="number"
                  />
                </div>
                <Button
                  color={ColorButton.PRIMARY}
                  fullWidth={true}
                  startIcon={<FilterAltRoundedIcon/>}
                  onClick={() => {
                    const start = startPriceInput ? Number(startPriceInput) : 0;
                    const end = endPriceInput ? Number(endPriceInput) : 50000000;
                    handleFilterChange('priceRange', [start, end]);
                  }}
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={"flex-1"}>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-row justify-between gap-4">
              <div className={"flex flex-row flex-1 items-center gap-2"}>
                <Button
                  type="button"
                  color={ColorButton.PRIMARY}
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<TuneRoundedIcon/>}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm">
                      Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </span>
                </Button>
                <span className="text-sm text-grey-c700">
                    Tìm thấy <strong>{data?.data?.totalElements || 0}</strong> sản phẩm
                  </span>
              </div>
              {/* Sắp xếp */}
              {!params.searchId && (
                <div>
                  <DropdownSelect
                    value={sortByLabel}
                    onChange={(value) => {
                      setSortByLabel(value);
                      if (value === "price-asc") {
                        handleFilterChange('sortDir', 'asc');
                        handleFilterChange('sortBy', 'basePrice');
                      } else if (value === "price-desc") {
                        handleFilterChange('sortDir', 'desc');
                        handleFilterChange('sortBy', 'basePrice');
                      } else {
                        handleFilterChange('sortDir', 'desc');
                        handleFilterChange('sortBy', value);
                      }
                    }}
                    options={options}
                    placeholder="Sắp xếp theo"
                  />
                </div>
              )}
            </div>


          </div>
          {/* Hiển thị sản phẩm */}
          {data && data.data && data.data.data.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <SearchOffRoundedIcon className="!text-7xl text-grey-c400 mb-4"/>
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-600 mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              <button
                onClick={() => {
                  clearFilter();
                }}
                className="px-6 py-2 bg-primary-c600 text-white rounded-lg hover:bg-primary-c700"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-3 ${showFilters ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4`}>
              {data && data.data && data.data.data.map((product) => (
                <ProductCard product={product} key={product.productId}/>
              ))}
            </div>

          )}</div>
        <Pagination totalPages={totalPages} currentPage={filters.pageNo} onPageChange={(currentPage) => {
          handleFilterChange('pageNo', currentPage);
        }}/>
      </div>
    </div>
  );
}

export default function SearchMain() {
  return <Suspense fallback={<Loading/>}>
    <Search/>
  </Suspense>
}