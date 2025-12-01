import Modal from "@/libs/Modal";
import Table, {Column} from "@/libs/Table";
import {useCallback, useEffect, useState} from "react";
import useSWR from "swr";
import {USER_VERIFICATION} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {AlertType, UserVerificationStatus, UserVerificationStatusLabel} from "@/types/enum";
import {formatDateTime} from "@/util/FnCommon";
import DropdownSelect from "@/libs/DropdownSelect";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";
import Image from "next/image";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import TextField from "@/libs/TextField";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {useDebounce} from "@/hooks/useDebounce";
import ImagePreview from "@/libs/ImagePreview";
import DetailRegisterOwnerModal from "@/components/admin/register-owners/DetailRegisterOwnerModal";
import { useBuildUrl } from "@/hooks/useBuildUrl";

interface ResUserVerificationDTO {
  userVerificationId: number;
  userId: number;
  userName: string;
  userEmail: string;
  verificationCode: string;
  frontImageUrl: string;
  backImageUrl: string;
  avatarUrl: string;
  accountNumber: string;
  bankName: string;
  userVerificationStatus: UserVerificationStatus;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}

type Props = {
  isOpen: boolean;
  setIsOpen: () => void;
};

const statusOptions: Option[] = [
  {id: "", label: "Tất cả trạng thái"},
  {id: UserVerificationStatus.PENDING, label: UserVerificationStatusLabel[UserVerificationStatus.PENDING]},
  {id: UserVerificationStatus.APPROVED, label: UserVerificationStatusLabel[UserVerificationStatus.APPROVED]},
  {id: UserVerificationStatus.REJECTED, label: UserVerificationStatusLabel[UserVerificationStatus.REJECTED]},
];

export default function HistoryRegisterOwnerModal({isOpen, setIsOpen}: Props) {
  const { get } = useAxiosContext();
  const fetcher = (url: string) => get<BaseResponse<PageResponse<ResUserVerificationDTO>>>(url).then(res => res.data);

  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ResUserVerificationDTO | null>(null);
  const debouncedKeyword = useDebounce(keyword, 500);

  const url = useBuildUrl({
    baseUrl: USER_VERIFICATION,
    queryParams: {
      pageNo,
      pageSize,
      sortBy: sortBy || undefined,
      sortDir: sortBy ? sortDir : undefined,
      keyword: debouncedKeyword || undefined,
      status: status || undefined,
    }
  });

  const {data, error, isLoading, mutate} = useSWR(url, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if(error){
      const alert : AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  },[dispatch, error]);

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
      className: "w-16",
      render: (row) => (
        <span className="text-sm text-grey-c900">
          {row.userVerificationId}
        </span>
      )
    },
    {
      key: "verificationCode",
      label: "Số CCCD",
      sortable: true,
      className: "w-32",
      render: (row) => (
        <span className="text-sm font-semibold text-grey-c900">
          {highlightText(row.verificationCode, keyword)}
        </span>
      )
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
      render: (row) => (
        <div>
          <div className="font-semibold text-sm text-grey-c900">
            {highlightText(row.bankName, keyword)}
          </div>
          <div className="text-sm text-grey-c700">
            {highlightText(row.accountNumber, keyword)}
          </div>
        </div>
      ),
    },
    {
      key: "userVerificationStatus",
      label: "Trạng thái",
      sortable: true,
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
      className: "w-40",
    },
    {
      key: "rejectionReason",
      label: "Lý do từ chối",
      render: (row) => (
        <div className="max-w-[200px]">
          <span className="text-sm text-grey-c700 block truncate" title={row.rejectReason || undefined}>
            {row.rejectReason || <span className="text-grey-c400">-</span>}
          </span>
        </div>
      ),
      className: "w-48",
    },
    {
      key: "actions",
      label: "Hành động",
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
        </div>
      ),
      className: "w-24 text-center",
    },
  ];

  const pageData = data?.data;
  const verifications = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={setIsOpen}
        title="Lịch sử đăng ký người bán"
        maxWidth="6xl"
        showSaveButton={false}
      >
        {isLoading && <Loading/>}
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[300px] relative">
              <TextField
                value={keyword}
                onChange={(e) => setKeyword(e)}
                placeholder="Tìm kiếm theo CCCD, tên ngân hàng, số tài khoản..."
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
            <div className="flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200">
              <SearchRoundedIcon className="text-primary-c700"/>
              <span>
                Tìm thấy <strong className="text-primary-c800">{pageData?.totalElements || 0}</strong> bản ghi
                {keyword && <> với từ khóa &ldquo;<strong className="text-primary-c800">{keyword}</strong>&rdquo;</>}
                {status && <> - Trạng thái: <strong className="text-primary-c800">{statusOptions.find(o => o.id === status)?.label}</strong></>}
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
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            currentPage={pageNo}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
            emptyMessage={
              keyword || status
                ? "Không tìm thấy bản ghi phù hợp. Thử thay đổi từ khóa hoặc bộ lọc."
                : "Không có lịch sử đăng ký"
            }
          />
        </div>
      </Modal>

      {/* Image Preview */}
      <ImagePreview
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="CCCD"
      />

      {/* Detail Register Owner Modal */}
      {selectedData && (
        <DetailRegisterOwnerModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          data={selectedData}
          reload={mutate}
        />
      )}
    </>
  );
}
