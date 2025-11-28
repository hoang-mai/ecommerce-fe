'use client';
import ProductCard from "@/components/user/ProductCard";
import {PRODUCT_VIEW} from "@/services/api";
import useSWR from "swr";
import React, {useEffect, useState} from "react";
import Loading from "@/components/modals/Loading";
import {AlertType} from "@/type/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {ProductView} from "@/type/interface";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";


export default function Main() {
  const {get} = useAxiosContext();
  const [pageNo, setPageNo] = useState(0);
  const url = useBuildUrl({
    baseUrl: PRODUCT_VIEW,
    queryParams: {
      pageNo,
      pageSize: 25,
    }
  });

  const productFetcher = (url: string) =>
    get<BaseResponse<PageResponse<ProductView>>>(url).then((res) => res.data);

  const {data, error, isLoading} = useSWR(url, productFetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const totalPages= data?.data?.totalPages || 0;
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
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    const start = Math.max(0, pageNo - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);

    for (let i = start; i < end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPageNo(i)}
          className={`cursor-pointer px-4 py-2 mx-1 rounded-lg transition-colors ${
            pageNo === i
              ? "bg-primary-c700 text-white font-bold"
              : "bg-grey-c100 text-grey-c700 hover:bg-grey-c200"
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };


  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col gap-4">
      {isLoading && <Loading/>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data && data.data && data.data.data.map((product) => (
          <ProductCard product={product} key={product.productId}/>
        ))}
      </div>
      {/* Pagination Buttons */}
      {totalPages > 1 && (
        <div className="overflow-x-auto ">
          <div className="flex items-center gap-2 justify-center mt-4">
            <button
              onClick={() => setPageNo(0)}
              disabled={pageNo === 0}
              className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Trang đầu"
            >
              <KeyboardDoubleArrowLeftRoundedIcon/>
            </button>
            <button
              onClick={() => setPageNo(Math.max(0, pageNo - 1))}
              disabled={pageNo === 0}
              className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Trang trước"
            >
              <KeyboardArrowLeftRoundedIcon/>
            </button>
            {renderPagination()}
            <button
              onClick={() => setPageNo(Math.min(totalPages - 1, pageNo + 1))}
              disabled={pageNo === totalPages - 1}
              className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Trang sau"
            >
              <KeyboardArrowRightRoundedIcon/>
            </button>
            <button
              onClick={() => setPageNo(totalPages - 1)}
              disabled={pageNo === totalPages - 1}
              className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Trang cuối"
            >
              <KeyboardDoubleArrowRightRoundedIcon/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}