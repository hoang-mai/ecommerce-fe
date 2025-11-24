"use client";
import React, {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import useSWR from "swr";
import DropdownSelect from "@/libs/DropdownSelect";
import TextField from "@/libs/TextField";
import Table, {Column} from "@/libs/Table";
import Button from "@/libs/Button";
import Chip, {ChipColor, ChipSize, ChipVariant} from "@/libs/Chip";
import {AlertType, ColorButton, ShopStatus, SortDir} from "@/enum";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ChangeCircleRoundedIcon from '@mui/icons-material/ChangeCircleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import Title from "@/libs/Title";
import {formatDateTime} from "@/util/FnCommon";
import CreateShopModal from "./CreateShopModal";
import UpdateShopModal from "./UpdateShopModal";
import UpdateStatusShopModal from "./UpdateStatusShopModal";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {SHOP} from "@/services/api";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDebounce} from "@/hooks/useDebounce";
import Loading from "@/components/modals/Loading";
import {useAddressMapping} from "@/hooks/useAddressMapping";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {useRouter} from "next/navigation";

interface Shop {
  shopId: number;
  ownerId: number;
  shopName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  rating: number | null;
  shopStatus: ShopStatus;
  province: string;
  ward: string;
  detail: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export default function Main() {
  const { get } = useAxiosContext();
  const fetcher = (url: string) =>
    get<BaseResponse<PageResponse<Shop>>>(url).then(res => res.data);

  const [status, setStatus] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(SortDir.DESC);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const router = useRouter();
  const debouncedKeyword = useDebounce(keyword, 500);
  const dispatch = useDispatch();
  const {getProvinceName, getWardName} = useAddressMapping();

  // Build URL với query params
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (debouncedKeyword) params.append("keyword", debouncedKeyword);
    params.append("pageNo", currentPage.toString());
    params.append("pageSize", pageSize);
    if (sortBy) {
      params.append("sortBy", sortBy);
      params.append("sortDir", sortDir);
    }
    return `${SHOP}?${params.toString()}`;
  }, [status, debouncedKeyword, currentPage, pageSize, sortBy, sortDir]);

  const {data, error, isLoading, mutate} = useSWR(buildUrl(), fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải danh sách cửa hàng",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  const statusOptions: Option[] = [
    {id: "", label: "Tất cả trạng thái"},
    {id: ShopStatus.ACTIVE, label: "Đang hoạt động"},
    {id: ShopStatus.INACTIVE, label: "Ngừng hoạt động"},
    {id: ShopStatus.SUSPENDED, label: "Đình chỉ"},
  ];

  const getStatusColor = (status: ShopStatus): ChipColor => {
    switch (status) {
      case ShopStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ShopStatus.INACTIVE:
        return ChipColor.SECONDARY;
      case ShopStatus.SUSPENDED:
        return ChipColor.ERROR;
      default:
        return ChipColor.SECONDARY;
    }
  };

  const getStatusLabel = (status: ShopStatus) => {
    switch (status) {
      case ShopStatus.ACTIVE:
        return "Đang hoạt động";
      case ShopStatus.INACTIVE:
        return "Ngừng hoạt động";
      case ShopStatus.SUSPENDED:
        return "Đình chỉ";
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
    setStatus("");
    setCurrentPage(0);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === SortDir.ASC ? SortDir.DESC : SortDir.ASC);
    } else {
      setSortBy(column);
      setSortDir(SortDir.ASC);
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleAddShop = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewShop = (id: number) => {
    router.push(`/owner/shops/${id}`);
  };

  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop);
    setIsEditModalOpen(true);
  };

  const handleUpdateStatus = (shop: Shop) => {
    setSelectedShop(shop);
    setIsUpdateStatusOpen(true);
  };


  // Define columns for the table
  const columns: Column<Shop>[] = [
    {
      key: "shopId",
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-grey-c900 font-semibold">
          {row.shopId}
        </span>
      ),
    },
    {
      key: "shopName",
      label: "Cửa hàng",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.logoUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-c200 bg-white flex-shrink-0">
              <Image
                src={row.logoUrl}
                alt={row.shopName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-primary-c200 bg-primary-c50 flex-shrink-0 flex items-center justify-center">
              <StorefrontIcon className="text-primary-c700" style={{fontSize: 24}}/>
            </div>
          )}
          <div className="max-w-[200px]">
            <div className="text-sm font-semibold text-grey-c900 truncate">
              {highlightText(row.shopName, keyword)}
            </div>
            <div className="text-xs text-grey-c600 truncate">
              {row.description || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Đánh giá",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm font-semibold text-grey-c900">
            {row.rating != null ? row.rating.toFixed(1) : "0.0"}
          </span>
        </div>
      ),
    },
    {
      key: "address",
      label: "Địa chỉ",
      render: (row) => (
        <div className="max-w-[250px]">
          <div className="text-sm text-grey-c800 truncate">
            {highlightText(row.detail, keyword)}
          </div>
          <div className="text-xs text-grey-c600">
            {getWardName(row.ward)}, {getProvinceName(row.province)}
          </div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Số điện thoại",
      render: (row) => (
        <span className="font-mono text-sm text-grey-c800">
          {row.phoneNumber}
        </span>
      ),
    },
    {
      key: "shopStatus",
      label: "Trạng thái",
      sortable: true,
      render: (row) => (
        <Chip
          label={getStatusLabel(row.shopStatus)}
          color={getStatusColor(row.shopStatus)}
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
            onClick={() => handleViewShop(row.shopId)}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon/>
          </button>
          <button
            onClick={() => handleEditShop(row)}
            className="cursor-pointer p-2 text-yellow-c800 hover:bg-yellow-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Chỉnh sửa"
          >
            <EditRoundedIcon/>
          </button>
          <button
            onClick={() => handleUpdateStatus(row)}
            className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Đổi trạng thái"
          >
            <ChangeCircleRoundedIcon/>
          </button>
        </div>
      ),
    },
  ];

  const pageData = data?.data;
  const shops = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  return (
    <div>
      {isLoading && <Loading/>}
      <Title title="Quản lý cửa hàng" isDivide={true}/>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField
            value={keyword}
            onChange={(e) => setKeyword(e)}
            placeholder="Tìm kiếm theo tên cửa hàng, địa chỉ..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentPage(0);
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
            value={status}
            onChange={(value) => {
              setStatus(value);
              setCurrentPage(0);
            }}
            options={statusOptions}
            placeholder="Chọn trạng thái"
          />
        </div>

        <Button
          onClick={handleAddShop}
          color={ColorButton.SUCCESS}
          startIcon={<AddRoundedIcon/>}
        >
          Thêm cửa hàng
        </Button>
      </div>

      {/* Search Result Info */}
      {(keyword || status) && (
        <div
          className="mb-4 flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200">
          <SearchRoundedIcon className="text-primary-c700"/>
          <span>
            Tìm thấy <strong className="text-primary-c800">{pageData?.totalElements || 0}</strong> cửa hàng
            {keyword && <> với từ khóa &ldquo;<strong className="text-primary-c800">{keyword}</strong>&rdquo;</>}
            {status && <> - Trạng thái: <strong
                className="text-primary-c800">{statusOptions.find(o => o.id === status)?.label}</strong></>}
          </span>
          <button
            onClick={handleClearSearch}
            className="ml-auto text-primary-c700 hover:text-primary-c900 underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Table */}
      <Table<Shop>
        columns={columns}
        data={shops}
        keyExtractor={(row) => row.shopId}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage={
          keyword || status
            ? "Không tìm thấy cửa hàng phù hợp. Thử thay đổi từ khóa hoặc bộ lọc."
            : "Không có cửa hàng nào"
        }
      />

      {/* Create Shop Modal */}
      {isCreateModalOpen &&
          <CreateShopModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              reload={mutate}
          />}

      {/* Update Status Shop Modal */}
      {isUpdateStatusOpen && selectedShop && (
        <UpdateStatusShopModal
          isOpen={isUpdateStatusOpen}
          setIsOpen={setIsUpdateStatusOpen}
          reload={mutate}
          shopId={selectedShop.shopId}
          currentStatus={selectedShop.shopStatus}
          shopName={selectedShop.shopName}
        />
      )}

      {/* Update Shop Modal */}
      {isEditModalOpen && selectedShop && (
        <UpdateShopModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedShop(null);
          }}
          reload={mutate}
          shopData={{
            shopId: selectedShop.shopId,
            shopName: selectedShop.shopName,
            description: selectedShop.description,
            logoUrl: selectedShop.logoUrl,
            bannerUrl: selectedShop.bannerUrl,
            province: selectedShop.province,
            ward: selectedShop.ward,
            detail: selectedShop.detail,
            phoneNumber: selectedShop.phoneNumber,
          }}
        />
      )}
    </div>
  );
}
