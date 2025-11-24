"use client";
import {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import Table, {Column} from "@/libs/Table";
import Button from "@/libs/Button";
import {AlertType, ColorButton, ProductStatus, SortDir} from "@/enum";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ChangeCircleRoundedIcon from '@mui/icons-material/ChangeCircleRounded';
import {formatDateTime, formatPrice} from "@/util/FnCommon";
import CreateProductModal from "./CreateProductModal";
import UpdateProductModal from "./UpdateProductModal";
import UpdateStatusProductModal from "./UpdateStatusProductModal";
import DetailProductModal from "./DetailProductModal";
import useSWR from "swr";
import {get} from "@/services/axios";
import {PRODUCT} from "@/services/api";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import Chip, {ChipColor, ChipSize, ChipVariant} from "@/libs/Chip";
import {useDebounce} from "@/hooks/useDebounce";
import Loading from "@/components/modals/Loading";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";

interface ResCategoryDTO {
  categoryId: number;
  categoryName: string;
}

interface ResProductImageDTO {
  productImageId: number;
  imageUrl: string;
}

interface ResProductAttributeValueDTO {
  attributeValueId: number;
  attributeValue: string;
}

interface ResProductAttributeDTO {
  productAttributeId: number;
  attributeName: string;
  attributeValues: ResProductAttributeValueDTO[];
}

interface ResProductVariantDTO {
  productVariantId: number;
  price: number;
  stockQuantity: number;
  sold:number;
  isDefault: boolean;
  attributeValues: Record<string, string>;
}

interface ResProductDTO {
  productId: number;
  shopId: number;
  name: string;
  description: string;
  totalSold:number;
  productStatus: ProductStatus;
  category: ResCategoryDTO;
  productImages: ResProductImageDTO[];
  productAttributes: ResProductAttributeDTO[];
  productVariants: ResProductVariantDTO[];
  createdAt: string;
  updatedAt: string;
}

interface ProductTableProps {
  shopId: string;
}

const productFetcher = (url: string) =>
  get<BaseResponse<PageResponse<ResProductDTO>>>(url).then((res) => res.data);

export default function ProductTable({shopId}: ProductTableProps) {
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(SortDir.DESC);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const dispatch = useDispatch();

  // State for update status modal
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ResProductDTO | null>(null);

  // State for update product modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ResProductDTO | null>(null);

  // State for detail product modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productToView, setProductToView] = useState<ResProductDTO | null>(null);

  // Build URL với query params
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("shopId", shopId);
    if (selectedStatus) params.append("status", selectedStatus);
    if (debouncedKeyword) params.append("keyword", debouncedKeyword);
    params.append("pageNo", pageNo.toString());
    params.append("pageSize", pageSize);
    if (sortBy) {
      params.append("sortBy", sortBy);
      params.append("sortDir", sortDir);
    }
    return `${PRODUCT}/search?${params.toString()}`;
  }, [shopId, selectedStatus, debouncedKeyword, pageNo, pageSize, sortBy, sortDir]);

  // Fetch products using useSWR
  const {data, error, isLoading, mutate} = useSWR(buildUrl(), productFetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải danh sách sản phẩm",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  const pageData = data?.data;
  const products = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  const statusOptions: Option[] = [
    {id: "", label: "Tất cả trạng thái"},
    {id: ProductStatus.ACTIVE, label: "Đang bán"},
    {id: ProductStatus.INACTIVE, label: "Ngừng bán"},
  ];

  const getStatusColor = (status: ProductStatus): ChipColor => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ProductStatus.INACTIVE:
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
      default:
        return status;
    }
  };

  const highlightText = useCallback((text: string, keyword: string) => {
    if (!keyword || !text) return text;

    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={`highlight-${i}`} className="bg-yellow-c200 text-grey-c900 rounded px-1">{part}</mark>
          ) : (
            <span key={`text-${i}`}>{part}</span>
          )
        )}
      </span>
    );
  }, []);

  const handleClearSearch = () => {
    setKeyword("");
    setSelectedStatus("");
    setPageNo(0);
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

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(size);
    setPageNo(0);
  };

  const handleAddProduct = () => {
    setIsCreateModalOpen(true);
  };

  const columns: Column<ResProductDTO>[] = [
    {
      key: "productId",
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-grey-c900 font-semibold">
          {row.productId}
        </span>
      ),
    },
    {
      key: "name",
      label: "Sản phẩm",
      sortable: true,
      render: (row) => {
        const primaryImage = row.productImages[0];
        return (
          <div className="flex items-center gap-3">
            {primaryImage ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-primary-c200 bg-white flex-shrink-0">
                <Image
                  src={primaryImage.imageUrl}
                  alt={row.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg border-2 border-grey-c300 bg-grey-c100 flex-shrink-0 flex items-center justify-center">
                <span className="text-grey-c500 text-xs font-semibold">No Img</span>
              </div>
            )}
            <div className="max-w-[250px]">
              <div className="text-sm font-semibold text-grey-c900 truncate">
                {highlightText(row.name, keyword)}
              </div>
              {row.description && (
                <div className="text-xs text-grey-c600 truncate">
                  {highlightText(row.description, keyword)}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Danh mục",
      sortable: true,
      render: (row) => (
        <Chip
          label={row.category.categoryName}
          color={ChipColor.PRIMARY}
          variant={ChipVariant.SOFT}
          size={ChipSize.MEDIUM}
        />
      ),
    },
    {
      key: "variants",
      label: "Biến thể",
      render: (row) => (
        <div className="text-sm text-grey-c700">
          <span className="font-semibold">{row.productVariants.length}</span> phiên bản
        </div>
      ),
    },
    {
      key: "price",
      label: "Giá",
      render: (row) => {
        // Tìm biến thể mặc định
        const defaultVariant = row.productVariants.find(v => v.isDefault);
        const variant = defaultVariant || row.productVariants[0];

        return (
          <div className="text-sm font-semibold text-grey-c900">
            {formatPrice(variant.price)}
          </div>
        );
      },
    },
    {
      key: "stock",
      label: "Tồn kho",
      render: (row) => {
        const defaultVariant = row.productVariants.find(v => v.isDefault);
        const variant = defaultVariant || row.productVariants[0];
        const stock = variant.stockQuantity;
        const stockColor = stock === 0
          ? "text-support-c900"
          : stock < 20
            ? "text-yellow-c900"
            : "text-success-c900";

        return (
          <span className={`text-sm font-bold ${stockColor}`}>
            {stock}
          </span>
        );
      },
    },
    {
      key: "totalSold",
      label: "Đã bán",
      render: (row) => (
        <span className="text-sm font-bold text-grey-c900">
          {row.totalSold}
        </span>
      ),
    },
    {
      key: "productStatus",
      label: "Trạng thái",
      sortable: true,
      render: (row) => (
        <Chip
          label={getStatusLabel(row.productStatus)}
          color={getStatusColor(row.productStatus)}
          variant={ChipVariant.SOFT}
          size={ChipSize.MEDIUM}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-grey-c700">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Hành động",
      className: "text-center",
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              setProductToView(row);
              setIsDetailModalOpen(true);
            }}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon />
          </button>
          <button
            onClick={() => {
              setProductToEdit(row);
              setIsEditModalOpen(true);
            }}
            className="cursor-pointer p-2 text-yellow-c800 hover:bg-yellow-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Chỉnh sửa"
          >
            <EditRoundedIcon />
          </button>
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
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-grey-c200 p-6 hover:shadow-xl transition-shadow">
      {isLoading && <Loading/>}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded-full"></div>
          <h3 className="text-lg font-bold text-grey-c900">Danh sách sản phẩm</h3>
        </div>
        <Button
          onClick={handleAddProduct}
          color={ColorButton.SUCCESS}
          startIcon={<AddRoundedIcon />}
        >
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField
            value={keyword}
            onChange={(e) => setKeyword(e)}
            placeholder="Tìm kiếm theo tên sản phẩm, mô tả..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPageNo(0);
              }
            }}
          />
          {keyword && (
            <button
              onClick={handleClearSearch}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-grey-c200 rounded-full transition-all"
              title="Xóa tìm kiếm"
            >
              <ClearRoundedIcon className="text-grey-c600 text-xl"/>
            </button>
          )}
        </div>

        <div className="min-w-[200px]">
          <DropdownSelect
            value={selectedStatus}
            onChange={(value) => {
              setSelectedStatus(value);
              setPageNo(0);
            }}
            options={statusOptions}
            placeholder="Chọn trạng thái"
          />
        </div>
      </div>

      {/* Search Result Info */}
      {(keyword || selectedStatus) && (
        <div
          className="mb-4 flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200">
          <SearchRoundedIcon className="text-primary-c700"/>
          <span>
            Tìm thấy <strong className="text-primary-c800">{pageData?.totalElements || 0}</strong> sản phẩm
            {keyword && <> với từ khóa &ldquo;<strong className="text-primary-c800">{keyword}</strong>&rdquo;</>}
            {selectedStatus && <> - Trạng thái: <strong
                className="text-primary-c800">{statusOptions.find(o => o.id === selectedStatus)?.label}</strong></>}
          </span>
          <button
            onClick={handleClearSearch}
            className="ml-auto text-primary-c700 hover:text-primary-c900 underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      <Table
        columns={columns}
        data={products}
        keyExtractor={(row) => row.productId.toString()}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage={
          keyword || selectedStatus
            ? "Không tìm thấy sản phẩm phù hợp. Thử thay đổi từ khóa hoặc bộ lọc."
            : "Chưa có sản phẩm nào"
        }
      />

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <CreateProductModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          reload={() => mutate()}
          shopId={shopId}
        />
      )}

      {/* Update Product Modal */}
      {isEditModalOpen && productToEdit && (
        <UpdateProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setProductToEdit(null);
          }}
          reload={() => mutate()}
          productData={{
            productId: productToEdit.productId,
            shopId: productToEdit.shopId,
            name: productToEdit.name,
            description: productToEdit.description,
            categoryId: productToEdit.category.categoryId,
            categoryName: productToEdit.category.categoryName,
            productImages: productToEdit.productImages,
            productAttributes: productToEdit.productAttributes,
            productVariants: productToEdit.productVariants,
          }}
        />
      )}

      {/* Update Status Product Modal */}
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

      {/* Detail Product Modal */}
      {isDetailModalOpen && productToView && (
        <DetailProductModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setProductToView(null);
          }}
          productData={{
            productId: productToView.productId,
            shopId: productToView.shopId,
            name: productToView.name,
            description: productToView.description,
            productStatus: productToView.productStatus,
            categoryName: productToView.category.categoryName,
            productImages: productToView.productImages,
            productAttributes: productToView.productAttributes,
            productVariants: productToView.productVariants,
            createdAt: productToView.createdAt,
            updatedAt: productToView.updatedAt,
          }}
        />
      )}
    </div>
  );
}
