"use client";
import React from "react";
import {ProductView} from "@/types/interface";
import {formatNumber, formatPrice} from "@/util/fnCommon";
import Card from "@/libs/Card";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
type Props = {
  product: ProductView;
  productId: string;
}

export default function Statistics({product}: Props) {

  const totalRevenue = product.productVariants.reduce(
    (sum, variant) => sum + (variant.price * variant.sold),
    0
  );

  const totalStock = product.productVariants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0
  );

  const averageRating = product.numberOfRatings > 0
    ? (product.rating / product.numberOfRatings).toFixed(1)
    : "0.0";

  const ratingDistribution = [
    { star: 5, count: product.ratingStatistics['FIVE'] || 0 },
    { star: 4, count: product.ratingStatistics['FOUR'] || 0 },
    { star: 3, count: product.ratingStatistics['THREE'] || 0 },
    { star: 2, count: product.ratingStatistics['TWO'] || 0 },
    { star: 1, count: product.ratingStatistics['ONE'] || 0 },
  ];


  return (
    <div className="py-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          isStats
          title="Tổng doanh thu"
          value={formatPrice(totalRevenue)}
          icon={<MonetizationOnRoundedIcon className="text-4xl" />}
          iconBg="bg-success-c200"
          iconColor="text-success-c700"
          baseClasses={"bg-gradient-to-br from-success-c50 to-white rounded-2xl shadow-sm border border-success-c100"}
        />

        <Card
          isStats
          title="Đã bán"
          value={formatNumber(product.totalSold)}
          icon={<ShoppingCartRoundedIcon className="text-4xl" />}
          iconBg="bg-primary-c200"
          iconColor="text-primary-c700"
          baseClasses={"bg-gradient-to-br from-primary-c50 to-white rounded-2xl shadow-sm border border-primary-c100"}
        />

        <Card
          isStats
          title="Đánh giá"
          value={averageRating}
          icon={<StarRateRoundedIcon className="text-4xl" />}
          iconBg="bg-yellow-c200"
          iconColor="text-yellow-c700"
          baseClasses={"bg-gradient-to-br from-yellow-c50 to-white rounded-2xl shadow-sm border border-yellow-c100"}
          />

        <Card
          isStats
          title="Tồn kho"
          value={formatNumber(totalStock)}
          icon={<Inventory2RoundedIcon className="text-4xl" />}
          iconBg="bg-orange-200"
          iconColor="text-orange-700"
          baseClasses={"bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-sm border border-orange-100"}
        />
      </div>

      {/* Rating Distribution */}
      <Card>
        <h3 className="text-xl font-bold mb-6 text-primary-c700">Phân bố đánh giá</h3>
        <div className="space-y-4">
          {ratingDistribution.map((item) => {
            const percentage = product.numberOfRatings > 0 ? (item.count / product.numberOfRatings) * 100 : 0;
            return (
              <div key={item.star} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="font-semibold">{item.star}</span>
                  <span className="text-yellow-500">★</span>
                </div>
                <div className="flex-1 bg-grey-c200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="font-semibold">{item.count}</span>
                  <span className="text-grey-c600 text-sm ml-1">({product.numberOfRatings > 0 ? ((item.count / product.numberOfRatings) * 100).toFixed(0) : 0}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-grey-c200">
          <div className="flex justify-between text-sm">
            <span className="text-grey-c600">Tổng số đánh giá:</span>
            <span className="font-semibold">{product.numberOfRatings}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-grey-c600">Tổng số nhận xét:</span>
            <span className="font-semibold">{product.numberOfReviews}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
