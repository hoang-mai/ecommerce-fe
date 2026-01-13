"use client";
import React from "react";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {AlertType} from "@/types/enum";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import Table, {Column} from "@/libs/Table";
import {useEffect, useState} from "react";
import {FlashSale} from "@/types/interface";
import {FLASH_SALE_CAMPAIGN} from "@/services/api";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {formatDateTime} from "@/util/fnCommon";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useRouter } from "next/navigation";
const dateNow= new Date().toISOString();
export default function TodayFlashSale() {
  const {get} = useAxiosContext();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const router = useRouter();
  const url = useBuildUrl({
    baseUrl: `${FLASH_SALE_CAMPAIGN}/by-date`,
    queryParams:{
      pageNo: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDir: sortDir,
      date: dateNow,
    }
  })
  const fetchTodayFlashSales = (url: string) =>
    get<BaseResponse<PageResponse<FlashSale>>>(url).then(res => res.data.data);

  const {
    data: todayData,
    error: todayError,
    isLoading: todayLoading,
  } = useSWR(url, fetchTodayFlashSales);

  useEffect(() => {
    if (todayError) {
      const alert: AlertState = {
        isOpen: true,
        message: todayError.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, todayError]);

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
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c800">
          {row.flashSaleCampaignId}
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
          <VisibilityRoundedIcon/>
        </button>
      ),
    },
  ];

  return (
    <div className="mt-4">
      {todayLoading && <Loading/>}
      <Table
        columns={flashSaleColumns}
        data={todayData?.data || []}
        keyExtractor={(row) => row.flashSaleCampaignId}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={todayData?.totalPages || 1}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage="Không có Flash Sale nào hôm nay"
      />
    </div>
  );
}

