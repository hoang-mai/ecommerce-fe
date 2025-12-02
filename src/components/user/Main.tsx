'use client';
import ProductCard from "@/components/user/ProductCard";
import {PRODUCT_VIEW} from "@/services/api";
import useSWR from "swr";
import React, {useEffect, useState} from "react";
import Loading from "@/components/modals/Loading";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {ProductView} from "@/types/interface";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import Pagination from "@/libs/Pagination";


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



  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col gap-4">
      {isLoading && <Loading/>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data && data.data && data.data.data.map((product) => (
          <ProductCard product={product} key={product.productId}/>
        ))}
      </div>
      <Pagination  totalPages={totalPages} currentPage={pageNo} onPageChange={setPageNo}/>

    </div>
  );
}