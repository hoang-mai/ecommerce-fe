"use client";
import React, { useEffect, useState, useCallback } from "react";
import DropdownSelect from "@/libs/DropdownSelect";
import TextField from "@/libs/TextField";
import Table, { Column } from "@/libs/Table";
import { AccountStatus, AlertType, Role } from "@/types/enum";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Title from "@/libs/Title";
import { formatDateTime } from "@/util/fnCommon";
import useSWR from "swr";
import { USER_VIEW } from "@/services/api";
import { useAxiosContext } from "@/components/provider/AxiosProvider";
import Chip, { ChipColor, ChipVariant } from "@/libs/Chip";
import { useDebounce } from "@/hooks/useDebounce";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ChangeCircleRoundedIcon from "@mui/icons-material/ChangeCircleRounded";
import Image from "next/image";
import ChangeAccountStatusModal from "@/components/admin/users/ChangeAccountStatusModal";
import DetailUserModal from "@/components/admin/users/DetailUserModal";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

interface UserViewDto {
  userId: number;
  username: string;
  email: string | null;
  accountStatus: AccountStatus;
  fullName: string;
  phoneNumber: string | null;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Main() {
  const { get } = useAxiosContext();
  const fetcher = (url: string) => get<BaseResponse<PageResponse<UserViewDto>>>(url).then(res => res.data);
  const [status, setStatus] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<UserViewDto | null>(null);
  const debouncedKeyword = useDebounce(keyword, 500);
  const url = useBuildUrl({
    baseUrl: USER_VIEW,
    queryParams: {
      pageNo,
      pageSize,
      sortBy: sortBy || undefined,
      sortDir: sortDir || undefined,
      keyword: debouncedKeyword || undefined,
      accountStatus: status || undefined,
    }
  });

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
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


  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.INACTIVE:
        return ChipColor.WARNING;
      case AccountStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case AccountStatus.SUSPENDED:
        return ChipColor.ERROR;
      default:
        return ChipColor.INFO;
    }
  };

  const getLabelStatusColor = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.INACTIVE:
        return "Vô hiệu hóa";
      case AccountStatus.ACTIVE:
        return "Hoạt động";
      case AccountStatus.SUSPENDED:
        return "Cấm hoạt động";
      default:
        return "Chưa xác định";
    }
  }

  const statusOptions = [
    { id: AccountStatus.ACTIVE, label: "Hoạt động" },
    { id: AccountStatus.INACTIVE, label: "Vô hiệu hóa" },
    { id: AccountStatus.SUSPENDED, label: "Cấm hoạt động" },
  ];

  const getLabelRole = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "Quản trị viên";
      case Role.OWNER:
        return "Chủ cửa hàng";
      case Role.USER:
        return "Người dùng";
      case Role.EMPLOYEE:
        return "Nhân viên";
      default:
        return "Chưa xác định";
    }
  }

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
    setPageNo(0);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("desc");
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

  const columns: Column<UserViewDto>[] = [
    {
      key: "userId",
      label: "STT",
      sortable: true,
      render: (row, index) => (
        <span className="text-sm text-grey-c700 font-semibold">
          {pageNo * parseInt(pageSize) + index + 1}
        </span>
      ),
    },
    {
      key: "username",
      label: "Người dùng",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-semibold text-grey-c900">
              {highlightText(row.username, keyword)}
            </div>
            <div className="text-xs text-grey-c600">
              {row.email && highlightText(row.email, keyword)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "fullName",
      label: "Họ và tên",
      sortable: true,
      render: (row) => (
        <div className={"flex items-center flex-row gap-2"}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-c200 bg-white flex-shrink-0 flex items-center justify-center">
            {row?.avatarUrl
              ? <Image
                width={40}
                height={40}
                src={row?.avatarUrl}
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover"
              />
              : <AccountCircleRoundedIcon className="text-primary-c700 !w-[40px] !h-[40px]" />
            }
          </div>
          <div className="text-sm font-semibold text-grey-c900">
            {highlightText(row.fullName, keyword)}
          </div>
        </div>

      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => (
        <Chip
          label={getLabelStatusColor(row.accountStatus)}
          variant={ChipVariant.SOFT}
          color={getStatusColor(row.accountStatus)}
        />
      ),
    },
    {
      key: "phoneNumber",
      label: "Số điện thoại",
      render: (row) => (
        <div className="text-sm text-grey-c700">
          {row.phoneNumber ? highlightText(row.phoneNumber, keyword) : "-"}
        </div>
      ),
    },
    {
      key: "role",
      label: "Vai trò",
      render: (row) => (
        <div className="text-sm text-grey-c700 capitalize">
          {getLabelRole(row.role)}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (row) => (
        <div className="text-sm text-grey-c700">
          {formatDateTime(row.createdAt)}
        </div>
      )
    },
    {
      key: "actions",
      label: "Hành động",
      className: "text-center",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedData(row);
              setIsDetailModalOpen(true);
            }}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon />
          </button>
          <button
            className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Đổi trang thái"
            onClick={() => {
              setSelectedData(row);
              setIsChangeStatusModalOpen(true);
            }}
          >
            <ChangeCircleRoundedIcon />
          </button>

        </div>
      ),
    },
  ];

  const pageData = data?.data;
  const verifications = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  return (
    <div>
      {isLoading && <Loading />}
      <Title title={"Tài khoản"} isDivide={true} />

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField
            value={keyword}
            onChange={(e) => setKeyword(e)}
            placeholder="Tìm kiếm theo tên, email..."
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
              <ClearRoundedIcon className="text-grey-c600 text-xl" />
            </button>
          )}
        </div>

        <div className="min-w-[200px]">
          <DropdownSelect
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPageNo(0);
            }}
            options={statusOptions}
            placeholder="Chọn trạng thái"
          />
        </div>
      </div>

      {/* Search Summary */}
      {(keyword || status) && (
        <div
          className="mb-4 flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200">
          <SearchRoundedIcon className="text-primary-c700" />
          <span>
            Tìm thấy <strong className="text-primary-c800">{pageData?.totalElements || 0}</strong> yêu cầu
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
      <Table
        columns={columns}
        data={verifications}
        keyExtractor={(row) => row.userId}
        sortDir={sortDir}
        sortBy={sortBy}
        onSort={handleSort}
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage={
          keyword || status
            ? "Không tìm thấy dữ liệu phù hợp. Thử thay đổi từ khóa hoặc bộ lọc."
            : "Không có dữ liệu"
        }
      />
      {isChangeStatusModalOpen && selectedData && (
        <ChangeAccountStatusModal
          isOpen={isChangeStatusModalOpen}
          setIsOpen={setIsChangeStatusModalOpen}
          reload={mutate}
          userId={selectedData.userId}
          currentStatus={selectedData.accountStatus}
        />
      )}
      {isDetailModalOpen && selectedData && (
        <DetailUserModal
          isOpen={isDetailModalOpen}
          setIsOpen={setIsDetailModalOpen}
          user={selectedData} />
      )}

    </div>
  );
}