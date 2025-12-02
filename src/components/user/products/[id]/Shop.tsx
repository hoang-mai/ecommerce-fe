import React, {useState} from 'react';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import {formatNumber} from "@/util/FnCommon";
import Image from "next/image";
import Button from "@/libs/Button";
import {ColorButton} from "@/types/enum";
import Divide from "@/libs/Divide";

type Props = {
    id: string;
}
export default function Shop({id}: Props) {
    const [shopData] = useState({
        shopId: "SHOP123456",
        shopName: "Tech Gadgets Store",
        logoUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop",
        shopStatus: "ACTIVE",
        province: "Hà Nội",
        ward: "Phường Dịch Vọng",
        totalProducts: 245,
        activeProducts: 198,
        totalSold: 15420,
        rating: 4.7,
        numberOfRatings: 3420,
        numberOfReviews: 856
    });

    return (
        <div className="bg-white rounded-lg hover:shadow-md transition-shadow border border-grey-c100 p-5 my-4">
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
                    <p className="text-xs text-grey-c600">{formatNumber(shopData.numberOfRatings)} đánh giá</p>
                </div>
                <div className="text-center border-l border-r border-grey-c100">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <ChatRoundedIcon className="w-4 h-4 text-primary-c500"/>
                        <span className="font-semibold text-grey-c900">{formatNumber(shopData.numberOfReviews)}</span>
                    </div>
                    <p className="text-xs text-grey-c600">Phản hồi</p>
                </div>
                <div className="text-center border-r border-grey-c100">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Inventory2Icon className="w-4 h-4 text-primary-c500"/>
                        <span className="font-semibold text-grey-c900">{formatNumber(shopData.totalProducts)}</span>
                    </div>
                    <p className="text-xs text-grey-c600">Sản phẩm</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <LocalMallIcon className="w-4 h-4 text-primary-c500"/>
                        <span className="font-semibold text-grey-c900">{formatNumber(shopData.totalSold)}</span>
                    </div>
                    <p className="text-xs text-grey-c600">Đã bán</p>
                </div>
            </div>
        </div>
    );
};
