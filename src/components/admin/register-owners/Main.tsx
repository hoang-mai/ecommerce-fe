"use client";
import {useCallback, useEffect, useState} from "react";
import DropdownSelect from "@/libs/DropdownSelect";
import TextField from "@/libs/TextField";
import Table, {Column} from "@/libs/Table";
import {AlertType, UserVerificationStatus, UserVerificationStatusLabel} from "@/enum";
import DetailRegisterOwnerModal from "./DetailRegisterOwnerModal";
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import Title from "@/libs/Title";
import {formatDateTime} from "@/util/FnCommon";
import useSWR from "swr";
import {USER_VERIFICATION} from "@/services/api";
import {get, patch} from "@/services/axios";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";
import {useDebounce} from "@/hooks/useDebounce";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import Image from "next/image";
import ImagePreview from "@/libs/ImagePreview";
import useSWRMutation from "swr/mutation";
import RejectReasonModal from "./RejectReasonModal";

interface ResUserVerificationDTO {
  userVerificationId: number;
  verificationCode: string;
  avatarUrl: string;
  accountNumber: string;
  bankName: string;
  frontImageUrl: string;
  backImageUrl: string;
  rejectReason: string | null;
  userVerificationStatus: UserVerificationStatus;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => get<BaseResponse<PageResponse<ResUserVerificationDTO>>>(url).then(res => res.data);

export default function Main() {
  const [status, setStatus] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ResUserVerificationDTO | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [selectedRejectName, setSelectedRejectName] = useState<string>("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const debouncedKeyword = useDebounce(keyword, 500);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("pageNo", pageNo.toString());
    params.append("pageSize", pageSize);
    params.append("sortBy", sortBy);
    params.append("sortDir", sortDir);
    if (debouncedKeyword) params.append("keyword", debouncedKeyword);
    if (status) params.append("status", status);
    return `${USER_VERIFICATION}/search?${params.toString()}`;
  }, [pageNo, pageSize, sortBy, sortDir, debouncedKeyword, status]);

  const {data, error, isLoading, mutate} = useSWR(buildUrl(), fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const dispatch = useDispatch();

  const approveFetcher = (url: string) => patch<BaseResponse<void>>(url).then(res => res.data);

  const {trigger: approveRequest, isMutating: isApproving} = useSWRMutation(
    approvingId ? `${USER_VERIFICATION}/${approvingId}/approve` : null,
    approveFetcher
  );

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

  const statusOptions: Option[] = [
    {id: "", label: "Tất cả trạng thái"},
    {id: UserVerificationStatus.PENDING, label: UserVerificationStatusLabel[UserVerificationStatus.PENDING]},
    {id: UserVerificationStatus.APPROVED, label: UserVerificationStatusLabel[UserVerificationStatus.APPROVED]},
    {id: UserVerificationStatus.REJECTED, label: UserVerificationStatusLabel[UserVerificationStatus.REJECTED]},
  ];

  const getStatusColor = (status: UserVerificationStatus) => {
    switch (status) {
      case UserVerificationStatus.PENDING:
        return ChipColor.WARNING;
      case UserVerificationStatus.APPROVED:
        return ChipColor.SUCCESS;
      case UserVerificationStatus.REJECTED:
        return ChipColor.ERROR;
      default:
        return ChipColor.INFO;
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
    setPageNo(0);
  };

  const handleApprove = (id: number) => {
    setApprovingId(id);
   
  };
  useEffect(() => {
    if(approvingId === null) return;
    approveRequest().then(response => {
      const alert: AlertState = {
        isOpen: true,
        title: "Thành công",
        message: response.message || "Đã duyệt yêu cầu thành công",
        type: AlertType.SUCCESS,
      };
      dispatch(openAlert(alert));
      mutate();
    }).catch((error: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Lỗi",
        message: error.message || "Không thể duyệt yêu cầu",
        type: AlertType.ERROR,
      };
      dispatch(openAlert(alert));
    }).finally(() => {
      setApprovingId(null);
    });
  }, [approveRequest, approvingId, dispatch, mutate]);

  const handleReject = (id: number, userName: string) => {
    setSelectedRejectId(id);
    setSelectedRejectName(userName);
    setIsRejectModalOpen(true);
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

  const columns: Column<ResUserVerificationDTO>[] = [
    {
      key: "userVerificationId",
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-grey-c700 font-semibold">
          {row.userVerificationId}
        </span>
      ),
    },
    {
      key: "userName",
      label: "Người dùng",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-c200">
            <Image
              src={row.avatarUrl}
              alt={row.userName}
              onClick={() => setSelectedImage(row.avatarUrl)}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-grey-c900">
              {highlightText(row.userName, keyword)}
            </div>
            <div className="text-xs text-grey-c600">
              {highlightText(row.userEmail, keyword)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "verificationCode",
      label: "Mã CCCD",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold text-grey-c900">
          {highlightText(row.verificationCode, keyword)}
        </span>
      ),
    },
    {
      key: "frontImageUrl",
      label: "Ảnh CCCD",
      render: (row) => (
        <div className="flex gap-2">
          <Image
            src={row.frontImageUrl}
            alt="CCCD trước"
            width={80}
            height={50}
            className="rounded cursor-pointer hover:opacity-80 object-cover"
            style={{width: '80px', height: '50px', minWidth: '80px'}}
            onClick={() => setSelectedImage(row.frontImageUrl)}
          />
          <Image
            src={row.backImageUrl}
            alt="CCCD sau"
            width={80}
            height={50}
            className="rounded cursor-pointer hover:opacity-80 object-cover"
            style={{width: '80px', height: '50px', minWidth: '80px'}}
            onClick={() => setSelectedImage(row.backImageUrl)}
          />
        </div>
      ),
      className: "min-w-[180px]",
    },
    {
      key: "bankName",
      label: "Ngân hàng",
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-sm font-semibold text-grey-c900">
            {highlightText(row.bankName, keyword)}
          </div>
          <div className="text-xs font-mono text-grey-c600">
            {highlightText(row.accountNumber, keyword)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => (
        <Chip
          label={UserVerificationStatusLabel[row.userVerificationStatus]}
          variant={ChipVariant.SOFT}
          color={getStatusColor(row.userVerificationStatus)}
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedData(row);
              setIsDetailModalOpen(true);
            }}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon/>
          </button>
          {row.userVerificationStatus === UserVerificationStatus.PENDING && (
            <>
              <button
                onClick={() => handleApprove(row.userVerificationId)}
                className="cursor-pointer p-2 text-success-c800 hover:bg-success-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                title="Duyệt"
              >
                <CheckCircleRoundedIcon/>
              </button>
              <button
                onClick={() => handleReject(row.userVerificationId, row.userName)}
                className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                title="Từ chối"
              >
                <CancelRoundedIcon/>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const pageData = data?.data;
  const verifications = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  return (
    <div>
      {isLoading || isApproving && <Loading/>}
      <Title title={"Đăng ký người bán"} isDivide={true}/>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField
            value={keyword}
            onChange={(e) => setKeyword(e)}
            placeholder="Tìm kiếm theo tên, email, CCCD, ngân hàng..."
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
          <SearchRoundedIcon className="text-primary-c700"/>
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
        keyExtractor={(row) => row.userVerificationId}
        sortDir={sortDir}
        onSort={handleSort}
        sortBy={sortBy}
        currentPage={pageNo}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage={
          keyword || status
            ? "Không tìm thấy yêu cầu phù hợp. Thử thay đổi từ khóa hoặc bộ lọc."
            : "Không có yêu cầu nào"
        }
      />

      {/* Image Preview */}
      <ImagePreview
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="CCCD"
      />

      {/* Detail Modal */}
      {isDetailModalOpen && selectedData && (
        <DetailRegisterOwnerModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          data={selectedData}
          reload={mutate}
        />
      )}

      {/* Reject Reason Modal */}
      {selectedRejectId && (
        <RejectReasonModal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setSelectedRejectId(null);
            setSelectedRejectName("");
          }}
          userName={selectedRejectName}
          userVerificationId={selectedRejectId}
          reload={mutate}
          onParentClose={() => {}}
        />
      )}
    </div>
  );
}