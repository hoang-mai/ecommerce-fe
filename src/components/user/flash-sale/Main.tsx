'use client';
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {FLASH_SALE_CAMPAIGN, FLASH_SALE_PRODUCT_VIEW} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {FlashSale, FlashSaleProductView} from "@/types/interface";
import useSWR from "swr";
import React, {useEffect, useMemo, useState} from "react";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import {format} from "date-fns";
import Loading from "@/components/modals/Loading";
import ScrollTab, {TabItem} from "@/libs/ScrollTab";
import ProductSaleCard from "@/components/user/ProductSaleCard";
import FlashSaleCountdown from "@/libs/FlashSaleCountdown";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";

export default function Main() {
  const [now, setNow] = useState<Date>(new Date());
  const {get} = useAxiosContext();
  const dispatch = useDispatch();
  const [activeKey, setActiveKey] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(0);
  const [flashSaleProductView, setFlashSaleProductView] = useState<FlashSaleProductView[]>([]);
  const url = useBuildUrl({
    baseUrl: `${FLASH_SALE_CAMPAIGN}/going-and-upcoming`,
    queryParams: {
      pageNo: 0,
      pageSize: 100,
      sortBy: "startTime",
      sortDir: "desc",
    }
  })
  const fetchTodayFlashSales = (url: string) =>
    get<BaseResponse<PageResponse<FlashSale>>>(url).then(res => res.data.data);

  const {
    data: todayData,
    error: todayError,
    isLoading: todayLoading,
  } = useSWR(url, fetchTodayFlashSales, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fetcherFlashSaleProduct = (url: string) => get<BaseResponse<PageResponse<FlashSaleProductView>>>(url).then((res) => res.data);

  const flashSales = useMemo(() => {
    return todayData?.data ? [...todayData.data].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    ) : [];
  }, [todayData]);

  const safeActiveKey = useMemo(() => {
    if (flashSales.length === 0) return 0;
    return Math.min(activeKey, Math.max(0, flashSales.length - 1));
  }, [flashSales.length, activeKey]);

  const activeSale = flashSales[safeActiveKey];
  const startTime = activeSale ? new Date(activeSale.startTime).getTime() : 0;
  const endTime = activeSale ? new Date(activeSale.endTime).getTime() : 0;

  const countdownTarget = useMemo(() => {
    const isBeforeStart = now.getTime() < startTime;
    return {
      time: isBeforeStart ? startTime : endTime,
      label: isBeforeStart ? 'bắt đầu sau' : 'kết thúc sau',
    };
  }, [now, startTime, endTime]);

  const tabItems: TabItem[] = flashSales.map((fs, index) => ({
    key: index,
    label: `${format(new Date(fs.startTime), "HH:mm")}-${format(new Date(fs.endTime), "HH:mm")}`,
  }));

  const urlFlashSaleProduct = useBuildUrl({
    baseUrl: `${FLASH_SALE_PRODUCT_VIEW}`,
    queryParams: {
      flashSaleCampaignId: flashSales[safeActiveKey]?.flashSaleCampaignId,
      pageNo: pageNo,
      pageSize: 12,
      sortBy: "score",
      sortDir: "desc",
    }
  });

  const {
    data: flashSaleProductData,
    error: flashSaleProductError,
    isLoading: isLoadingFlashSaleProduct
  } = useSWR(flashSales[safeActiveKey]?.flashSaleCampaignId ? urlFlashSaleProduct : null, fetcherFlashSaleProduct, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    onSuccess: (data) => {
      const res = data?.data?.data;
      if (res) {
        if (pageNo === 0) {
          setFlashSaleProductView(res);
        } else {
          setFlashSaleProductView((prev) => [...prev, ...res]);
        }
      }

    }
  });

  const totalPages = flashSaleProductData?.data?.totalPages || 0;


  useEffect(() => {
    if (todayError || flashSaleProductError) {
      const error = todayError || flashSaleProductError;
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, flashSaleProductError, todayError]);

  return (<div className={"max-w-6xl mx-auto p-4 flex flex-col gap-4"}>
    {(todayLoading || isLoadingFlashSaleProduct) && <Loading/>}
    {tabItems.length > 0 && (
      <div className={"bg-white p-4 rounded-lg shadow-md"}>
        <div className="flex justify-center items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-grey-c900 whitespace-nowrap">
            <div>
              <h2 className="text-2xl font-bold text-primary-c500 relative">
                <span>F</span><FlashOnRoundedIcon className="text-primary-c500 animate-pulse absolute top-1.5 left-2"/><span className={"ml-3"}>ASH SALE</span>
              </h2>
            </div>
            {activeSale && (
              <span className="text-primary-c700 font-medium flex justify-center">
                {countdownTarget.label}
              </span>
            )}
          </h2>

          {todayData && activeSale && (
            <>
              <span className="h-6 w-px bg-grey-c300"/>
              <FlashSaleCountdown
                key={`${activeSale.flashSaleCampaignId ?? "no"}-${countdownTarget.time}-${startTime}-${endTime}`}
                endDate={new Date(countdownTarget.time).toISOString()}
              />
            </>
          )}
        </div>
        <div className={"bg-grey-c200 w-full flex flex-row"}>
          {tabItems.length > 0 && tabItems.map((item, index) => (
            <div
              key={item.key}
              style={{width : `${100 / tabItems.length}%`, textAlign: 'center', cursor: 'pointer'}}
              onClick={() => {
                setActiveKey(index);
                setPageNo(0);
              }}
              className={`py-8 text-2xl ${safeActiveKey === index ? 'bg-primary-c700 text-white' : 'bg-transparent text-grey-c700'}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {flashSaleProductView.map((product) => (
        <ProductSaleCard product={product} key={product.flashSaleProductId}/>
      ))}
    </div>
    <div className="flex justify-center mt-4 ">
      <button
        className={"cursor-pointer text-primary-c700 font-medium border border-primary-c700 px-4 py-2 rounded-lg hover:bg-primary-c100 transition-all disabled:cursor-not-allowed disabled:hover:bg-grey-c50 disabled:text-grey-c500 disabled:border-grey-c500"}
        disabled={todayLoading || !flashSaleProductData || pageNo + 1 >= totalPages}
        onClick={() => setPageNo(pageNo + 1)}
      >
        Xem thêm
      </button>
    </div>
  </div>);
}
