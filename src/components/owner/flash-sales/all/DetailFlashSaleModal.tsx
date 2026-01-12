"use client";
import React, {useState, useEffect} from "react";
import Modal from "@/libs/Modal";
import Table, {Column} from "@/libs/Table";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {FLASH_SALE_PRODUCT_VIEW} from "@/services/api";
import {FlashSale, FlashSaleProductView} from "@/types/interface";
import {AlertType} from "@/types/enum";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {formatPrice} from "@/util/fnCommon";
import Image from "next/image";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DeleteFlashSaleProductModal from "./DeleteFlashSaleProductModal";
import UpdateFlashSaleProductModal from "./UpdateFlashSaleProductModal";

interface DetailFlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashSale: FlashSale;
}

export default function DetailFlashSaleModal({
                                               isOpen,
                                               onClose,
                                               flashSale,
                                             }: DetailFlashSaleModalProps) {
  const {get} = useAxiosContext();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("flashSaleProductId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedProduct, setSelectedProduct] = useState<FlashSaleProductView | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const url = useBuildUrl({
    baseUrl: FLASH_SALE_PRODUCT_VIEW,
    queryParams: {
      flashSaleCampaignId: flashSale.flashSaleCampaignId,
      isOwner: true,
      pageNo: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDir: sortDir,
    }
  });

  const fetchFlashSaleProducts = (url: string) =>
    get<BaseResponse<PageResponse<FlashSaleProductView>>>(url,{isToken:true}).then(res => res.data.data);

  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
    mutate,
  } = useSWR(url, fetchFlashSaleProducts
  );



  useEffect(() => {
    if (productsError) {
      const alert: AlertState = {
        isOpen: true,
        message: productsError.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, productsError]);

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

  const flashSaleProductColumns: Column<FlashSaleProductView>[] = [
    {
      key: "_id",
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {row.flashSaleProductId}
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
    {
      key: "actions",
      label: "Hành động",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              // setSelectedSchedule(row);
              // setIsDetailScheduleOpen(true);
            }}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon/>
          </button>
          <button
            onClick={() => handleUpdate(row)}
            className="cursor-pointer p-2 text-yellow-c800 hover:bg-yellow-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Chỉnh sửa"
          >
            <EditRoundedIcon/>
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xóa"
          >
            <DeleteOutlineRoundedIcon/>
          </button>
        </div>
      )
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết Flash Sale: ${flashSale?.campaignName || ""}`}
      maxWidth="7xl"
      showSaveButton={false}
      showCancelButton={false}
    >
      {productsLoading && <Loading/>}
      <div className="min-h-96">
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
      </div>

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
    </Modal>
  );
}

