"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import useSWR from "swr";
import Button from "@/libs/Button";
import {AlertType, ColorButton, ShopStatus} from "@/type/enum";
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StoreRoundedIcon from '@mui/icons-material/Storefront';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import {formatDateTime} from "@/util/FnCommon";
import {useRouter} from "next/navigation";
import ProductTable from "./ProductTable";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {SHOP_VIEW} from "@/services/api";
import Loading from "@/components/modals/Loading";
import {openAlert} from "@/redux/slice/alertSlice";
import Chip, {ChipColor, ChipSize, ChipVariant} from "@/libs/Chip";
import {useDispatch} from "react-redux";
import {useAddressMapping} from "@/hooks/useAddressMapping";
import ChangeCircleRoundedIcon from "@mui/icons-material/ChangeCircleRounded";
import UpdateStatusShopModal from "@/components/owner/shops/UpdateStatusShopModal";
import UpdateShopModal from "@/components/owner/shops/UpdateShopModal";
import {InfoRow} from "@/libs/InfoRow";

interface ResShopDTO {
  shopId: number;
  ownerId: number;
  shopName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  rating: number | null;
  shopStatus: ShopStatus;
  province: string;
  ward: string;
  detail: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

type Props = {
  id: string;
}

export default function Main({id}: Props) {
  const {get} = useAxiosContext();

  const fetcher = (url: string) =>
    get<BaseResponse<ResShopDTO>>(url, {isToken: true}).then(res => res.data.data);

  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const {getProvinceName, getWardName} = useAddressMapping();
  const {data: shop, error, isLoading, mutate} = useSWR(
    `${SHOP_VIEW}/${id}?isOwner=true`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const getStatusColor = (status: ShopStatus): ChipColor => {
    switch (status) {
      case ShopStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ShopStatus.INACTIVE:
        return ChipColor.SECONDARY;
      case ShopStatus.SUSPENDED:
        return ChipColor.ERROR;
      default:
        return ChipColor.SECONDARY;
    }
  };
  const getStatusLabel = (status: ShopStatus) => {
    switch (status) {
      case ShopStatus.ACTIVE:
        return "Đang hoạt động";
      case ShopStatus.INACTIVE:
        return "Ngừng hoạt động";
      case ShopStatus.SUSPENDED:
        return "Đình chỉ";
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

  if (isLoading || !shop) {
    return <Loading/>;
  }

  return (
    <div className="pb-8">
      {/* Header */}
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
        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            color={ColorButton.WARNING}
            startIcon={<EditRoundedIcon/>}
            disabled={shop.shopStatus === ShopStatus.SUSPENDED}
          >
            Chỉnh sửa
          </Button>
          <Button
            onClick={handleUpdateStatus}
            color={ColorButton.ERROR}
            startIcon={<ChangeCircleRoundedIcon/>}
            disabled={shop.shopStatus === ShopStatus.SUSPENDED}
          >
            Đổi trạng thái
          </Button>
        </div>
      </div>

      {/* Banner với overlay gradient */}
      <div className="relative w-full h-72 rounded-3xl overflow-hidden mb-8 shadow-2xl group">
        {shop.bannerUrl ? (
          <Image
            src={shop.bannerUrl}
            alt={shop.shopName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Image
            src={"/imageBanner.jpg"}
            alt={shop.shopName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
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
                  <span className="text-xl font-bold">{shop.rating?.toFixed(1) || "0.0"}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Shop Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          {shop.description && (
            <div
              className="bg-white rounded-2xl shadow-lg border border-grey-c200 p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                Giới thiệu
              </h3>
              <div className="bg-grey-c50 rounded-lg p-4">
                <p className="text-grey-c700 leading-relaxed">
                  {shop.description}
                </p>
              </div>
            </div>
          )}

          {/* Contact & Address Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-grey-c200 p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thông tin liên hệ
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
              <InfoRow
                icon={<LocationOnRoundedIcon/>}
                label="Địa chỉ"
                value={`${shop.detail}, ${getWardName(shop.ward)}, ${getProvinceName(shop.province)}`}
              />
              <InfoRow
                icon={<PhoneRoundedIcon/>}
                label="Số điện thoại"
                value={shop.phoneNumber}
              />
            </div>
          </div>


          {/* Product Table */}
          <ProductTable shopId={id}/>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-grey-c200 p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Lịch sử
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
              <InfoRow
                icon={<CalendarTodayRoundedIcon/>}
                label="Ngày tạo"
                value={formatDateTime(shop.createdAt)}
              />
              <InfoRow
                icon={<AccessTimeRoundedIcon/>}
                label="Cập nhật gần nhất"
                value={formatDateTime(shop.updatedAt)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Update Status Shop Modal */}
      {isUpdateStatusOpen && shop && (
        <UpdateStatusShopModal
          isOpen={isUpdateStatusOpen}
          setIsOpen={setIsUpdateStatusOpen}
          reload={mutate}
          shopId={shop.shopId}
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
            shopId: shop.shopId,
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
