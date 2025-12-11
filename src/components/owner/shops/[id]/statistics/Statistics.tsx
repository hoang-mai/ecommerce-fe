'use client';

import {useEffect, useState} from 'react';
import {ResponsiveLine} from '@nivo/line';
import {ResponsiveBar} from '@nivo/bar';
import {ResponsivePie} from '@nivo/pie';
import useSWR from 'swr';
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {ORDER_VIEW, PRODUCT_VIEW} from '@/services/api';
import {OrderStatus} from '@/types/enum';
import Loading from '@/components/modals/Loading';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import {format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths} from 'date-fns';
import {vi} from 'date-fns/locale';
import Card from '@/libs/Card';
import Title from '@/libs/Title';
import {formatNumber, formatPrice} from "@/util/FnCommon";
import MonthRangePicker from "@/libs/MonthRangePicker";
import {DateRange, OrderViewStatisticDTO, ShopView,ProductViewStatisticDTO} from "@/types/interface";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import Empty from "@/libs/Empty";

interface Props {
  shop: ShopView;
  id: string;
}



interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;

  [key: string]: string | number;
}

interface OrderStatusCount {
  id: string;
  label: string;
  value: number;
  color: string;
}


interface OrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productVariantId: string;
  quantity: number;
  price: number;
  totalFinalPrice: number;
}

interface Order {
  orderId: string;
  userId: string;
  shopId: string;
  shopName: string;
  orderStatus: OrderStatus;
  totalPrice: number;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function Statistics({shop, id}: Props) {
  const {get} = useAxiosContext();
  const [selectRangeDate, setSelectRangeDate] = useState<DateRange | null>({
    start : subMonths(new Date(), 12),
    end: new Date(),
  });
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


  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusCount[]>([]);


  // Fetch orders data for this shop
  const {data: ordersData} = useSWR(
    `${ORDER_VIEW}?isOwner=true&shopId=${id}&pageSize=1000`,
    (url: string) => get<BaseResponse<PageResponse<Order>>>(url, {isToken: true}).then((res) => res.data),
    {revalidateOnFocus: false}
  );

  const processData = (orders: Order[]) => {



    // Calculate growth (last month vs current month)
    const now = new Date();



    // Process monthly data (last 6 months)
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
    });

    const monthlyRevenue: MonthlyRevenue[] = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd && o.orderStatus !== OrderStatus.CANCELLED;
      });

      return {
        month: format(month, 'MM/yyyy', {locale: vi}),
        revenue: monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
        orders: monthOrders.length,
      };
    });

    setMonthlyData(monthlyRevenue);

    // Process order status data
    const statusCounts = new Map<OrderStatus, number>();
    orders.forEach((order) => {
      const status = order.orderStatus;
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const statusColors: Record<string, string> = {
      [OrderStatus.PENDING]: '#FFA726',
      [OrderStatus.CONFIRMED]: '#42A5F5',
      [OrderStatus.PAID]: '#66BB6A',
      [OrderStatus.SHIPPED]: '#AB47BC',
      [OrderStatus.DELIVERED]: '#26A69A',
      [OrderStatus.COMPLETED]: '#4CAF50',
      [OrderStatus.RETURNED]: '#EF5350',
      [OrderStatus.CANCELLED]: '#757575',
    };

    const statusLabels: Record<string, string> = {
      [OrderStatus.PENDING]: 'Chờ xác nhận',
      [OrderStatus.CONFIRMED]: 'Đã xác nhận',
      [OrderStatus.PAID]: 'Đã thanh toán',
      [OrderStatus.SHIPPED]: 'Đang giao',
      [OrderStatus.DELIVERED]: 'Đã giao',
      [OrderStatus.COMPLETED]: 'Hoàn thành',
      [OrderStatus.RETURNED]: 'Trả hàng',
      [OrderStatus.CANCELLED]: 'Đã hủy',
    };

    const orderStatusData: OrderStatusCount[] = Array.from(statusCounts.entries()).map(
      ([status, count]) => ({
        id: status,
        label: statusLabels[status] || status,
        value: count,
        color: statusColors[status] || '#999',
      })
    );

    setOrderStatusData(orderStatusData);




  };

  useEffect(() => {
    if (ordersData) {
      processData(ordersData?.data?.data || []);
    }
  }, [ordersData]);

  // Chart data for revenue
  const revenueChartData = [
    {
      id: 'Doanh thu',
      color: '#4F46E5',
      data: monthlyData.map((m) => ({
        x: m.month,
        y: m.revenue,
      })),
    },
  ];


  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      {isLoadingNewOrder && isLoadingTopProducts && <Loading/>}
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
        <h2 className="text-xl font-bold text-primary-c600 mb-4">Doanh Thu Theo Tháng</h2>
        <div style={{height: '400px'}}>
          <ResponsiveLine
            data={revenueChartData}
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
        </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-primary-c600 mb-4">Trạng Thái Đơn Hàng</h2>
          <div style={{height: '400px'}}>
            <ResponsivePie
              data={orderStatusData}
              margin={{top: 20, right: 80, bottom: 80, left: 80}}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{datum: 'data.color'}}
              borderWidth={1}
              borderColor={{from: 'color', modifiers: [['darker', 0.2]]}}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{from: 'color'}}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{from: 'color', modifiers: [['darker', 2]]}}
              tooltip={({datum}) => (
                <div className="border border-grey-c200 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-primary-c600 text-white px-4 py-2">
                    <div className="text-sm font-semibold">{datum.label}</div>
                  </div>
                  <div className="bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: datum.color}}></div>
                      <div className="text-grey-c800 font-medium whitespace-nowrap">
                        Số lượng: <span className="text-primary-c700 font-bold">{datum.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
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
            {topProducts && topProducts.data && topProducts.data.length === 0 && (
              <div className="text-center py-8 text-grey-c500">Chưa có dữ liệu sản phẩm</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
