'use client';

import {useState} from 'react';
import {ResponsiveBar} from '@nivo/bar';
import useSWR from 'swr';
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {PRODUCT_VIEW, SHOP_VIEW, USER_VIEW} from '@/services/api';
import Loading from '@/components/modals/Loading';
import {subMonths} from 'date-fns';
import Title from '@/libs/Title';
import {formatNumber, formatPrice} from "@/util/fnCommon";
import MonthRangePicker from "@/libs/MonthRangePicker";
import {
  DateRange,
  ProductViewStatisticDTO,
  ShopViewStatisticDTO,
  NewShopViewStatisticDTO,
  NewUserViewStatisticDTO
} from "@/types/interface";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import Empty from "@/libs/Empty";

export default function Main() {
  const {get} = useAxiosContext();

  const [selectRangeDate, setSelectRangeDate] = useState<DateRange | null>({
    start: subMonths(new Date(), 12),
    end: new Date(),
  });


  const [selectUserViewDate, setSelectUserViewDate] = useState<DateRange | null>({
    start: subMonths(new Date(), 12),
    end: new Date(),
  });

  const urlUserView = useBuildUrl({
    baseUrl: `${USER_VIEW}/statistic/date-range`,
    queryParams: {
      fromDate: selectUserViewDate ? selectUserViewDate.start?.toISOString() : undefined,
      toDate: selectUserViewDate ? selectUserViewDate.end?.toISOString() : undefined,
    }
  })
  const fetcherUserView = (url: string) => get<BaseResponse<NewUserViewStatisticDTO[]>>(url).then((res) => res.data);
  const {data: userViews, isLoading: isLoadingUserView} = useSWR(urlUserView, fetcherUserView, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })


  const urlNewShop = useBuildUrl({
    baseUrl: `${SHOP_VIEW}/statistic/date-range`,
    queryParams: {
      fromDate: selectRangeDate ? selectRangeDate.start?.toISOString() : undefined,
      toDate: selectRangeDate ? selectRangeDate.end?.toISOString() : undefined,
    }
  })
  const fetcherNewShop = (url: string) => get<BaseResponse<NewShopViewStatisticDTO[]>>(url).then((res) => res.data);
  const {data: newShopData, isLoading: isLoadingNewShop} = useSWR(urlNewShop, fetcherNewShop, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const urlTopRevenueShop = useBuildUrl({
    baseUrl: `${SHOP_VIEW}/statistic/top-revenue`,
    queryParams: {
      type: "revenue"
    }
  })
  const fetcherTopRevenueShop = (url: string) => get<BaseResponse<ShopViewStatisticDTO[]>>(url, {isToken: true}).then((res) => res.data);
  const {
    data: topRevenueShops,
    isLoading: isLoadingTopRevenueShops
  } = useSWR(urlTopRevenueShop, fetcherTopRevenueShop, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const urlTopSellingShop = useBuildUrl({
    baseUrl: `${SHOP_VIEW}/statistic/top-revenue`,
    queryParams: {
      type: "sold"
    }
  })
  const fetcherTopSellingShop = (url: string) => get<BaseResponse<ShopViewStatisticDTO[]>>(url, {isToken: true}).then((res) => res.data);
  const {
    data: topSellingShops,
    isLoading: isLoadingTopSellingShops
  } = useSWR(urlTopSellingShop, fetcherTopSellingShop, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const urlTopRevenueProduct = useBuildUrl({
    baseUrl: `${PRODUCT_VIEW}/statistic`,
    queryParams: {
      type: "revenue"
    }
  })
  const fetcherTopRevenueProduct = (url: string) => get<BaseResponse<ProductViewStatisticDTO[]>>(url, {isToken: true}).then((res) => res.data);
  const {
    data: topRevenueProducts,
    isLoading: isLoadingTopRevenueProducts
  } = useSWR(urlTopRevenueProduct, fetcherTopRevenueProduct, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const urlTopProductSold = useBuildUrl({
    baseUrl: `${PRODUCT_VIEW}/statistic`,
    queryParams: {
      type: "sold"
    }
  })
  const fetcherTopProduct = (url: string) => get<BaseResponse<ProductViewStatisticDTO[]>>(url, {isToken: true}).then((res) => res.data);
  const {
    data: topSellingProducts,
    isLoading: isLoadingTopSellingProducts
  } = useSWR(urlTopProductSold, fetcherTopProduct, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })



  return (
    <div className="space-y-6 overflow-y-auto">
      {/* Header */}
      {isLoadingNewShop && isLoadingTopSellingProducts && isLoadingUserView && isLoadingTopRevenueProducts && isLoadingTopSellingShops && isLoadingTopRevenueShops &&
        <Loading/>}
      <div>
        <Title title={"Bảng Điều Khiển Admin"} isDivide={true}/>
      </div>

      {/*/!* Stats Cards *!/*/}
      {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
      {/*  <Card*/}
      {/*    isStats*/}
      {/*    title="Tổng Doanh Thu"*/}
      {/*    value={formatPrice(ownerStatsData?.data?.totalRevenue || 0)}*/}
      {/*    icon={<AttachMoneyRoundedIcon className="text-4xl"/>}*/}
      {/*    iconBg="bg-primary-c200"*/}
      {/*    iconColor="text-primary-c700"*/}
      {/*    baseClasses={"bg-gradient-to-br from-primary-c50 to-white rounded-2xl shadow-sm border border-primary-c100"}*/}
      {/*  />*/}
      {/*  <Card*/}
      {/*    isStats*/}
      {/*    title="Tổng Đơn Hàng"*/}
      {/*    value={formatNumber(ownerStatsData?.data?.totalOrders || 0)}*/}
      {/*    icon={<ShoppingCartRoundedIcon className="text-4xl"/>}*/}
      {/*    iconBg="bg-success-c100"*/}
      {/*    iconColor="text-success-c600"*/}
      {/*    baseClasses={"bg-gradient-to-br from-success-c50 to-white rounded-2xl shadow-sm border border-success-c100"}*/}
      {/*  />*/}
      {/*  <Card*/}
      {/*    isStats*/}
      {/*    title="Tổng Sản Phẩm"*/}
      {/*    value={formatNumber(ownerStatsData?.data?.totalProducts || 0)}*/}
      {/*    icon={<TrendingUpRoundedIcon className="text-4xl"/>}*/}
      {/*    iconBg="bg-purple-100"*/}
      {/*    iconColor="text-purple-600"*/}
      {/*    baseClasses={"bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-sm border border-purple-100"}*/}
      {/*  />*/}
      {/*  <Card*/}
      {/*    isStats*/}
      {/*    title="Tổng Sản Phẩm Đã Bán"*/}
      {/*    value={formatNumber(ownerStatsData?.data?.totalSold || 0)}*/}
      {/*    icon={<StorefrontRoundedIcon className="text-4xl"/>}*/}
      {/*    iconBg="bg-orange-100"*/}
      {/*    iconColor="text-orange-600"*/}
      {/*    baseClasses={"bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-sm border border-orange-100"}*/}
      {/*  />*/}
      {/*</div>*/}

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className={"flex items-center justify-between mb-4"}>
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Người dùng mới Theo Tháng</h2>
          <MonthRangePicker
            value={selectUserViewDate}
            onChange={setSelectUserViewDate}
            maxRange={12}/>
        </div>
        {userViews && userViews.data && userViews.data.length > 0 ?
          <div style={{height: '400px'}}>
            <ResponsiveBar
              data={userViews.data}
              keys={["newUserViews"]}
              indexBy="localDate"
              margin={{top: 20, right: 20, bottom: 70, left: 60}}
              padding={0.5}
              valueScale={{type: 'linear'}}
              colors={['#2D7D9F']}
              axisTop={null}
              axisRight={null}
              borderRadius={5}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Người dùng',
                legendPosition: 'middle',
                legendOffset: -50,
              }}
              enableLabel={false}
              tooltip={({indexValue, value}) => (
                <div className="border border-grey-c200 rounded-xl shadow-lg overflow-hidden">
                  {/* header */}
                  <div className="bg-primary-c600 text-white px-4 py-2">
                    <div className="text-sm font-semibold">{indexValue}</div>
                  </div>

                  {/* body */}
                  <div className="bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary-c600"></div>
                      <div className="text-grey-c800 font-medium whitespace-nowrap">
                        Người dùng: <span className="text-primary-c700 font-bold">{value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
          :
          <div className={"flex items-center justify-center h-100 flex-col"}>
            <Empty/>
            <div className={"text-grey-c600"}>Không có dữ liệu người dùng</div>
          </div>
        }
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className={"flex items-center justify-between mb-4"}>
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Cửa hàng mới theo tháng</h2>
          <MonthRangePicker
            value={selectRangeDate}
            onChange={setSelectRangeDate}
            maxRange={12}/>
        </div>
        {newShopData && newShopData.data && newShopData.data.length > 0 ?
          <div style={{height: '400px'}}>
            <ResponsiveBar
              data={newShopData.data}
              keys={["newShopViews"]}
              indexBy="localDate"
              margin={{top: 20, right: 20, bottom: 70, left: 60}}
              padding={0.5}
              valueScale={{type: 'linear'}}
              colors={['#2D7D9F']}
              axisTop={null}
              axisRight={null}
              borderRadius={5}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Đơn hàng',
                legendPosition: 'middle',
                legendOffset: -50,
              }}
              enableLabel={false}
              tooltip={({indexValue, value}) => (
                <div className="border border-grey-c200 rounded-xl shadow-lg overflow-hidden">
                  {/* header */}
                  <div className="bg-primary-c600 text-white px-4 py-2">
                    <div className="text-sm font-semibold">{indexValue}</div>
                  </div>

                  {/* body */}
                  <div className="bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary-c600"></div>
                      <div className="text-grey-c800 font-medium whitespace-nowrap">
                        Cửa hàng: <span className="text-primary-c700 font-bold">{value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
          :
          <div className={"flex items-center justify-center h-100 flex-col"}>
            <Empty/>
            <div className={"text-grey-c600"}>Không có dữ liệu cửa hàng</div>
          </div>
        }
      </div>

      {/* Top Shop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-120">
        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Top 5 Cửa Hàng Doanh Thu</h2>
          <div className="space-y-3">
            {topRevenueShops && topRevenueShops.data && topRevenueShops.data.map((shop, index) => (
              <div
                key={shop.shopId}
                className="flex items-center gap-4 p-4 bg-grey-c50 rounded-lg hover:bg-grey-c100 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 bg-primary-c600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-grey-c900 truncate">{shop.shopName}</h3>
                  <p className="text-sm text-grey-c600">Đã bán: {formatNumber(shop.totalSold)} sản phẩm</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-grey-c900">{formatPrice(shop.totalRevenue)}</p>
                </div>
              </div>
            ))}

          </div>
          {topRevenueShops && topRevenueShops.data && topRevenueShops.data.length === 0 && (
            <div className={"flex flex-col items-center justify-center flex-1"}>
              <Empty/>
              <div className="text-center text-grey-c500">Chưa có dữ liệu sản phẩm</div>
            </div>
          )}
        </div>

        {/* Top Products Sold */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Top 5 Cửa Hàng Bán Chạy</h2>
          <div className="space-y-3">
            {topSellingShops && topSellingShops.data && topSellingShops.data.map((shop, index) => (
              <div
                key={shop.shopId}
                className="flex items-center gap-4 p-4 bg-grey-c50 rounded-lg hover:bg-grey-c100 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 bg-primary-c600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-grey-c900 truncate">{shop.shopName}</h3>
                  <p className="text-sm text-grey-c600">Đã bán: {formatNumber(shop.totalSold)} sản phẩm</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-grey-c900">{formatPrice(shop.totalRevenue)}</p>
                </div>
              </div>
            ))}
            {topSellingShops && topSellingShops.data && topSellingShops.data.length === 0 && (
              <div className={"flex flex-col items-center justify-center flex-1"}>
                <Empty/>
                <div className="text-center text-grey-c500">Chưa có dữ liệu sản phẩm</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-120">
        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Top 5 Sản Phẩm Doanh Thu</h2>
          <div className="space-y-3">
            {topRevenueProducts && topRevenueProducts.data && topRevenueProducts.data.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center gap-4 p-4 bg-grey-c50 rounded-lg hover:bg-grey-c100 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 bg-primary-c600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-grey-c900 truncate">{product.productName}</h3>
                  <p className="text-sm text-grey-c600">Đã bán: {formatNumber(product.totalSold)} sản phẩm</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-grey-c900">{formatPrice(product.totalRevenue)}</p>
                </div>
              </div>
            ))}

          </div>
          {topRevenueProducts && topRevenueProducts.data && topRevenueProducts.data.length === 0 && (
            <div className={"flex flex-col items-center justify-center flex-1"}>
              <Empty/>
              <div className="text-center text-grey-c500">Chưa có dữ liệu sản phẩm</div>
            </div>
          )}
        </div>

        {/* Top Products Sold */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Top 5 Sản Phẩm Bán Chạy</h2>
          <div className="space-y-3">
            {topSellingProducts && topSellingProducts.data && topSellingProducts.data.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center gap-4 p-4 bg-grey-c50 rounded-lg hover:bg-grey-c100 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 bg-primary-c600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-grey-c900 truncate">{product.productName}</h3>
                  <p className="text-sm text-grey-c600">Đã bán: {formatNumber(product.totalSold)} sản phẩm</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-grey-c900">{formatPrice(product.totalRevenue)}</p>
                </div>
              </div>
            ))}
            {topSellingProducts && topSellingProducts.data && topSellingProducts.data.length === 0 && (
              <div className={"flex flex-col items-center justify-center flex-1"}>
                <Empty/>
                <div className="text-center text-grey-c500">Chưa có dữ liệu sản phẩm</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}