"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import useSWR from "swr";
import Button from "@/libs/Button";
import {AlertType, ColorButton, ShopStatus} from "@/types/enum";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StoreRoundedIcon from '@mui/icons-material/Storefront';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import {useRouter} from "next/navigation";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {SHOP_VIEW} from "@/services/api";
import Loading from "@/components/modals/Loading";
import {openAlert} from "@/redux/slice/alertSlice";
import Chip, {ChipColor, ChipSize, ChipVariant} from "@/libs/Chip";
import {useDispatch} from "react-redux";
import ChangeCircleRoundedIcon from "@mui/icons-material/ChangeCircleRounded";
import UpdateStatusShopModal from "@/components/owner/shops/UpdateStatusShopModal";
import UpdateShopModal from "@/components/owner/shops/UpdateShopModal";
import {ShopView} from "@/types/interface";
import ScrollTab, {TabItem} from "@/libs/ScrollTab";
import General from "@/components/owner/shops/[id]/general/General";
import Orders from "@/components/owner/shops/[id]/orders/Orders";
import Reviews from "@/components/owner/shops/[id]/reviews/Reviews";
import Statistics from "@/components/owner/shops/[id]/statistics/Statistics";

type Props = {
  id: string;
}
export const shopDefault: ShopView = {
  shopId: "",
  shopName: "",
  description: "hello",
  logoUrl: "",
  bannerUrl: "",
  shopStatus: ShopStatus.INACTIVE,
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
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  totalOrder: 0,
};
export default function Main({id}: Props) {
  const {get} = useAxiosContext();

  const fetcher = (url: string) =>
    get<BaseResponse<ShopView>>(url, {isToken: true}).then(res => res.data.data);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const {data, error, isLoading, mutate} = useSWR(
    `${SHOP_VIEW}/${id}?isOwner=true`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );
  const shop = data ?? shopDefault;
  const tabs: TabItem[] = [
    {key: '1', label: 'Tổng quan'},
    {key: '2', label: 'Đơn hàng'},
    {key: '3', label: 'Đánh giá'},
    {key: '4', label: 'Thống kê'},
  ];

  const getStatusColor = (status: ShopStatus): ChipColor => {
    switch (status) {
      case ShopStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ShopStatus.INACTIVE:
        return ChipColor.WARNING;
      case ShopStatus.SUSPENDED:
        return ChipColor.ERROR;
      default:
        return ChipColor.WARNING;
    }
  };
  const getStatusLabel = (status: ShopStatus) => {
    switch (status) {
      case ShopStatus.ACTIVE:
        return "Đang hoạt động";
      case ShopStatus.INACTIVE:
        return "Ngừng hoạt động";
      case ShopStatus.SUSPENDED:
        return "Cấm hoạt động";
      default:
        return status;
    }
  };

  const handleBack = () => {
    router.push("/owner/shops");
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateStatus = () => {
    setIsUpdateStatusOpen(true);
  };

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải danh sách cửa hàng",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  return (
    <div className="overflow-y-auto min-h-0">
      {/* Header */}
      {isLoading && <Loading/>}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBack}
            color={ColorButton.SECONDARY}
            startIcon={<ArrowBackRoundedIcon/>}
          >
            Quay lại
          </Button>
        </div>
        {shop.shopStatus === ShopStatus.SUSPENDED && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-support-c100 border-2 border-support-c500 rounded-lg px-4 py-2 flex items-center gap-2">
              <WarningRoundedIcon className="text-support-c900"/>
              <span className="text-support-c900 font-semibold">Cửa hàng đã bị đình chỉ. Vui lòng liên hệ Admin để mở lại.</span>
            </div>
          </div>
        )}
        {/* Only show action buttons when shop is not suspended */}
        {shop.shopStatus !== ShopStatus.SUSPENDED && (
          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              color={ColorButton.WARNING}
              startIcon={<EditRoundedIcon/>}
            >
              Chỉnh sửa
            </Button>
            <Button
              onClick={handleUpdateStatus}
              color={ColorButton.ERROR}
              startIcon={<ChangeCircleRoundedIcon/>}
            >
              Đổi trạng thái
            </Button>
          </div>
        )}
      </div>

      {/* Banner với overlay gradient */}
      <div className="relative w-full h-72 rounded-3xl overflow-hidden mb-8 shadow-lg group">
        <Image
          src={shop.bannerUrl || "/imageBanner.jpg"}
          alt={shop.shopName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Shop info overlay on banner */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-end gap-6">
            {/* Logo */}
            <div
              className="w-28 h-28 rounded-full overflow-hidden bg-white shadow-2xl flex-shrink-0 transform hover:scale-105 transition-transform">
              {shop.logoUrl ? (
                <Image
                  src={shop.logoUrl}
                  alt={shop.shopName}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <StoreRoundedIcon style={{fontSize: '72px'}} className="text-primary-c700"/>
                </div>
              )}
            </div>

            {/* Title và rating */}
            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                {shop.shopName}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <StarRoundedIcon className="text-yellow-400"/>
                  <span className="text-xl font-bold">
                    {shop.numberOfRatings > 0 ? (shop.rating / shop.numberOfRatings).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm opacity-90">/ 5.0</span>
                </div>
                <Chip
                  label={getStatusLabel(shop.shopStatus)}
                  color={getStatusColor(shop.shopStatus)}
                  variant={ChipVariant.SOFT}
                  size={ChipSize.MEDIUM}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={"px-4 py-2 bg-white mb-2 rounded-2xl shadow-lg border border-grey-c200"}>
        <ScrollTab items={tabs} onChange={setActiveTab} activeKey={activeTab}/>
        {activeTab === '1' ? <General shop={shop} id={id}/>
          : activeTab === '2' ? <Orders id={id}/>
            : activeTab === '3' ? <Reviews id={id}/>
              : activeTab === '4' ? <Statistics shop={shop} id={id}/> : null
        }
      </div>

      {/* Update Status Shop Modal */}
      {isUpdateStatusOpen && shop && (
        <UpdateStatusShopModal
          isOpen={isUpdateStatusOpen}
          setIsOpen={setIsUpdateStatusOpen}
          reload={mutate}
          shopId={Number(shop.shopId)}
          currentStatus={shop.shopStatus}
          shopName={shop.shopName}
        />
      )}

      {/* Update Shop Modal */}
      {isEditModalOpen && shop && (
        <UpdateShopModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
          }}
          reload={mutate}
          shopData={{
            shopId: Number(shop.shopId),
            shopName: shop.shopName,
            description: shop.description,
            logoUrl: shop.logoUrl,
            bannerUrl: shop.bannerUrl,
            province: shop.province,
            ward: shop.ward,
            detail: shop.detail,
            phoneNumber: shop.phoneNumber,
          }}
        />
      )}
    </div>
  );
}
