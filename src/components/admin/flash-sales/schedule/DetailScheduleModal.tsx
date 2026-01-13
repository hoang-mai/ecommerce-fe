"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/libs/Modal";
import { FlashSale, FlashSaleSchedule } from "@/types/interface";
import useSWR from "swr";
import { useAxiosContext } from "@/components/provider/AxiosProvider";
import { FLASH_SALE_CAMPAIGN } from "@/services/api";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import { useDispatch } from "react-redux";
import { openAlert } from "@/redux/slice/alertSlice";
import { AlertType } from "@/types/enum";
import Loading from "@/components/modals/Loading";
import Table, { Column } from "@/libs/Table";
import { formatDateTime } from "@/util/fnCommon";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useRouter } from "next/navigation";

interface DetailScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: FlashSaleSchedule;
}

export default function DetailScheduleModal({
  isOpen,
  onClose,
  schedule,
}: DetailScheduleModalProps) {
  const { get } = useAxiosContext();
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const url = useBuildUrl({
    baseUrl: `${FLASH_SALE_CAMPAIGN}`,
    queryParams: {
      pageNo: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDir: sortDir,
      scheduleId: schedule.flashSaleCampaignScheduleId,
    }
  });

  const fetchFlashSales = (url: string) =>
    get<BaseResponse<PageResponse<FlashSale>>>(url).then(res => res.data.data);

  const {
    data: flashSaleData,
    error: flashSaleError,
    isLoading: flashSaleLoading,
  } = useSWR(url, fetchFlashSales);

  useEffect(() => {
    if (flashSaleError) {
      const alert: AlertState = {
        isOpen: true,
        message: flashSaleError.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, flashSaleError]);

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
      key: "countRegisteredProducts",
      label: "Số sản phẩm đăng ký",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {row.countRegisteredProducts}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => {
            router.push(`/admin/flash-sales/${row.flashSaleCampaignId}`);
          }}
          className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
          title="Xem chi tiết"
        >
          <VisibilityRoundedIcon />
        </button>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Danh sách Flash Sale trong lịch"
      maxWidth="6xl"
      showSaveButton={false}
    >
      {flashSaleLoading && <Loading />}

      <div className="flex flex-col gap-6">
        {/* Schedule Information */}

        <div>
          <Table
            columns={flashSaleColumns}
            data={flashSaleData?.data || []}
            keyExtractor={(row) => row.flashSaleCampaignId}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={flashSaleData?.totalPages || 1}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
            emptyMessage="Chưa có chiến dịch Flash Sale nào trong lịch này"
          />
        </div>
      </div>
    </Modal>
  );
}
