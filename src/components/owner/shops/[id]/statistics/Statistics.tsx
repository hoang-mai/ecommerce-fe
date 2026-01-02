'use client';

import { useState} from 'react';
import {ResponsiveLine} from '@nivo/line';
import {ResponsiveBar} from '@nivo/bar';
import useSWR from 'swr';
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {ORDER_VIEW, PRODUCT_VIEW} from '@/services/api';
import Loading from '@/components/modals/Loading';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import { subMonths} from 'date-fns';
import Card from '@/libs/Card';
import Title from '@/libs/Title';
import {formatNumber, formatPrice} from "@/util/fnCommon";
import MonthRangePicker from "@/libs/MonthRangePicker";
import {
  DateRange,
  OrderViewStatisticDTO,
  ShopView,
  ProductViewStatisticDTO,
  OrderViewStatisticRevenueDTO
} from "@/types/interface";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import Empty from "@/libs/Empty";

interface Props {
  shop: ShopView;
  id: string;
}


export default function Statistics({shop, id}: Props) {
  const {get} = useAxiosContext();
  const [selectRangeDate, setSelectRangeDate] = useState<DateRange | null>({
    start : subMonths(new Date(), 12),
    end: new Date(),
  });

  const [selectRangeRevenueDate, setSelectRangeRevenueDate] = useState<DateRange | null>({
    start: subMonths(new Date(), 12),
    end: new Date(),
  });

  const urlRevenue = useBuildUrl({
    baseUrl: `${ORDER_VIEW}/statistic/revenue`,
    queryParams: {
      shopId: id,
      fromDate: selectRangeRevenueDate ? selectRangeRevenueDate.start?.toISOString() : undefined,
      toDate: selectRangeRevenueDate ? selectRangeRevenueDate.end?.toISOString() : undefined,
    }
  })
  const fetcherRevenue = (url: string) => get<BaseResponse<OrderViewStatisticRevenueDTO[]>>(url).then((res) => res.data);
  const {data: revenue, isLoading: isLoadingRevenue} = useSWR(urlRevenue, fetcherRevenue, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const urlNewOrder = useBuildUrl({
    baseUrl: `${ORDER_VIEW}/statistic/date-range`,
    queryParams:{
      shopId: id,
      fromDate: selectRangeDate ? selectRangeDate.start?.toISOString() : undefined,
      toDate: selectRangeDate ? selectRangeDate.end?.toISOString()  : undefined,
    }
  })
  const fetcherNewOrder = (url: string) => get<BaseResponse<OrderViewStatisticDTO[]>>(url).then((res) => res.data);
  const {data: newOrderData, isLoading : isLoadingNewOrder} = useSWR(urlNewOrder, fetcherNewOrder, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const urlTopRevenueProduct = useBuildUrl({
    baseUrl: `${PRODUCT_VIEW}/statistic`,
    queryParams: {
      shopId: id,
      type: "revenue"
    }
  })
  const fetcherTopRevenueProduct = (url: string) => get<BaseResponse<ProductViewStatisticDTO[]>>(url, {isToken: true}).then((res) => res.data);
  const {data: topRevenueProducts, isLoading: isLoadingTopRevenueProducts} = useSWR(urlTopRevenueProduct, fetcherTopRevenueProduct, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const urlTopProduct = useBuildUrl({
    baseUrl: `${PRODUCT_VIEW}/statistic`,
    queryParams:{
      shopId: id,
    }
  })
  const fetcherTopProduct = (url: string) => get<BaseResponse<ProductViewStatisticDTO[]>>(url).then((res) => res.data);
  const {data: topProducts, isLoading : isLoadingTopProducts} = useSWR(urlTopProduct, fetcherTopProduct, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })



  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      {(isLoadingNewOrder || isLoadingTopProducts || isLoadingRevenue || isLoadingTopRevenueProducts) && <Loading/>}
      <div>
        <Title title={"Thống Kê Cửa Hàng"} isDivide={true}/>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          isStats
          title="Tổng Doanh Thu"
          value={formatPrice(shop.totalRevenue || 0)}
          icon={<AttachMoneyRoundedIcon className="text-4xl"/>}
          iconBg="bg-primary-c200"
          iconColor="text-primary-c700"
          baseClasses={"bg-gradient-to-br from-primary-c50 to-white rounded-2xl shadow-sm border border-primary-c100"}
        />
        <Card
          isStats
          title="Tổng Đơn Hàng"
          value={formatNumber(shop.totalOrder || 0)}
          icon={<ShoppingCartRoundedIcon className="text-4xl"/>}
          iconBg="bg-success-c100"
          iconColor="text-success-c600"
          baseClasses={"bg-gradient-to-br from-success-c50 to-white rounded-2xl shadow-sm border border-success-c100"}
        />
        <Card
          isStats
          title="Tổng Sản Phẩm"
          value={formatNumber(shop.totalProducts || 0)}
          icon={<InventoryRoundedIcon className="text-4xl"/>}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          baseClasses={"bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-sm border border-purple-100"}
        />
        <Card
          isStats
          title="Tổng Đã Bán"
          value={formatNumber(shop.totalSold || 0)}
          icon={<TrendingUpRoundedIcon className="text-4xl"/>}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          baseClasses={"bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-sm border border-orange-100"}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className={"flex items-center justify-between mb-4"}>
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Doanh Thu Theo Tháng</h2>
          <MonthRangePicker
            value={selectRangeRevenueDate}
            onChange={setSelectRangeRevenueDate}
            maxRange={12}/>
        </div>
        {revenue && revenue.data && revenue.data.length > 0 ?

          <div style={{height: '400px'}}>
            <ResponsiveLine
              data={[
                {
                  id: 'Doanh thu',
                  data: revenue.data.map((item) => ({
                    x: item.localDate,
                    y: item.totalRevenue,
                  })),
                },
              ]}
              margin={{top: 50, right: 40, bottom: 50, left: 100}}
              yScale={{type: 'linear', min: 0, max: 'auto', stacked: true, reverse: false}}
              curve="monotoneX"
              axisLeft={{
                tickSize: 1,
                tickPadding: 10,
                legend: 'Doanh thu (VNĐ)',
                legendOffset: -70,
                legendPosition: 'middle',
                format: (value) => formatNumber(value)
              }}

              colors={"#2D7D9F"}
              pointSize={10}
              pointColor="#ffffff"
              pointBorderWidth={2}
              pointBorderColor={{from: 'seriesColor', modifiers: []}}
              pointLabelYOffset={-12}
              enableArea={true}
              enableTouchCrosshair={true}
              useMesh={true}
              tooltip={({point}) => (
                <div className="border border-grey-c200 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-primary-c600 text-white px-4 py-2">
                    <div className="text-sm font-semibold">{point.data.xFormatted}</div>
                  </div>

                  <div className="bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-c600"></div>
                      <div className="text-grey-c800 font-medium whitespace-nowrap">
                        Doanh thu: <span
                        className="text-primary-c700 font-bold">{formatPrice(Number(point.data.y))}</span>
                      </div>
                    </div>
                  </div>
                </div>

              )}
            />
          </div> :
          <div className={"flex items-center justify-center h-100 flex-col"}>
            <Empty/>
            <div className={"text-grey-c600"}>Không có dữ liệu doanh thu</div>
          </div>
        }
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className={"flex items-center justify-between mb-4"}>
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Đơn Hàng Mới Theo Tháng</h2>
          <MonthRangePicker
            value={selectRangeDate}
            onChange={setSelectRangeDate}
            maxRange={12}
            required={true}
          />
        </div>
        {newOrderData && newOrderData.data && newOrderData.data.length > 0 ?
          <div style={{height: '400px'}}>
            <ResponsiveBar
              data={newOrderData.data}
              keys={["newOrders"]}
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
                  <div className="bg-primary-c600 text-white px-4 py-2">
                    <div className="text-sm font-semibold">{indexValue}</div>
                  </div>
                  <div className="bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary-c600"></div>
                      <div className="text-grey-c800 font-medium whitespace-nowrap">
                        Đơn hàng: <span className="text-primary-c700 font-bold">{value}</span>
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
            <div className={"text-grey-c600"}>Không có dữ liệu đơn hàng</div>
          </div>
        }

      </div>

      {/* Order Status & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-200">
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
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Top 5 Sản Phẩm Bán Chạy</h2>
          <div className="space-y-3">
            {topProducts && topProducts.data && topProducts.data.map((product, index) => (
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
          {topProducts && topProducts.data && topProducts.data.length === 0 && (
            <div className={"flex flex-col items-center justify-center flex-1"}>
              <Empty/>
              <div className="text-center text-grey-c500">Chưa có dữ liệu sản phẩm</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
