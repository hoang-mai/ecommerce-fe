import React, {useEffect, useState} from 'react';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {ProductView, ShopView} from "@/types/interface";
import {AlertType, ShopStatus} from "@/types/enum";
import ProductCard from "@/components/user/ProductCard";
import {formatNumber, getTimeAgo} from "@/util/fnCommon";
import Image from "next/image";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {PRODUCT_VIEW, SHOP_VIEW} from "@/services/api";
import useSWR from "swr";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Pagination from "@/libs/Pagination";
import Loading from "@/components/modals/Loading";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {useDebounce} from "@/hooks/useDebounce";
import {openChat} from "@/redux/slice/chatSlice";
import StoreRoundedIcon from "@mui/icons-material/Storefront";
import {useAddressMapping} from "@/hooks/useAddressMapping";

const sampleShop: ShopView = {
  shopId: "",
  shopName: "",
  description: "",
  logoUrl: "",
  bannerUrl: "",
  shopStatus: ShopStatus.ACTIVE,
  ownerId: "",
  province: "",
  ward: "",
  detail: "",
  phoneNumber: "",
  totalProducts: 0,
  activeProducts: 0,
  totalSold: 0,
  totalRevenue: 0,
  rating: 0,
  numberOfRatings: 0,
  numberOfReviews: 0,
  totalOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};


type Props = {
  id: string;
};
const options: Option[] = [
  {id: "", label: "Mặc định"},
  {id: "totalSold", label: "Phổ biến nhất"},
  {id: "createdAt", label: "Mới nhất"},
  {id: "price-asc", label: "Giá thấp đến cao"},
  {id: "price-desc", label: "Giá cao đến thấp"},
  {id: "rating", label: "Đánh giá cao nhất"},
];
export default function Main({id}: Props) {
  const {get} = useAxiosContext();
  const [pageNo, setPageNo] = useState(0);
  const [keyword, setKeyword] = useState<string>('');
  const [sortByLabel, setSortByLabel] = useState<string>('Mặc định');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const debounce = useDebounce(keyword);
  const fetcherShop = (url: string) => get<BaseResponse<ShopView>>(url).then(res => res.data);
  const fetcherProducts = (url: string) => get<BaseResponse<PageResponse<ProductView>>>(url).then(res => res.data);
  const {data: dataShop, isLoading: isLoadingShop, error: errorShop} = useSWR(`${SHOP_VIEW}/${id}`, fetcherShop, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const shop = dataShop?.data || sampleShop;
  const url = useBuildUrl({
    baseUrl: PRODUCT_VIEW,
    queryParams: {
      shopId: id,
      pageNo,
      pageSize: 25,
      keyword: debounce || undefined,
      sortBy,
      sortDir,
    }
  });
  const {data, error, isLoading} = useSWR(url, fetcherProducts, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const totalPages = data?.data?.totalPages || 0;
  const dispatch = useDispatch();
  const {getFullAddress} = useAddressMapping();
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
    if (errorShop) {
      const alert: AlertState = {
        isOpen: true,
        message: errorShop.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error, errorShop]);
  const handleClearSearch = () => {
    setKeyword("");
    setSortBy("");
    setSortDir("desc")
    setPageNo(0);
  };
  return (
    <div className="">
      {(isLoading || isLoadingShop) && <Loading/>}
      {/* Shop Info Card */}
      <div className={"w-full bg-white p-4 border-b border-grey-c200 shadow-sm"}>
        <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row flex-wrap justify-between"}>
          <div className={`w-100 h-30 bg-cover bg-center rounded-md relative `}
               style={{
                 backgroundImage: `url(${shop.bannerUrl || "/imageBanner.jpg"})`,
               }}
          >
            <div className={"absolute inset-0 bg-black/20 rounded-md backdrop-blur-xs"}></div>
            <div className="absolute z-1 flex flex-row gap-2 top-4 left-2">
              <div
                className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                {shop.logoUrl ? (
                  <Image
                    src={shop.logoUrl}
                    alt={shop.shopName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <StoreRoundedIcon style={{fontSize: '40px'}} className="text-primary-c700"/>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{shop.shopName}</h1>
                <p className="text-grey-c100 text-xs mb-1">{shop.description}</p>
                <button
                  onClick={() => {
                    const chatState: ChatState = {
                      isOpen: true,
                      shopId: shop.shopId,
                      shopName: shop.shopName,
                      logoUrl: shop.logoUrl,
                      ownerId: shop.ownerId,
                      shopStatus: shop.shopStatus,
                    }
                    dispatch(openChat(chatState));
                  }}
                  className={"border text-xs p-1 rounded-md border-white bg-white/30 text-white flex items-center gap-1 cursor-pointer"}
                >
                  <ChatBubbleOutlineIcon className="!text-xs"/>
                  Chat ngay
                </button>
              </div>
            </div>
          </div>
          <div className={"flex flex-col gap-4 justify-center"}>
            <div className={"flex flex-row gap-1 items-center"}>
              <Inventory2Icon className="!w-5 !h-5 text-grey-c800"/>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-grey-c600">Sản phẩm:</span>
                <span
                  className="text-base font-semibold text-primary-c900">{shop.activeProducts}</span>
              </div>
            </div>
            <div className={"flex flex-row gap-1 items-center "}>
              <TrendingUpIcon className="!w-5 !h-5 text-grey-c800"/>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-grey-c600">Đã bán:</span>
                <span
                  className="text-base font-semibold text-primary-c900">{formatNumber(shop.totalSold || 0)}</span>
              </div>
            </div>
            <div className={"flex flex-row gap-1  "}>
              <LocationOnIcon className="!w-5 !h-5 text-grey-c800"/>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-grey-c600">Địa chỉ:</span>
                <span
                  className="text-base font-semibold text-primary-c900 text-wrap w-60">{shop.detail}</span>
              </div>
            </div>
          </div>
          <div className={"flex flex-col gap-4 justify-center"}>
            <div className={"flex flex-row gap-1 items-center "}>
              <StarIcon className="!w-5 !h-5 "/>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-grey-c600">Đánh giá:</span>
                {shop.numberOfRatings && shop.numberOfRatings > 0 ? (
                  <span className="text-base font-semibold text-primary-c900">
                    {(Number(shop.rating || 0) / shop.numberOfRatings).toFixed(1)} ({formatNumber(shop.numberOfRatings)} đánh giá)
                     </span>
                ) : (
                  <span className="text-base font-semibold text-primary-c900">Chưa có đánh giá</span>
                )}
              </div>
            </div>
            <div className={"flex flex-row gap-1 items-center"}>
              <PhoneIcon className="!w-5 !h-5 text-grey-c800"/>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-grey-c600">Số điện thoại:</span>
                <span
                  className="text-base font-semibold text-primary-c900">{shop.phoneNumber}</span>
              </div>
            </div>
            <div className={"flex flex-row gap-1 items-center"}>
              <CalendarTodayIcon className="!w-5 !h-5 text-grey-c800"/>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-grey-c600">Tham gia:</span>
                <span
                  className="text-base font-semibold text-primary-c900">{getTimeAgo(shop.createdAt)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-grey-c200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <TextField
                value={keyword}
                onChange={(e) => setKeyword(e)}
                placeholder="Tìm kiếm theo tên, mô tả danh mục..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPageNo(0);
                  }
                }}
              />
            </div>

            {/* Filter */}
            <div className="relative min-w-[200px]">
              <DropdownSelect
                value={sortByLabel}
                onChange={(value) => {
                  setSortByLabel(value);
                  if (value === "price-asc") {
                    setSortDir("asc");
                    setSortBy("basePrice");
                  } else if (value === "price-desc") {
                    setSortDir("desc");
                    setSortBy("basePrice");
                  } else {
                    setSortDir("desc");
                    setSortBy(value);
                  }
                  setPageNo(0);
                }}
                options={options}
                placeholder="Sắp xếp theo"
              />
            </div>
          </div>
          {(keyword) && (
            <div
              className="mb-4 flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200 mt-4">
              <SearchRoundedIcon className="text-primary-c700"/>
              <span>
                                    Tìm thấy <strong
                className="text-primary-c800">{data?.data?.totalElements || 0}</strong> sản phẩm
                {keyword && <> với từ khóa &ldquo;<strong
                  className="text-primary-c800">{keyword}</strong>&rdquo;</>}
                                    </span>
              <button
                onClick={handleClearSearch}
                className="ml-auto text-primary-c700 hover:text-primary-c900 underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6`}>
          {data && data.data && data.data.data.map((product) => (
            <ProductCard product={product} key={product.productId}/>
          ))}
        </div>
        <Pagination totalPages={totalPages} currentPage={pageNo} onPageChange={setPageNo}/>
      </div>
    </div>
  );
};
