'use client';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import {useState, MouseEvent, useEffect, useRef, ChangeEvent} from "react";
import {useDebounce} from "@/hooks/useDebounce";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import useSWR from "swr";
import {PRODUCT_VIEW, SEARCH_KEYWORD} from "@/services/api";
import {ProductView, SearchKeyword} from "@/types/interface";
import {useRouter} from "next/navigation";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {useDispatch} from "react-redux";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Empty from "@/libs/Empty";
import useSWRMutation from "swr/mutation";

export default function SearchInput() {
  const {get, post} = useAxiosContext();
  const router = useRouter();
  const fetcher = (url: string) => get<BaseResponse<PageResponse<SearchKeyword>>>(url).then(res => res.data);
  const [searchValue, setSearchValue] = useState("");
  const debounce = useDebounce(searchValue);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetcherCreateSearchKeyword = (url: string, { arg }: { arg: string }) =>
    post<BaseResponse<never>>(url, {keyword: arg}).then(res => res.data);

  const {trigger: triggerCreateSearchKeyword} = useSWRMutation(SEARCH_KEYWORD, fetcherCreateSearchKeyword);

  const fetcherImageSearch = (url: string, {arg}: {arg: FormData}) =>
    post<BaseResponse<string>>(url, arg, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);

  const {trigger, isMutating} = useSWRMutation(`${PRODUCT_VIEW}/search-images`, fetcherImageSearch);

  const url = useBuildUrl({
    baseUrl: SEARCH_KEYWORD,
    queryParams: {
      pageNo: 0,
      keyword: debounce.trim() || undefined,
      pageSize: 5,
    }
  })
  const {data, isLoading, error} = useSWR(debounce.trim() ? url : null, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
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
      triggerCreateSearchKeyword(searchValue.trim());
      router.push(`/search?keyword=${encodeURIComponent(searchValue.trim())}`);
      setIsFocused(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      const alert: AlertState = {
        isOpen: true,
        message: "Kích thước ảnh không được vượt quá 5MB",
        type: AlertType.ERROR,
        title: "Lỗi kích thước file",
      };
      dispatch(openAlert(alert));
      return;
    }

    setIsFocused(false);

      const formData = new FormData();
      formData.append('file', file);

      trigger(formData).then(response => {
        if(fileInputRef.current) fileInputRef.current.value = "";
        if(response.data) router.push(`/search?searchId=${encodeURIComponent(response.data)}`);
        else router.push(`/search`);
      }).catch((error: ErrorResponse) => {
        const alert: AlertState = {
          isOpen: true,
          message: error.message || "Tìm kiếm bằng hình ảnh thất bại",
          type: AlertType.ERROR,
          title: "Lỗi tìm kiếm",
        };
        dispatch(openAlert(alert));
      });

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
          className={`relative w-full h-12 pl-6 pr-24 text-base bg-white rounded-full 
                   outline-none transition-all duration-200
                   placeholder:text-grey-c400 font-normal
                   ${isFocused
            ? 'border-2 border-primary-c600'
            : 'border-2 border-grey-c200 hover:border-primary-c400'
          }`}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Camera Icon Button */}
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={isMutating}
          className={`absolute right-12 w-10 h-10 flex items-center justify-center
                   rounded-full transition-all duration-200  
                   ${isMutating
            ? 'bg-grey-c300 cursor-not-allowed'
            : 'bg-primary-c100 hover:bg-primary-c200 active:scale-90 cursor-pointer'
          }
                   shadow-sm hover:shadow-md`}
          title="Tìm kiếm bằng hình ảnh"
        >
          {isMutating ? (
            <div className="w-5 h-5 border-2 border-grey-c400 border-t-grey-c700 rounded-full animate-spin"></div>
          ) : (
            <CameraAltRoundedIcon className="text-primary-c700 !text-[22px]"/>
          )}
        </button>

        <button
          type="button"
          onClick={handleSearch}
          className={`absolute right-1 w-10 h-10 flex items-center justify-center
                   rounded-full transition-all duration-200 cursor-pointer
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
                  {data.data.data.map((searchKeyword) => (
                    <li
                      key={searchKeyword.id}
                      className={"transition-all duration-150 hover:bg-primary-c50 bg-white cursor-pointer"}
                    >
                      <button
                        type="button"
                        onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          router.push(`/search?keyword=${encodeURIComponent(searchKeyword.keyword)}`);
                          triggerCreateSearchKeyword(searchKeyword.keyword);
                          setIsFocused(false);
                          setSearchValue("");
                        }}
                        className="w-full px-5 py-3.5 flex items-start gap-3 text-left cursor-pointer"
                      >
                        {searchKeyword.keyword}
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