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


interface ProductViewHomePageDTO {
  showProductIds: string[];
  pageResponse: PageResponse<ProductView>;
}

export default function Main() {
  const {get} = useAxiosContext();
  const [pageNo, setPageNo] = useState(0);
  const [showProductIds, setShowProductIds] = useState<string[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [products, setProducts] = useState<ProductView[]>([]);

  const productFetcher = ([url, page]: [string, number]) =>{
    const params = new URLSearchParams();
    params.append("pageNo", page.toString());
    params.append("pageSize", "12");
    if(showProductIds.length > 0) params.append("showProductIds", showProductIds.toString());
    if(totalElements > 0) params.append("totalElements", totalElements.toString());
    const fullUrl = `${url}?${params.toString()}`;
    return get<BaseResponse<ProductViewHomePageDTO>>(fullUrl, {isToken: true}).then((res) => res.data);

  }

  const {data, error, isLoading } = useSWR([`${PRODUCT_VIEW}/homepage`, pageNo], productFetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    onSuccess: (data: BaseResponse<ProductViewHomePageDTO>) => {
      const responseData = data.data;
      if (responseData) {
        setProducts((prevProducts) => [
          ...prevProducts,
          ...responseData.pageResponse.data
        ]);
        setShowProductIds(responseData.showProductIds);
        setTotalElements(responseData.pageResponse.totalElements);
      }
    }
  });
  const totalPages = data?.data?.pageResponse.totalPages || 0;

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
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-4">
      {isLoading && <Loading/>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard product={product} key={product.productId}/>
        ))}
      </div>
      <div className="flex justify-center mt-4 ">
        <button className={"cursor-pointer text-primary-c700 font-medium border border-primary-c700 px-4 py-2 rounded-lg hover:bg-primary-c100 transition-all disabled:cursor-not-allowed disabled:hover:bg-grey-c50 disabled:text-grey-c500 disabled:border-grey-c500"}
                disabled={isLoading || !data || pageNo + 1 >= totalPages}
          onClick={() => setPageNo(pageNo + 1)}
        >
          Xem thêm
        </button>
      </div>
    </div>
  );
}