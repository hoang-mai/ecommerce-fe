"use client";
import React, {useEffect, useState} from "react";
import useSWR from "swr";
import Button from "@/libs/Button";
import {AlertType, ColorButton, ProductStatus} from "@/types/enum";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import {useRouter} from "next/navigation";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {PRODUCT_VIEW} from "@/services/api";
import Loading from "@/components/modals/Loading";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import ChangeCircleRoundedIcon from "@mui/icons-material/ChangeCircleRounded";
import {ProductView} from "@/types/interface";
import ScrollTab, {TabItem} from "@/libs/ScrollTab";
import General from "@/components/admin/shops/[id]/[productId]/general/General";
import Reviews from "@/components/admin/shops/[id]/[productId]/reviews/Reviews";
import Statistics from "@/components/admin/shops/[id]/[productId]/statistics/Statistics";
import {ShopStatus} from "@/types/enum";
import UpdateStatusProductModal from "@/components/admin/shops/[id]/general/UpdateStatusProductModal";

type Props = {
  productId: string;
}

export const productDefault: ProductView = {
  productId: "",
  shopId: "",
  rating: 0,
  numberOfRatings: 0,
  numberOfReviews: 0,
  ratingStatistics: {1:0,2:0,3:0,4:0,5:0},
  name: "",
  description: "",
  productStatus: ProductStatus.INACTIVE,
  totalSold: 0,
  categoryId: "",
  categoryName: "",
  shopStatus: ShopStatus.INACTIVE,
  productDetails: {},
  productImages: [],
  productAttributes: [],
  productVariants: [],
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export default function Main({productId}: Props) {
  const {get} = useAxiosContext();

  const fetcher = (url: string) =>
    get<BaseResponse<ProductView>>(url, {isToken: true}).then(res => res.data.data);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const {data, error, isLoading, mutate} = useSWR(
    `${PRODUCT_VIEW}/${productId}`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );
  const product = data ?? productDefault;

  const tabs: TabItem[] = [
    {key: '1', label: 'Tổng quan'},
    {key: '2', label: 'Đánh giá'},
    {key: '3', label: 'Thống kê'},
  ];

  const isUpdatable = product.productStatus === ProductStatus.ACTIVE || product.productStatus === ProductStatus.INACTIVE || product.productStatus === ProductStatus.SUSPENDED;

  const handleBack = () => {
    router.back();
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
        title: "Lỗi tải thông tin sản phẩm",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  return (
    <div className="overflow-y-auto min-h-0">
      {isLoading && <Loading/>}

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

        {/* Status banners */}
        {product.productStatus === ProductStatus.INACTIVE && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-yellow-c100 border-2 border-yellow-c500 rounded-lg px-4 py-2 flex items-center gap-2">
              <WarningRoundedIcon className="text-yellow-c900"/>
              <span className="text-yellow-c900 font-semibold">Sản phẩm đã ngừng hoạt động.</span>
            </div>
          </div>
        )}

        {product.productStatus === ProductStatus.SUSPENDED && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-support-c100 border-2 border-support-c500 rounded-lg px-4 py-2 flex items-center gap-2">
              <WarningRoundedIcon className="text-support-c900"/>
              <span className="text-support-c900 font-semibold">Sản phẩm đã bị đình chỉ.</span>
            </div>
          </div>
        )}

        {product.productStatus === ProductStatus.DELETED && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-grey-c50 border-2 border-grey-c200 rounded-lg px-4 py-2 flex items-center gap-2">
              <WarningRoundedIcon className="text-grey-c600"/>
              <span className="text-grey-c600 font-semibold">Sản phẩm đã bị xóa.</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {/* Only allow update status when product is ACTIVE or INACTIVE */}
          {isUpdatable && (
            <Button
              onClick={handleUpdateStatus}
              color={ColorButton.ERROR}
              startIcon={<ChangeCircleRoundedIcon/>}
            >
              Đổi trạng thái
            </Button>
          )}
        </div>
      </div>

      <div className={"px-4 py-2 bg-white mb-2 rounded-2xl shadow-lg border border-grey-c200"}>
        <ScrollTab items={tabs} onChange={setActiveTab} activeKey={activeTab}/>
        {activeTab === '1' ? <General product={product} productId={productId} mutate={mutate}/>
          : activeTab === '2' ? <Reviews productId={productId}/>
            : activeTab === '3' ? <Statistics product={product} productId={productId}/> : null
        }
      </div>

      {/* Update Status Product Modal */}
      {isUpdateStatusOpen && product && (
        <div>

          <UpdateStatusProductModal
            isOpen={isUpdateStatusOpen}
            setIsOpen={()=> setIsUpdateStatusOpen(false)}
            reload={mutate}
            productId={product.productId}
            currentStatus={product.productStatus}
            productName={product.name}
          />

        </div>
      )}
    </div>
  );
}