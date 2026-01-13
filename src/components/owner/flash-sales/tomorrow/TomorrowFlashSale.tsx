"use client";
import React from "react";
import useSWR from "swr";
import { useAxiosContext } from "@/components/provider/AxiosProvider";
import { AlertType } from "@/types/enum";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import Table, { Column } from "@/libs/Table";
import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { FlashSale } from "@/types/interface";
import { FLASH_SALE_CAMPAIGN } from "@/services/api";
import { formatDateTime } from "@/util/fnCommon";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';
import RegisterFlashSaleModal from "@/components/owner/flash-sales/tomorrow/RegisterFlashSaleModal";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useRouter } from "next/navigation";
const dateNow = addDays(new Date(), 1).toISOString();
export default function TomorrowFlashSale() {
  const { get } = useAxiosContext();
  const dispatch = useDispatch();
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale>();
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const router = useRouter();
  const fetchTomorrowFlashSales = (url: string) =>
    get<BaseResponse<PageResponse<FlashSale>>>(url, { isToken: true }).then(res => res.data.data);
  const url = useBuildUrl({
    baseUrl: `${FLASH_SALE_CAMPAIGN}/by-date`,
    queryParams: {
      pageNo: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDir: sortDir,
      date: dateNow,
    },
  });
  const {
    data: tomorrowData,
    error: tomorrowError,
    isLoading: tomorrowLoading,
  } = useSWR(
    url,
    fetchTomorrowFlashSales,
    { refreshInterval: 0, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (tomorrowError) {
      const alert: AlertState = {
        isOpen: true,
        message: tomorrowError.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, tomorrowError]);

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



  const flashSaleColumns: Column<FlashSale>[] = [
    {
      key: "flashSaleCampaignId",
      label: "STT",
      sortable: true,
      render: (row, index) => (
        <span className="text-grey-c800">
          {currentPage * parseInt(pageSize) + index + 1}
        </span>
      ),
    },
    {
      key: "campaignName",
      label: "Tên chiến dịch",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary-c900">{row.campaignName}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      render: (row) => (
        <span className="text-grey-c700 line-clamp-2 max-w-xs">
          {row.description || "-"}
        </span>
      ),
    },
    {
      key: "startTime",
      label: "Thời gian bắt đầu",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {formatDateTime(row.startTime)}
        </span>
      ),
    },
    {
      key: "endTime",
      label: "Thời gian kết thúc",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {formatDateTime(row.endTime)}
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
              setSelectedFlashSale(row);
              setIsRegisterOpen(true);
            }}
            className="cursor-pointer p-2 text-success-c800 hover:bg-success-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Đăng ký"
          >
            <ControlPointRoundedIcon />
          </button>
          <button
            onClick={() => {
              router.push(`/owner/flash-sales/${row.flashSaleCampaignId}`);
            }}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-4 ">
      {tomorrowLoading && <Loading />}
      <Table
        columns={flashSaleColumns}
        data={tomorrowData?.data || []}
        keyExtractor={(row) => row.flashSaleCampaignId}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={tomorrowData?.totalPages || 1}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage="Không có Flash Sale nào ngày mai"
      />
      {isRegisterOpen && selectedFlashSale &&
        <RegisterFlashSaleModal
          flashSale={selectedFlashSale}
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      }
    </div>
  );
}

