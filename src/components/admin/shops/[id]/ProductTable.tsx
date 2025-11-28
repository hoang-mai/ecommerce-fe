"use client";
import {useState} from "react";
import Image from "next/image";
import Table, {Column} from "@/libs/Table";
import Button from "@/libs/Button";
import {ColorButton, SortDir} from "@/type/enum";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {formatDateTime} from "@/util/FnCommon";

interface ProductTableProps {
  shopId: string;
}

export default function ProductTable({shopId}: ProductTableProps) {
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(SortDir.DESC);

  // Mock data - Replace with actual API call
  const mockProducts: ResProductDTO[] = [
    {
      productId: 1,
      shopId: parseInt(shopId),
      name: "Áo thun nam cao cấp",
      description: "Áo thun cotton 100%, form regular fit, thoáng mát",
      productStatus: ProductStatus.ACTIVE,
      category: {
        categoryId: 1,
        categoryName: "Thời trang nam",
      },
      productImages: [
        {
          productImageId: 1,
          imageUrl: "/imageBanner.jpg",
          isPrimary: true,
        },
      ],
      productAttributes: [
        {
          productAttributeId: 1,
          attributeName: "Chất liệu",
          attributeValue: "Cotton 100%",
        },
        {
          productAttributeId: 2,
          attributeName: "Xuất xứ",
          attributeValue: "Việt Nam",
        },
      ],
      productVariants: [
        {
          productVariantId: 1,
          variantName: "Size M - Đen",
          price: 199000,
          stock: 50,
          sku: "TSN-M-DEN",
        },
        {
          productVariantId: 2,
          variantName: "Size L - Trắng",
          price: 199000,
          stock: 30,
          sku: "TSN-L-TRA",
        },
      ],
      createdAt: "2024-10-15T10:30:00",
      updatedAt: "2024-11-01T14:20:00",
    },
    {
      productId: 2,
      shopId: parseInt(shopId),
      name: "Quần jean nam slim fit",
      description: "Quần jean co giãn nhẹ, form slim fit ôm vừa vặn",
      productStatus: ProductStatus.ACTIVE,
      category: {
        categoryId: 1,
        categoryName: "Thời trang nam",
      },
      productImages: [
        {
          productImageId: 3,
          imageUrl: "/imageBanner.jpg",
          isPrimary: true,
        },
      ],
      productAttributes: [
        {
          productAttributeId: 3,
          attributeName: "Chất liệu",
          attributeValue: "Denim co giãn",
        },
      ],
      productVariants: [
        {
          productVariantId: 3,
          variantName: "Size 30 - Xanh đậm",
          price: 450000,
          stock: 25,
          sku: "QJ-30-XD",
        },
      ],
      createdAt: "2024-10-20T08:15:00",
      updatedAt: "2024-10-30T16:45:00",
    },
    {
      productId: 3,
      shopId: parseInt(shopId),
      name: "Giày sneaker thể thao",
      description: "Giày sneaker năng động, đế êm, phù hợp vận động",
      productStatus: ProductStatus.OUT_OF_STOCK,
      category: {
        categoryId: 2,
        categoryName: "Giày dép",
      },
      productImages: [
        {
          productImageId: 5,
          imageUrl: "/imageBanner.jpg",
          isPrimary: true,
        },
      ],
      productAttributes: [
        {
          productAttributeId: 4,
          attributeName: "Chất liệu",
          attributeValue: "Vải mesh + cao su",
        },
      ],
      productVariants: [
        {
          productVariantId: 4,
          variantName: "Size 42 - Trắng",
          price: 890000,
          stock: 0,
          sku: "SNK-42-TRA",
        },
      ],
      createdAt: "2024-09-10T11:30:00",
      updatedAt: "2024-11-02T10:00:00",
    },
  ];

  const totalPages = 2;

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return "bg-success-c200 text-success-c900";
      case ProductStatus.INACTIVE:
        return "bg-grey-c300 text-grey-c800";
      case ProductStatus.OUT_OF_STOCK:
        return "bg-support-c200 text-support-c900";
      case ProductStatus.DRAFT:
        return "bg-yellow-c200 text-yellow-c900";
      default:
        return "bg-grey-c300 text-grey-c800";
    }
  };

  const getStatusLabel = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return "Đang bán";
      case ProductStatus.INACTIVE:
        return "Ngừng bán";
      case ProductStatus.OUT_OF_STOCK:
        return "Hết hàng";
      case ProductStatus.DRAFT:
        return "Nháp";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (sortDir === SortDir.ASC) {
        setSortDir(SortDir.DESC);
      } else {
        setSortBy("");
        setSortDir(SortDir.DESC);
      }
    } else {
      setSortBy(column);
      setSortDir(SortDir.ASC);
    }
  };

  const handleAddProduct = () => {
    console.log("Add product for shop:", shopId);
  };

  const handleViewProduct = (id: number) => {
    console.log("View product:", id);
  };

  const handleEditProduct = (id: number) => {
    console.log("Edit product:", id);
  };

  const handleDeleteProduct = (id: number) => {
    console.log("Delete product:", id);
  };

  const columns: Column<ResProductDTO>[] = [
    {
      key: "productId",
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-grey-c700 font-semibold">
          #{row.productId}
        </span>
      ),
    },
    {
      key: "name",
      label: "Sản phẩm",
      sortable: true,
      render: (row) => {
        const primaryImage = row.productImages.find(img => img.isPrimary) || row.productImages[0];
        return (
          <div className="flex items-center gap-3">
            {primaryImage && (
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-primary-c200 bg-white flex-shrink-0">
                <Image
                  src={primaryImage.imageUrl}
                  alt={row.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="max-w-[250px]">
              <div className="text-sm font-semibold text-grey-c900 truncate">
                {row.name}
              </div>
              <div className="text-xs text-grey-c600 truncate">{row.description}</div>
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
        <span className="inline-block px-3 py-1 bg-primary-c100 text-primary-c800 rounded-full text-xs font-medium">
          {row.category.categoryName}
        </span>
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
      sortable: true,
      render: (row) => {
        const prices = row.productVariants.map(v => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return (
          <div className="text-sm font-semibold text-grey-c900">
            {minPrice === maxPrice
              ? formatPrice(minPrice)
              : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
            }
          </div>
        );
      },
    },
    {
      key: "stock",
      label: "Tồn kho",
      sortable: true,
      render: (row) => {
        const totalStock = row.productVariants.reduce((sum, v) => sum + v.stock, 0);
        const stockColor = totalStock === 0
          ? "text-support-c900"
          : totalStock < 20
            ? "text-yellow-c900"
            : "text-success-c900";

        return (
          <span className={`text-sm font-bold ${stockColor}`}>
            {totalStock}
          </span>
        );
      },
    },
    {
      key: "productStatus",
      label: "Trạng thái",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
            row.productStatus
          )}`}
        >
          {getStatusLabel(row.productStatus)}
        </span>
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
            onClick={() => handleViewProduct(row.productId)}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon />
          </button>
          <button
            onClick={() => handleEditProduct(row.productId)}
            className="cursor-pointer p-2 text-yellow-c800 hover:bg-yellow-c200 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <EditRoundedIcon />
          </button>
          <button
            onClick={() => handleDeleteProduct(row.productId)}
            className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-colors"
            title="Xóa"
          >
            <DeleteRoundedIcon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-grey-c200 p-6 hover:shadow-xl transition-shadow">
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

      <Table
        columns={columns}
        data={mockProducts}
        keyExtractor={(row) => row.productId.toString()}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={setPageNo}
        pageSize={pageSize}
        setPageSize={setPageSize}
        emptyMessage="Chưa có sản phẩm nào"
      />
    </div>
  );
}

