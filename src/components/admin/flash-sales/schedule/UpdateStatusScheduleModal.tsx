import Modal from "@/libs/Modal";
import {FlashSaleScheduleStatus} from "@/types/enum";
import useSWRMutation from "swr/mutation";
import {FLASH_SALE_CAMPAIGN_SCHEDULE} from "@/services/api";
import {useDispatch} from "react-redux";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";
import Loading from "@/components/modals/Loading";
import {useAxiosContext} from "@/components/provider/AxiosProvider";

interface ReqUpdateScheduleStatusDTO {
  flashSaleCampaignScheduleStatus: FlashSaleScheduleStatus;
}

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reload: () => void;
  scheduleId: string;
  currentStatus: FlashSaleScheduleStatus;
  startTime: string;
  endTime: string;
}

export default function UpdateStatusScheduleModal({
  isOpen,
  setIsOpen,
  reload,
  scheduleId,
  currentStatus,
  startTime,
  endTime
}: Props) {
  const {patch} = useAxiosContext();
  const dispatch = useDispatch();
  const fetcher = (url: string, {arg}: { arg: ReqUpdateScheduleStatusDTO }) =>
    patch<BaseResponse<never>>(url, arg,{isToken:true}).then(res => res.data);

  const {trigger, isMutating} = useSWRMutation(
    `${FLASH_SALE_CAMPAIGN_SCHEDULE}/${scheduleId}/status`,
    fetcher,
  );

  const newStatus = currentStatus === FlashSaleScheduleStatus.ACTIVE
    ? FlashSaleScheduleStatus.INACTIVE
    : FlashSaleScheduleStatus.ACTIVE;

  const getStatusLabel = (status: FlashSaleScheduleStatus) => {
    switch (status) {
      case FlashSaleScheduleStatus.ACTIVE:
        return "Hoạt động";
      case FlashSaleScheduleStatus.INACTIVE:
        return "Không hoạt động";
      default:
        return status;
    }
  };

  const getStatusColor = (status: FlashSaleScheduleStatus) => {
    switch (status) {
      case FlashSaleScheduleStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case FlashSaleScheduleStatus.INACTIVE:
        return ChipColor.ERROR;
      default:
        return ChipColor.SUCCESS;
    }
  };

  const handleUpdateStatus = () => {
    trigger({flashSaleCampaignScheduleStatus: newStatus})
      .then(() => {
        setIsOpen(false);
        reload();
        const alert: AlertState = {
          isOpen: true,
          title: "Đổi trạng thái thành công",
          message: `Trạng thái lịch Flash Sale đã được chuyển sang ${getStatusLabel(newStatus)}`,
          type: AlertType.SUCCESS,
        };
        dispatch(openAlert(alert));
      })
      .catch((errors: ErrorResponse) => {
        const alert: AlertState = {
          isOpen: true,
          title: "Đổi trạng thái thất bại",
          message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
          type: AlertType.ERROR,
        };
        dispatch(openAlert(alert));
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Xác nhận đổi trạng thái"
      onSave={handleUpdateStatus}
      saveButtonText="Xác nhận"
      cancelButtonText="Hủy"
      maxWidth="md"
      isLoading={isMutating}
    >
      {isMutating && <Loading/>}
      <div className="space-y-4">
        <p className="text-grey-c700">
          Bạn có chắc chắn muốn đổi trạng thái của lịch Flash Sale{" "}
          <strong className="text-grey-c900">{startTime} - {endTime}</strong>?
        </p>

        <div className="bg-grey-c50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-grey-c700">Trạng thái hiện tại:</span>
            <Chip
              label={getStatusLabel(currentStatus)}
              variant={ChipVariant.SOFT}
              color={getStatusColor(currentStatus)}
            />
          </div>

          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-grey-c400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-grey-c700">Trạng thái mới:</span>
            <Chip
              label={getStatusLabel(newStatus)}
              variant={ChipVariant.SOFT}
              color={getStatusColor(newStatus)}
            />
          </div>
        </div>

        <p className="text-sm text-grey-c600 italic">
          * Hành động này sẽ thay đổi trạng thái của lịch Flash Sale ngay lập tức.
        </p>
      </div>
    </Modal>
  );
}

