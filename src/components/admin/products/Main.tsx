"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useAxiosContext } from "@/components/provider/AxiosProvider";
import { PRODUCT_VIEW } from "@/services/api";
import Table, { Column } from "@/libs/Table";
import Loading from "@/components/modals/Loading";
import { ProductView } from "@/types/interface";
import { formatDateTime, formatPrice } from "@/util/fnCommon";
import Chip, { ChipColor, ChipSize, ChipVariant } from "@/libs/Chip";
import { ProductStatus, SortDir, AlertType } from "@/types/enum";
import { useDebounce } from "@/hooks/useDebounce";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import { openAlert } from "@/redux/slice/alertSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Title from "@/libs/Title";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ChangeCircleRoundedIcon from "@mui/icons-material/ChangeCircleRounded";
import UpdateStatusProductModal from "@/components/admin/shops/[id]/general/UpdateStatusProductModal";

export default function Main() {
  const { get } = useAxiosContext();
  const fetcher = (url: string) => get<BaseResponse<PageResponse<ProductView>>>(url, { isToken: true }).then(res => res.data);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(SortDir.DESC);
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const url = useBuildUrl({
    baseUrl: PRODUCT_VIEW,
    queryParams: {
      keyword: debouncedKeyword || undefined,
      pageNo,
      pageSize,
      status: selectedStatus || undefined,
      sortBy: sortBy || undefined,
      sortDir: sortBy ? sortDir : undefined,
    },
  });

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải danh sách sản phẩm",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  const pageData = data?.data;
  const products = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  const statusOptions: Option[] = [
    { id: "", label: "Tất cả trạng thái" },
    { id: ProductStatus.ACTIVE, label: "Đang bán" },
    { id: ProductStatus.INACTIVE, label: "Ngừng bán" },
    { id: ProductStatus.SUSPENDED, label: "Cấm bán" },
    { id: ProductStatus.DELETED, label: "Đã xóa" },
  ];

  const getStatusColor = (status: ProductStatus): ChipColor => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ProductStatus.INACTIVE:
        return ChipColor.WARNING;
      case ProductStatus.SUSPENDED:
        return ChipColor.ERROR;
      case ProductStatus.DELETED:
        return ChipColor.SECONDARY;
      default:
        return ChipColor.SECONDARY;
    }
  };

  const getStatusLabel = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return "Đang bán";
      case ProductStatus.INACTIVE:
        return "Ngừng bán";
      case ProductStatus.SUSPENDED:
        return "Cấm bán";
      case ProductStatus.DELETED:
        return "Đã xóa";
      default:
        return status;
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === SortDir.ASC ? SortDir.DESC : SortDir.ASC);
    } else {
      setSortBy(column);
      setSortDir(SortDir.ASC);
    }
    setPageNo(0);
  };

  const columns: Column<ProductView>[] = [
    {
      key: "productId",
      label: "STT",
      sortable: true,
      render: (row, index) => <span className="text-sm text-grey-c900 font-semibold">{pageNo * parseInt(pageSize) + index + 1}</span>
    },
    {
      key: "name",
      label: "Sản phẩm",
      sortable: true,
      render: (row) => {
        const primaryImage = row.productImages?.[0];
        return (
          <div className="flex items-center gap-3">
            {primaryImage ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-primary-c200 bg-white flex-shrink-0">
                <Image src={primaryImage.imageUrl} alt={row.name} width={56} height={56}
                  className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-lg border-2 border-grey-c300 bg-grey-c100 flex-shrink-0 flex items-center justify-center">
                <span className="text-grey-c500 text-xs font-semibold">No Img</span>
              </div>
            )}
            <div className="max-w-[350px]">
              <div className="text-sm font-semibold text-grey-c900 truncate">{row.name}</div>
              {row.description && <div className="text-xs text-grey-c600 truncate">{row.description}</div>}
            </div>
          </div>
        );
      },
    },
    {
      key: "categoryName",
      label: "Danh mục",
      sortable: true,
      render: (row) => <Chip label={row.categoryName} color={ChipColor.PRIMARY} variant={ChipVariant.SOFT}
        size={ChipSize.MEDIUM} />
    },
    {
      key: "price", label: "Giá", render: (row) => {
        const defaultVariant = row.productVariants?.find(v => v.isDefault) || row.productVariants?.[0];
        return <div
          className="text-sm font-semibold text-grey-c900">{defaultVariant ? formatPrice(defaultVariant.price) : "-"}</div>;
      }
    },
    {
      key: "stock", label: "Tồn kho", render: (row) => {
        const defaultVariant = row.productVariants?.find(v => v.isDefault) || row.productVariants?.[0];
        const stock = defaultVariant?.stockQuantity ?? 0;
        const stockColor = stock === 0 ? "text-support-c900" : stock < 20 ? "text-yellow-c900" : "text-success-c900";
        return <span className={`text-sm font-bold ${stockColor}`}>{stock}</span>;
      }
    },
    {
      key: "productStatus",
      label: "Trạng thái",
      sortable: true,
      render: (row) => <Chip label={getStatusLabel(row.productStatus)} color={getStatusColor(row.productStatus)}
        variant={ChipVariant.SOFT} size={ChipSize.MEDIUM} />
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (row) => <span className="text-sm text-grey-c700">{formatDateTime(row.createdAt)}</span>
    },
    {
      key: "actions", label: "Hành động", className: "text-center", render: (row) => (
        <div className="flex gap-2 justify-start ">
          <button
            onClick={() => {
              router.push(`/admin/shops/${row.shopId}/${row.productId}`);
            }}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon />
          </button>

          {/* Nếu trạng thái là SUSPENDED hoặc DELETED thì chỉ hiện nút xem */}
          {row.productStatus !== ProductStatus.DELETED && (
            <>
              <button
                onClick={() => {
                  setSelectedProduct(row);
                  setIsUpdateStatusModalOpen(true);
                }}
                className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                title="Đổi trạng thái"
              >
                <ChangeCircleRoundedIcon />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      {isLoading && <Loading />}

      <Title title={"Danh sách sản phẩm"} isDivide={true} />

      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField value={keyword} onChange={(e) => setKeyword(e)}
            placeholder="Tìm kiếm theo tên sản phẩm, mô tả..." />
        </div>
        <div className="min-w-[200px]">
          <DropdownSelect value={selectedStatus} onChange={(v) => {
            setSelectedStatus(v);
            setPageNo(0);
          }} options={statusOptions} placeholder="Chọn trạng thái" />
        </div>
      </div>

      <Table
        columns={columns}
        data={products}
        keyExtractor={(row) => row.productId.toString()}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={(p) => setPageNo(p)}
        pageSize={pageSize}
        setPageSize={(s) => setPageSize(s)}
        emptyMessage={keyword || selectedStatus ? "Không tìm thấy sản phẩm phù hợp. Thử thay đổi từ khóa hoặc bộ lọc." : "Chưa có sản phẩm nào"} />
      {isUpdateStatusModalOpen && selectedProduct && (
        <UpdateStatusProductModal
          isOpen={isUpdateStatusModalOpen}
          setIsOpen={() => setIsUpdateStatusModalOpen(false)}
          productId={selectedProduct.productId}
          productName={selectedProduct.name}
          currentStatus={selectedProduct.productStatus}
          reload={mutate}
        />
      )}
    </div>
  );
}
