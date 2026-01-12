'use client';
import ProductCard from "@/components/user/ProductCard";
import {CATEGORY, FLASH_SALE_PRODUCT_VIEW, PRODUCT_VIEW} from "@/services/api";
import useSWR from "swr";
import React, {useEffect, useState} from "react";
import Loading from "@/components/modals/Loading";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {FlashSaleProductView, ProductView} from "@/types/interface";
import {useRouter} from "next/navigation";
import {ResCategorySearchDTO} from "@/components/admin/categories/Main";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LocalFloristRoundedIcon from '@mui/icons-material/LocalFloristRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import WatchRoundedIcon from '@mui/icons-material/WatchRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import FaceRetouchingNaturalRoundedIcon from '@mui/icons-material/FaceRetouchingNaturalRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import LocalGroceryStoreRoundedIcon from '@mui/icons-material/LocalGroceryStoreRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import FlashSaleCountdown from "@/libs/FlashSaleCountdown";
import ProductSaleCard from "@/components/user/ProductSaleCard";


interface ProductViewHomePageDTO {
  showProductIds: string[];
  pageResponse: PageResponse<ProductView>;
}

export default function Main() {
  const {get} = useAxiosContext();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(0);
  const [showProductIds, setShowProductIds] = useState<string[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [products, setProducts] = useState<ProductView[]>([]);

  const productFetcher = ([url, page]: [string, number]) =>{
    const params = new URLSearchParams();
    params.append("pageNo", page.toString());
    params.append("pageSize", "12");
    if(showProductIds.length > 0) params.append("showProductIds", showProductIds.toString());
    if(totalElements > 0) params.append("totalElements", totalElements.toString());
    const fullUrl = `${url}?${params.toString()}`;
    return get<BaseResponse<ProductViewHomePageDTO>>(fullUrl, {isToken: true}).then((res) => res.data);

  }

  const {data, error: errorProduct, isLoading } = useSWR([`${PRODUCT_VIEW}/homepage`, pageNo], productFetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    onSuccess: (data: BaseResponse<ProductViewHomePageDTO>) => {
      const responseData = data.data;
      if (responseData) {
        setProducts((prevProducts) => [
          ...prevProducts,
          ...responseData.pageResponse.data
        ]);
        setShowProductIds(responseData.showProductIds);
        setTotalElements(responseData.pageResponse.totalElements);
      }
    }
  });
  const totalPages = data?.data?.pageResponse.totalPages || 0;

  const fetcherCategory = (url: string) => get<BaseResponse<PageResponse<ResCategorySearchDTO>>>(url).then((res) => res.data);

  const urlCategory = useBuildUrl({
    baseUrl: `${CATEGORY}/search`,
    queryParams: {
      status: 'ACTIVE',
      pageNo: 0,
      pageSize: 100,
    }
  });
  const {data: categoriesResponse,error: errorCategory, isLoading: isLoadingCategory } = useSWR(urlCategory, fetcherCategory,
  );

  const fetcherFlashSaleProduct = (url: string) => get<BaseResponse<PageResponse<FlashSaleProductView>>>(url).then((res) => res.data);
  const urlFlashSaleProduct = useBuildUrl({
    baseUrl: `${FLASH_SALE_PRODUCT_VIEW}/current`,
    queryParams:{
      pageNo: 0,
      pageSize: 5,
    }
  });
  const {data: flashSaleProductData, error: flashSaleProductError, isLoading: isLoadingFlashSaleProduct} = useSWR(urlFlashSaleProduct, fetcherFlashSaleProduct,{
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const dispatch = useDispatch();
  useEffect(() => {
    if (errorProduct || errorCategory || flashSaleProductError) {
      const error = errorProduct || errorCategory || flashSaleProductError;
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, errorProduct, errorCategory,flashSaleProductError]);

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    const iconClass = "text-primary-c700 text-3xl";

    if (name.includes('điện thoại') || name.includes('phone') || name.includes('di động')) {
      return <PhoneAndroidRoundedIcon className={iconClass} />;
    }
    if (name.includes('laptop') || name.includes('máy tính') || name.includes('computer')) {
      return <LaptopRoundedIcon className={iconClass} />;
    }
    if (name.includes('thời trang') || name.includes('quần áo') || name.includes('fashion') || name.includes('clothing')) {
      return <CheckroomRoundedIcon className={iconClass} />;
    }
    if (name.includes('nhà cửa') || name.includes('nội thất') || name.includes('home') || name.includes('furniture')) {
      return <HomeRoundedIcon className={iconClass} />;
    }
    if (name.includes('game') || name.includes('gaming') || name.includes('trò chơi')) {
      return <SportsEsportsRoundedIcon className={iconClass} />;
    }
    if (name.includes('sách') || name.includes('book') || name.includes('văn phòng phẩm')) {
      return <MenuBookRoundedIcon className={iconClass} />;
    }
    if (name.includes('thể thao') || name.includes('sport')) {
      return <SportsSoccerRoundedIcon className={iconClass} />;
    }
    if (name.includes('thực phẩm') || name.includes('đồ ăn') || name.includes('food') || name.includes('ẩm thực')) {
      return <RestaurantRoundedIcon className={iconClass} />;
    }
    if (name.includes('làm đẹp') || name.includes('mỹ phẩm') || name.includes('beauty') || name.includes('cosmetic')) {
      return <FaceRetouchingNaturalRoundedIcon className={iconClass} />;
    }
    if (name.includes('hoa') || name.includes('cây') || name.includes('flower') || name.includes('plant')) {
      return <LocalFloristRoundedIcon className={iconClass} />;
    }
    if (name.includes('trẻ em') || name.includes('baby') || name.includes('kid') || name.includes('đồ chơi')) {
      return <ChildCareRoundedIcon className={iconClass} />;
    }
    if (name.includes('thú cưng') || name.includes('pet')) {
      return <PetsRoundedIcon className={iconClass} />;
    }
    if (name.includes('xe') || name.includes('ô tô') || name.includes('car') || name.includes('vehicle')) {
      return <DirectionsCarRoundedIcon className={iconClass} />;
    }
    if (name.includes('đồng hồ') || name.includes('watch')) {
      return <WatchRoundedIcon className={iconClass} />;
    }
    if (name.includes('tai nghe') || name.includes('headphone') || name.includes('âm thanh') || name.includes('audio')) {
      return <HeadphonesRoundedIcon className={iconClass} />;
    }
    if (name.includes('trang sức') || name.includes('jewelry') || name.includes('phụ kiện')) {
      return <DiamondRoundedIcon className={iconClass} />;
    }
    if (name.includes('gym') || name.includes('fitness') || name.includes('tập luyện')) {
      return <FitnessCenterRoundedIcon className={iconClass} />;
    }
    if (name.includes('dụng cụ') || name.includes('tool') || name.includes('thiết bị')) {
      return <BuildRoundedIcon className={iconClass} />;
    }
    if (name.includes('siêu thị') || name.includes('grocery') || name.includes('tạp hóa')) {
      return <LocalGroceryStoreRoundedIcon className={iconClass} />;
    }
    return <CategoryRoundedIcon className={iconClass} />;
  };

  const categories: ResCategorySearchDTO[] = categoriesResponse?.data?.data || [];
  const halfLength = Math.ceil(categories.length / 2);
  const row1 = categories.slice(0, halfLength);
  const row2 = categories.slice(halfLength);

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      {(isLoading || isLoadingCategory || isLoadingFlashSaleProduct) && <Loading/>}
      {/* Flash Sale section */}
      {flashSaleProductData?.data?.data && flashSaleProductData.data.data.length > 0 && (
        <div className="bg-gradient-to-r from-primary-c50 to-white p-4 rounded-lg shadow-lg overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl" />
            <div className="absolute top-0  w-full h-10 bg-primary-c300 blur-xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">

              <div>
                <h2 className="text-2xl font-bold text-primary-c500 relative">
                  <span>F</span><FlashOnRoundedIcon className="text-primary-c500 animate-pulse absolute top-1.5 left-2"/><span className={"ml-3"}>ASH SALE</span>
                </h2>
              </div>


              <div className="flex items-center gap-4">
                <FlashSaleCountdown endDate={flashSaleProductData.data.data[0].endTime} />
              </div>

              <button
                onClick={() => router.push('/flash-sale')}
                className="flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-primary-c900 px-4 py-2 rounded-full transition-all cursor-pointer border border-primary-c500/30"
              >
                <span className="text-sm font-medium">Xem tất cả</span>
                <ArrowForwardIosRoundedIcon className="!text-sm" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {flashSaleProductData.data.data.map((product) =>
                <ProductSaleCard product={product} key={product.flashSaleProductId} />
              )}
            </div>
          </div>
        </div>
      )}
      {/* Categories section */}
      <div className={"bg-white p-4 rounded-lg shadow-sm"}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-grey-c900">Danh mục</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="flex flex-col gap-4 min-w-max">
            {/* Row 1 */}
            <div className="flex gap-6 justify-around">
              {row1.map((cat) => (
                <div key={cat.categoryId} className="flex flex-col items-center text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={()=> router.push(`/search?categoryId=${cat.categoryId}`)}
                >
                  <div className="w-16 h-16 rounded-full bg-primary-c50 flex items-center justify-center mb-2">
                    {getCategoryIcon(cat.categoryName)}
                  </div>
                  <div className="text-sm text-grey-c900 text-wrap">{cat.categoryName}</div>
                </div>
              ))}
            </div>
            {/* Row 2 */}
            {row2.length > 0 && (
              <div className="flex gap-6 justify-around">
                {row2.map((cat) => (
                  <div key={cat.categoryId} className="flex flex-col items-center text-center cursor-pointer hover:opacity-80 transition-opacity"
                       onClick={()=> router.push(`/search?categoryId=${cat.categoryId}`)}
                  >
                    <div className="w-16 h-16 rounded-full bg-primary-c50 flex items-center justify-center mb-2">
                      {getCategoryIcon(cat.categoryName)}
                    </div>
                    <div className="text-sm text-grey-c900 text-wrap">{cat.categoryName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard product={product} key={product.productId}/>
        ))}
      </div>
      <div className="flex justify-center mt-4 ">
        <button className={"cursor-pointer text-primary-c700 font-medium border border-primary-c700 px-4 py-2 rounded-lg hover:bg-primary-c100 transition-all disabled:cursor-not-allowed disabled:hover:bg-grey-c50 disabled:text-grey-c500 disabled:border-grey-c500"}
                disabled={isLoading || !data || pageNo + 1 >= totalPages}
          onClick={() => setPageNo(pageNo + 1)}
        >
          Xem thêm
        </button>
      </div>
    </div>
  );
}