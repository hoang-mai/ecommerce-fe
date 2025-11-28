'use client';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {useState, MouseEvent, useEffect} from "react";
import {useDebounce} from "@/hooks/useDebounce";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import useSWR from "swr";
import {PRODUCT_VIEW} from "@/services/api";
import {ProductView} from "@/type/interface";
import {useRouter} from "next/navigation";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {useDispatch} from "react-redux";
import {AlertType} from "@/type/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Empty from "@/libs/Empty";

export default function SearchInput() {
  const {get} = useAxiosContext();
  const router = useRouter();
  const fetcher = (url: string) => get<BaseResponse<PageResponse<ProductView>>>(url).then(res => res.data);
  const [searchValue, setSearchValue] = useState("");
  const debounce = useDebounce(searchValue);
  const [isFocused, setIsFocused] = useState(false);

  const url = useBuildUrl({
    baseUrl: PRODUCT_VIEW,
    queryParams: {
      pageNo: 0,
      keyword: debounce.trim() || undefined,
      pageSize: 5,
    }
  })
  const {data, isLoading, error} = useSWR(url, fetcher)
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


  const handleSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchValue.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchValue.trim())}`);
      setIsFocused(false);
    }
  };

  const shouldShowDropdown = isFocused && debounce.trim() && (
    (data && data.data && data.data.data.length > 0) ||
    (data && data.data && data.data.data.length === 0 && !isLoading) ||
    isLoading
  );

  return (
    <div className="w-full">
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'transform scale-[1.01]' : ''
      }`}>
        <div className={`absolute inset-0 rounded-full transition-all duration-200 ${
          isFocused
            ? 'shadow-lg shadow-primary-c300/40'
            : 'shadow-sm shadow-grey-c200/50'
        }`}></div>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Tìm kiếm sản phẩm, danh mục hay thương hiệu..."
          className={`relative w-full h-12 pl-6 pr-14 text-base bg-white rounded-full 
                   outline-none transition-all duration-200
                   placeholder:text-grey-c400 font-normal
                   ${isFocused
            ? 'border-2 border-primary-c600'
            : 'border-2 border-grey-c200 hover:border-primary-c400'
          }`}
        />

        <button
          type="button"
          onClick={handleSearch}
          className={`absolute right-1 w-10 h-10 flex items-center justify-center
                   rounded-full transition-all duration-200
                   ${isFocused || searchValue
            ? 'bg-primary-c700 hover:bg-primary-c800 scale-100'
            : 'bg-primary-c600 hover:bg-primary-c700 scale-95'
          }
                   active:scale-90 shadow-md hover:shadow-lg`}
        >
          <SearchRoundedIcon className="text-white !text-[22px]"/>
        </button>

        {/* Enhanced Dropdown */}
        {shouldShowDropdown && (
          <div
            className="absolute top-full left-0 w-full mt-2 bg-white  border-2 border-primary-c500 rounded-2xl shadow-lg z-50 overflow-hidden">
            {/* Loading State */}
            {isLoading && (
              <div className="px-5 py-8 flex flex-col items-center justify-center">
                <div
                  className="w-8 h-8 border-3 border-primary-c200 border-t-primary-c600 rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-grey-c600 font-medium">Đang tìm kiếm...</p>
              </div>
            )}

            {/* Products List */}
            {!isLoading && data && data.data && data.data.data.length > 0 && (
              <div className="max-h-[270px] overflow-y-auto">
                <ul className="py-1">
                  {data.data.data.map((product) => (
                    <li
                      key={product.productId}
                      className={"transition-all duration-150 hover:bg-primary-c50 bg-white cursor-pointer"}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/products/${product.productId}`);
                          setIsFocused(false);
                          setSearchValue("");
                        }}
                        className="w-full px-5 py-3.5 flex items-start gap-3 text-left cursor-pointer"
                      >
                        {product.name}


                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && data && data.data && data.data.data.length === 0 && (
              <div className="px-5 py-10 flex flex-col items-center justify-center">
                <Empty/>
                <p className="text-base font-medium text-grey-c900 mb-1">
                  Không tìm thấy kết quả
                </p>
                <p className="text-sm text-grey-c600 text-center max-w-xs">
                  Không có sản phẩm nào phù hợp với &#34;<span
                  className="font-medium text-grey-c900">{debounce.trim()}</span>&#34;
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}