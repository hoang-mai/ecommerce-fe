import React, {useEffect} from 'react';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import {formatNumber} from "@/util/FnCommon";
import Image from "next/image";
import Button from "@/libs/Button";
import {AlertType, ColorButton, ShopStatus} from "@/types/enum";
import Divide from "@/libs/Divide";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import { ShopView } from '@/types/interface';
import useSWR from "swr";
import {SHOP_VIEW} from "@/services/api";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import { useRouter } from "next/navigation";

type Props = {
    id: string;
}

const shopDefault : ShopView = {
    shopId: "0",
    shopName: "",
    description: "",
    logoUrl: "/images/default-shop-logo.png",
    bannerUrl: "/images/default-banner.png",
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

export default function Shop({id}: Props) {
    const {get} = useAxiosContext();
    const fetcher = (url: string) => get<BaseResponse<ShopView>>(url).then(res => res.data);
    const {data , isLoading, error} = useSWR(`${SHOP_VIEW}/${id}`, fetcher, {
        revalidateOnFocus: false,
        refreshInterval: 0
    });
    const router = useRouter();
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
    const shopData: ShopView = data?.data ?? shopDefault;
    return (
        <div className="bg-white rounded-lg hover:shadow-md transition-shadow border border-grey-c100 p-5 my-4">
            {isLoading && <Loading/>}
            {/* Shop Header */}
            <div className="flex items-start gap-4 pb-4">
                <Image
                    src={shopData.logoUrl}
                    alt={shopData.shopName}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border border-grey-c200"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-grey-c900 text-lg truncate">{shopData.shopName}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-grey-c600">
                        <Button
                            className={"!py-1 !px-2"}
                            color={ColorButton.SECONDARY}
                            startIcon={<ChatBubbleOutlineIcon className="!w-4 !h-4"/>}>
                            Chat ngay
                        </Button>
                        <Button
                            onClick={()=> router.push(`/shops/${shopData.shopId}`)}
                            className={"!py-1 !px-2"}
                            color={ColorButton.PRIMARY}
                            startIcon={<StorefrontIcon className="!w-4 !h-4"/>}>
                            Xem shop
                        </Button>
                    </div>
                </div>
            </div>
            <Divide/>
            {/* Shop Stats */}
            <div className="grid grid-cols-4 gap-4 py-4">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <StarIcon className="w-4 h-4 text-yellow-500"/>
                        <span className="font-semibold text-grey-c900">{shopData.rating}</span>
                    </div>
                    <p className="text-xs text-grey-c600">{formatNumber(shopData.numberOfRatings || 0)} đánh giá</p>
                </div>
                <div className="text-center border-l border-r border-grey-c100">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <ChatRoundedIcon className="w-4 h-4 text-primary-c500"/>
                        <span className="font-semibold text-grey-c900">{formatNumber(shopData.numberOfReviews || 0)}</span>
                    </div>
                    <p className="text-xs text-grey-c600">Phản hồi</p>
                </div>
                <div className="text-center border-r border-grey-c100">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Inventory2Icon className="w-4 h-4 text-primary-c500"/>
                        <span className="font-semibold text-grey-c900">{formatNumber(shopData.totalProducts || 0)}</span>
                    </div>
                    <p className="text-xs text-grey-c600">Sản phẩm</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <LocalMallIcon className="w-4 h-4 text-primary-c500"/>
                        <span className="font-semibold text-grey-c900">{formatNumber(shopData.totalSold || 0)}</span>
                    </div>
                    <p className="text-xs text-grey-c600">Đã bán</p>
                </div>
            </div>
        </div>
    );
};
