import { useAxiosContext } from "@/components/provider/AxiosProvider";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import { FLASH_SALE_PRODUCT_VIEW } from "@/services/api";
import useSWR from "swr";
import React, { useEffect, useState } from "react";
import { AlertType } from "@/types/enum";
import { openAlert } from "@/redux/slice/alertSlice";
import { useDispatch } from "react-redux";
import Loading from "@/components/modals/Loading";
import { FlashSaleProductView, FlashSaleStatisticDTO } from "@/types/interface";
import Card from "@/libs/Card";
import { formatNumber, formatPrice } from "@/util/fnCommon";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import LocalMallRoundedIcon from "@mui/icons-material/LocalMallRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import Title from "@/libs/Title";
import Table, { Column } from "@/libs/Table";
import Image from "next/image";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DeleteFlashSaleProductModal from "@/components/owner/flash-sales/all/DeleteFlashSaleProductModal";
import UpdateFlashSaleProductModal from "@/components/owner/flash-sales/all/UpdateFlashSaleProductModal";

type Props = {
  id: string;
}
export default function Main({ id }: Props) {
  const { get } = useAxiosContext();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("flashSaleProductId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedProduct, setSelectedProduct] = useState<FlashSaleProductView | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const fetcher = (url: string) => get<BaseResponse<FlashSaleStatisticDTO>>(url, { isToken: true }).then(res => res.data.data);
  const url = useBuildUrl({
    baseUrl: `${FLASH_SALE_PRODUCT_VIEW}/statistic`,
    queryParams: {
      flashSaleCampaignId: id,
      isOwner: true,
    }
  });
  const dispatch = useDispatch();
  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });
  const urlFlashSaleProduct = useBuildUrl({
    baseUrl: FLASH_SALE_PRODUCT_VIEW,
    queryParams: {
      flashSaleCampaignId: id,
      isOwner: true,
      pageNo: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDir: sortDir,
    }
  });

  const fetchFlashSaleProducts = (url: string) =>
    get<BaseResponse<PageResponse<FlashSaleProductView>>>(url, { isToken: true }).then(res => res.data.data);

  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
    mutate,
  } = useSWR(urlFlashSaleProduct, fetchFlashSaleProducts);
  useEffect(() => {
    if (error || productsError) {
      const e = error || productsError;
      const alert: AlertState = {
        isOpen: true,
        message: e.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, error, productsError]);
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(size);
    setCurrentPage(0);
  };
  const handleUpdate = (product: FlashSaleProductView) => {
    setSelectedProduct(product);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (product: FlashSaleProductView) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleReload = () => {
    mutate();
  };
  const isFlashSaleOver = data?.startTime && new Date(data.startTime) < new Date();
  const flashSaleProductColumns: Column<FlashSaleProductView>[] = [
    {
      key: "_id",
      label: "STT",
      sortable: true,
      render: (row, index) => (
        <span className="text-grey-c800">
          {currentPage * parseInt(pageSize) + index + 1}
        </span>
      ),
    },
    {
      key: "productName",
      label: "Tên sản phẩm",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.productImages && row.productImages.length > 0 && (
            <Image
              src={row.productImages[0].imageUrl}
              alt={row.productName}
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-lg"
            />
          )}
          <span className="font-semibold text-primary-c900 line-clamp-2 max-w-xs">
            {row.productName}
          </span>
        </div>
      ),
    },
    {
      key: "productAttributes",
      label: "Thuộc tính",
      render: (row) => (
        <span className="text-grey-c800">
          {row.productAttributes && row.productAttributes.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(", ")}
        </span>
      ),
    },
    {
      key: "originalPrice",
      label: "Giá gốc",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800 line-through">
          {formatPrice(row.originalPrice)}
        </span>
      ),
    },
    {
      key: "discountPercentage",
      label: "Giảm giá",
      sortable: true,
      render: (row) => (
        <span className="text-red-500 font-semibold">
          -{row.discountPercentage}%
        </span>
      ),
    },
    {
      key: "flashSalePrice",
      label: "Giá Flash Sale",
      render: (row) => (
        <span className="text-primary-c900 font-bold">
          {formatPrice(row.originalPrice * (100 - row.discountPercentage) / 100)}
        </span>
      ),
    },
    {
      key: "totalRevenue",
      label: "Doanh Thu",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {formatPrice(row.originalPrice * (100 - row.discountPercentage) / 100 * row.soldQuantity)}
        </span>
      )
    },
    {
      key: "totalQuantity",
      label: "Tổng SL",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {row.totalQuantity}
        </span>
      ),
    },
    {
      key: "soldQuantity",
      label: "Đã bán",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {row.soldQuantity}
        </span>
      ),
    },
    {
      key: "maxQuantityPerUser",
      label: "Tối đa/người",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {row.maxQuantityPerUser}
        </span>
      ),
    },
    ...(!isFlashSaleOver
      ? [{
        key: "actions",
        label: "Hành động",
        render: (row: FlashSaleProductView) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdate(row)}
              className="cursor-pointer p-2 text-yellow-c800 hover:bg-yellow-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
              title="Chỉnh sửa"
            >
              <EditRoundedIcon />
            </button>
            <button
              onClick={() => handleDelete(row)}
              className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
              title="Xóa"
            >
              <DeleteOutlineRoundedIcon />
            </button>
          </div>
        ),
      },
      ]
      : [])
  ];
  return <div className={"overflow-y-auto"} >
    {(isLoading || productsLoading) && <Loading />}
    <Title title={`Thống Kê ${data?.flashSaleCampaignName || ''}`} isDivide={true} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        isStats
        title="Tổng Doanh Thu"
        value={formatPrice(data?.totalRevenue || 0)}
        icon={<MonetizationOnRoundedIcon className="text-4xl" />}
        iconBg="bg-primary-c200"
        iconColor="text-primary-c700"
        baseClasses={"bg-gradient-to-br from-primary-c50 to-white rounded-2xl shadow-sm border border-primary-c100"}
      />
      <Card
        isStats
        title="Tổng Số Lượng Đã Bán"
        value={formatNumber(data?.totalSoldQuantity || 0)}
        icon={<LocalMallRoundedIcon className="text-4xl" />}
        iconBg="bg-success-c100"
        iconColor="text-success-c600"
        baseClasses={"bg-gradient-to-br from-success-c50 to-white rounded-2xl shadow-sm border border-success-c100"}
      />
      <Card
        isStats
        title="Tổng Sản Phẩm"
        value={formatNumber(data?.totalQuantity || 0)}
        icon={<InventoryRoundedIcon className="text-4xl" />}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        baseClasses={"bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-sm border border-purple-100"}
      />
      <Card
        isStats
        title="Tỷ Lệ Bán Hàng"
        value={`${Number(data?.soldRate || 0).toFixed(2)}%`}
        icon={<PercentRoundedIcon className="text-4xl" />}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
        baseClasses={"bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-sm border border-orange-100"}
      />
    </div>
    <h1
      className="text-2xl font-bold text-primary-c900 hover:bg-primary-c100 rounded-lg transition-colors p-2 w-fit mt-8 mb-4">
      Danh Sách Sản Phẩm Trong Flash Sale
    </h1>
    <Table
      columns={flashSaleProductColumns}
      data={productsData?.data || []}
      keyExtractor={(row) => row.flashSaleProductId}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={handleSort}
      currentPage={currentPage}
      totalPages={productsData?.totalPages || 1}
      onPageChange={handlePageChange}
      pageSize={pageSize}
      setPageSize={handlePageSizeChange}
      emptyMessage="Chưa có sản phẩm nào trong Flash Sale này"
    />
    {/* Delete Modal */}
    {selectedProduct && (
      <DeleteFlashSaleProductModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        reload={handleReload}
        flashSaleProduct={selectedProduct}
      />
    )}

    {/* Update Modal */}
    {selectedProduct && isUpdateModalOpen && (
      <UpdateFlashSaleProductModal
        isOpen={isUpdateModalOpen}
        setIsOpen={setIsUpdateModalOpen}
        reload={handleReload}
        flashSaleProduct={selectedProduct}
      />
    )}
  </div>
}