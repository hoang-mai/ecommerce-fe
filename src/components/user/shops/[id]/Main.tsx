import React, {useEffect, useState} from 'react';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {ProductView, ShopView} from "@/types/interface";
import {AlertType, ColorButton, ShopStatus} from "@/types/enum";
import ProductCard from "@/components/user/ProductCard";
import Title from "@/libs/Title"
import {formatDate, formatNumber} from "@/util/FnCommon";
import Image from "next/image";
import Button from "@/libs/Button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Divide from "@/libs/Divide";
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

// Sample Data
const sampleShop: ShopView = {
    shopId: "shop123",
    shopName: "Tech Haven Store",
    description: "Chuyên cung cấp các sản phẩm công nghệ chính hãng, uy tín hàng đầu Việt Nam",
    logoUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=300&fit=crop",
    shopStatus: ShopStatus.ACTIVE,
    ownerId: "owner123",
    province: "Hà Nội",
    ward: "Phường Cầu Giấy",
    detail: "Số 123, Đường Láng",
    phoneNumber: "0987654321",
    totalProducts: 245,
    activeProducts: 230,
    totalSold: 15420,
    totalRevenue: 2450000000,
    rating: 4.8,
    numberOfRatings: 3250,
    numberOfReviews: 1890,
    createdAt: "2022-01-15T10:30:00Z",
    updatedAt: "2024-12-01T15:45:00Z"
};


type Props = {
    id: string;
};
const options: Option[] = [
    {id: "", label: "Mặc định"},
    {id: "totalSold", label: "Phổ biến nhất"},
    {id: "createAt", label: "Mới nhất"},
    {id: "price-asc", label: "Giá thấp đến cao"},
    {id: "price-desc", label: "Giá cao đến thấp"},
    {id: "rating", label: "Đánh giá cao nhất"},
];
export default function Main({id}: Props) {
    const {get} = useAxiosContext();
    const [pageNo, setPageNo] = useState(0);
    const [keyword, setKeyword] = useState<string>('');
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
            {isLoading && isLoadingShop && <Loading/>}
            {/* Shop Info Card */}
            <div className="bg-white shadow-sm">
                {/* Banner */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                    <Image
                        src={shop.bannerUrl || "/imageBanner.jpg"}
                        alt={shop.shopName}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {/* Shop Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative pb-6">
                        {/* Logo */}
                        <div className="absolute -top-12 left-0">
                            <div
                                className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                              {shop.logoUrl ? (
                                <Image
                                  src={shop.logoUrl}
                                  alt={shop.shopName}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <StoreRoundedIcon style={{fontSize: '64px'}} className="text-primary-c700"/>
                                </div>
                              )}
                            </div>
                        </div>

                        {/* Shop Name & Status */}
                        <div className="pt-16">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-grey-c900">{shop.shopName}</h1>
                                    </div>
                                    <p className="mt-2 text-grey-c600">{shop.description}</p>
                                </div>
                                <Button
                                  onClick={() => {
                                    const chatState: ChatState = {
                                      isOpen: true,
                                      shopId: shop.shopId,
                                      shopName: shop.shopName,
                                      logoUrl: shop.logoUrl,
                                      ownerId: shop.ownerId,
                                    }
                                    dispatch(openChat(chatState));
                                  }}
                                    color={ColorButton.PRIMARY}
                                    startIcon={<ChatBubbleOutlineIcon className=""/>}>
                                    Chat ngay
                                </Button>
                            </div>

                            {/* Shop Stats */}
                            <div
                                className="flex flex-wrap items-center gap-8 mt-6 py-4 border-t border-b border-grey-c200">
                                <div className="flex items-center gap-2">
                                    <Inventory2Icon className="w-5 h-5 text-primary-c500"/>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Sản phẩm:</span>
                                        <span
                                            className="text-base font-semibold text-grey-c900">{shop.activeProducts}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <TrendingUpIcon className="w-5 h-5 text-primary-c500"/>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Đã bán:</span>
                                        <span
                                            className="text-base font-semibold text-grey-c900">{formatNumber(shop.totalSold || 0)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <StarIcon className="w-5 h-5 text-yellow-500"/>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Đánh giá:</span>
                                        <span className="text-base font-semibold text-grey-c900">
                                            {shop.rating}/5 ({formatNumber(shop.numberOfRatings || 0)})
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CalendarTodayIcon className="w-5 h-5 text-primary-c500"/>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Tham gia:</span>
                                        <span
                                            className="text-base font-semibold text-grey-c900">{formatDate(shop.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-6 mt-6 pb-4">
                                <div className="flex items-center gap-2 text-grey-c600">
                                    <LocationOnIcon className="w-4 h-4"/>
                                    <span className="text-sm">{shop.detail}, {shop.ward}, {shop.province}</span>
                                </div>
                                <div className="flex items-center gap-2 text-grey-c600">
                                    <PhoneIcon className="w-4 h-4"/>
                                    <span className="text-sm">{shop.phoneNumber}</span>
                                </div>
                            </div>
                            <Divide/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Title title={"Sản phẩm của shop"}/>
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-grey-c200 p-4 mb-6">
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
                                value={sortBy}
                                onChange={(value) => {
                                    if (value === "price-asc") {
                                        setSortDir("asc");
                                        setSortBy("price");
                                    } else if (value === "price-desc") {
                                        setSortDir("desc");
                                        setSortBy("price");
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
                <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6`}>
                    {data && data.data && data.data.data.map((product) => (
                        <ProductCard product={product} key={product.productId}/>
                    ))}
                </div>
                <Pagination totalPages={totalPages} currentPage={pageNo} onPageChange={setPageNo}/>
            </div>
        </div>
    );
};
