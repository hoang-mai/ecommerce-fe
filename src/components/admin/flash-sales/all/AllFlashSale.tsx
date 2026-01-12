"use client";
import React, {useState} from "react";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {AlertType, ColorButton} from "@/types/enum";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import Table, {Column} from "@/libs/Table";
import Button from "@/libs/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {useEffect} from "react";
import CreateFlashSaleModal from "@/components/admin/flash-sales/all/CreateFlashSaleModal";
import {FlashSale} from "@/types/interface";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {FLASH_SALE_CAMPAIGN} from "@/services/api";
import {formatDateTime} from "@/util/fnCommon";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useRouter } from "next/navigation";

export default function AllFlashSale() {
  const {get} = useAxiosContext();
  const dispatch = useDispatch();
  const [isFlashSaleModalOpen, setIsFlashSaleModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const router = useRouter();
  const url = useBuildUrl({
    baseUrl: FLASH_SALE_CAMPAIGN,
    queryParams:{
      pageNo: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDir: sortDir,
    }
  })

  const fetchAllFlashSales = (url: string) =>
    get<BaseResponse<PageResponse<FlashSale>>>(url,{isToken: true}).then(res => res.data.data);

  const {
    data: allData,
    error: allError,
    isLoading: allLoading,
    mutate: mutateAllData
  } = useSWR(url,
    fetchAllFlashSales,
  );

  useEffect(() => {
    if (allError) {
      const alert: AlertState = {
        isOpen: true,
        message: allError.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, allError]);

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

  const handleFlashSaleCreated = () => {
    mutateAllData();
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
      {allLoading && <Loading/>}
      <div className="flex items-center justify-end mb-4">
        <Button
          onClick={() => setIsFlashSaleModalOpen(true)}
          color={ColorButton.SUCCESS}
          startIcon={<AddRoundedIcon/>}
        >
          Tạo Flash Sale mới
        </Button>
      </div>
      <Table
        columns={flashSaleColumns}
        data={allData?.data || []}
        keyExtractor={(row) => row.flashSaleCampaignId}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={allData?.totalPages || 1}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage="Chưa có Flash Sale nào"
      />

      {/* Create Flash Sale Modal */}
      {isFlashSaleModalOpen && (
        <CreateFlashSaleModal
          isOpen={isFlashSaleModalOpen}
          onClose={() => setIsFlashSaleModalOpen(false)}
          onSuccess={handleFlashSaleCreated}
        />
      )}
    </div>
  );
}

