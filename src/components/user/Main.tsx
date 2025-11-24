'use client';
import ProductCard from "@/components/user/ProductCard";
import {PRODUCT_VIEW} from "@/services/api";
import useSWR from "swr";
import {useCallback, useEffect, useState} from "react";
import Loading from "@/components/modals/Loading";
import {AlertType} from "@/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import {ProductViewDTO} from "@/components/user/layout/header/Cart";
import {useAxiosContext} from "@/components/provider/AxiosProvider";


export default function Main() {
  const {get} = useAxiosContext();
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("pageNo", pageNo.toString());
    params.append("pageSize", pageSize);
    params.append("sortBy", sortBy);
    params.append("sortDir", sortDir);

    return `${PRODUCT_VIEW}?${params.toString()}`;
  }, [pageNo, pageSize, sortBy, sortDir]);
  const productFetcher = (url: string) =>
    get<BaseResponse<PageResponse<ProductViewDTO>>>(url).then((res) => res.data);

  const {data, error, isLoading} = useSWR(buildUrl(), productFetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
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
    <div className="max-w-6xl mx-auto p-4">
      {isLoading && <Loading/>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data && data.data && data.data.data.map((product) => (
          <ProductCard product={product} key={product.productId}/>
        ))}
      </div>
    </div>
  );
}