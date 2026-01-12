"use client";
import React, {useState} from "react";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {AlertType, ColorButton, FlashSaleScheduleStatus} from "@/types/enum";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import Table, {Column} from "@/libs/Table";
import Chip, {ChipColor, ChipSize} from "@/libs/Chip";
import Button from "@/libs/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {useEffect} from "react";
import CreateScheduleModal from "@/components/admin/flash-sales/schedule/CreateScheduleModal";
import UpdateStatusScheduleModal from "@/components/admin/flash-sales/schedule/UpdateStatusScheduleModal";
import ChangeCircleRoundedIcon from '@mui/icons-material/ChangeCircleRounded';
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {FLASH_SALE_CAMPAIGN_SCHEDULE} from "@/services/api";
import DropdownSelect from "@/libs/DropdownSelect";
import {formatDateTime} from "@/util/fnCommon";
import {FlashSaleSchedule} from "@/types/interface";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DetailScheduleModal from "@/components/admin/flash-sales/schedule/DetailScheduleModal";

export default function ScheduleFlashSale() {
  const {get} = useAxiosContext();
  const dispatch = useDispatch();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<FlashSaleSchedule | null>(null);
  const [isDetailScheduleOpen, setIsDetailScheduleOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState<string>("");

  const statusOptions: Option[] = [
    {id: "", label: "Tất cả trạng thái"},
    {id: FlashSaleScheduleStatus.ACTIVE, label: "Hoạt động"},
    {id: FlashSaleScheduleStatus.INACTIVE, label: "Không hoạt động"},
  ];
  const url = useBuildUrl({
    baseUrl: FLASH_SALE_CAMPAIGN_SCHEDULE,
    queryParams: {
      pageNo: currentPage,
      pageSize: pageSize,
      sortBy: sortBy,
      sortDir: sortDir,
      status: status || undefined,
    }
  })
  const fetchSchedules = (url: string) =>
    get<BaseResponse<PageResponse<FlashSaleSchedule>>>(url,{isToken: true}).then(res => res.data.data);

  const {
    data: scheduleData,
    error: scheduleError,
    isLoading: scheduleLoading,
    mutate: mutateScheduleData
  } = useSWR(url, fetchSchedules);

  useEffect(() => {
    if (scheduleError) {
      const alert: AlertState = {
        isOpen: true,
        message: scheduleError.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, scheduleError]);

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

  const handleScheduleCreated = () => {
    mutateScheduleData();
  };

  const handleUpdateStatus = (schedule: FlashSaleSchedule) => {
    setSelectedSchedule(schedule);
    setIsUpdateStatusOpen(true);
  };

  const scheduleColumns: Column<FlashSaleSchedule>[] = [
    {
      key: "flashSaleCampaignScheduleId",
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-grey-c900">{row.flashSaleCampaignScheduleId}</span>
      ),
    },
    {
      key: "startTime",
      label: "Giờ bắt đầu",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-primary-c900">{row.startTime}</span>
      ),
    },
    {
      key: "endTime",
      label: "Giờ kết thúc",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-support-c900">{row.endTime}</span>
      ),
    },
    {
      key: "flashSaleCampaignScheduleStatus",
      label: "Trạng thái",
      sortable: true,
      render: (row) => (
        <Chip
          label={row.flashSaleCampaignScheduleStatus === FlashSaleScheduleStatus.ACTIVE ? "Hoạt động" : "Không hoạt động"}
          color={row.flashSaleCampaignScheduleStatus === FlashSaleScheduleStatus.ACTIVE ? ChipColor.SUCCESS : ChipColor.ERROR}
          size={ChipSize.SMALL}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c700">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Cập nhật gần nhất",
      sortable: true,
      render: (row) => (
        <span className="text-grey-c700">
          {formatDateTime(row.updatedAt)}
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
              setSelectedSchedule(row);
              setIsDetailScheduleOpen(true);
            }}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon/>
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
    }
  ];

  return (
    <div className="mt-4">
      {scheduleLoading && <Loading/>}
      <div className="flex items-center justify-end mb-4 gap-4">
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
          onClick={() => setIsScheduleModalOpen(true)}
          color={ColorButton.SUCCESS}
          startIcon={<AddRoundedIcon/>}
        >
          Tạo lịch mới
        </Button>
      </div>
      <Table
        columns={scheduleColumns}
        data={scheduleData?.data || []}
        keyExtractor={(row) => row.flashSaleCampaignScheduleId}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={scheduleData?.totalPages || 1}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
        emptyMessage="Chưa có lịch Flash Sale nào"
      />

      {/* Create Schedule Modal */}
      {isScheduleModalOpen && (
        <CreateScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={handleScheduleCreated}
        />
      )}

      {/* Update Status Modal */}
      {isUpdateStatusOpen && selectedSchedule && (
        <UpdateStatusScheduleModal
          isOpen={isUpdateStatusOpen}
          setIsOpen={setIsUpdateStatusOpen}
          scheduleId={selectedSchedule.flashSaleCampaignScheduleId}
          currentStatus={selectedSchedule.flashSaleCampaignScheduleStatus as FlashSaleScheduleStatus}
          startTime={selectedSchedule.startTime}
          endTime={selectedSchedule.endTime}
          reload={mutateScheduleData}
        />
      )}
      {
        isDetailScheduleOpen && selectedSchedule && (
          <DetailScheduleModal
            isOpen={isDetailScheduleOpen}
            onClose={() => setIsDetailScheduleOpen(false)}
            schedule={selectedSchedule}
          />
        )
      }
    </div>
  );
}

