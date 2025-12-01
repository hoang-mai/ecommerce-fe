import Modal from "@/libs/Modal";
import {AccountStatus} from "@/types/enum";
import useSWRMutation from "swr/mutation";
import {AUTH} from "@/services/api";
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import {useDispatch} from "react-redux";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";
import Loading from "@/components/modals/Loading";

interface ReqUpdateAccountStatusDTO {
  accountStatus: AccountStatus;
}

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reload: () => void;
  userId: number;
  currentStatus: AccountStatus;
}

export default function ChangeAccountStatusModal({
                                                   isOpen,
                                                   setIsOpen,
                                                   reload,
                                                   userId,
                                                   currentStatus,
                                                 }: Props) {
  const { patch } = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: ReqUpdateAccountStatusDTO }) =>
    patch<BaseResponse<never>>(url, arg).then(res => res.data);
  const dispatch = useDispatch();

  const {trigger, isMutating} = useSWRMutation(
    `${AUTH}/${userId}`,
    fetcher,
    {
      revalidate: false,
    }
  );

  const newStatus = currentStatus === AccountStatus.ACTIVE
    ? AccountStatus.SUSPENDED
    : AccountStatus.ACTIVE;

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
        return "Đình chỉ";
      default:
        return "Chưa xác định";
    }
  }

  const handleUpdateStatus = () => {
    trigger({accountStatus: newStatus})
      .then(() => {
        setIsOpen(false);
        reload();
        const alert: AlertState = {
          isOpen: true,
          title: "Đổi trạng thái thành công",
          message: `Trạng thái đã được chuyển sang ${getLabelStatusColor(newStatus)}`,
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
          Bạn có chắc chắn muốn đổi trạng thái của tài khoản này?
        </p>

        <div className="bg-grey-c50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-grey-c700">Trạng thái hiện tại:</span>
            <Chip
              label={getLabelStatusColor(currentStatus)}
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
              label={getLabelStatusColor(newStatus)}
              variant={ChipVariant.SOFT}
              color={getStatusColor(newStatus)}
            />
          </div>
        </div>

        <p className="text-sm text-grey-c600 italic">
          * Hành động này sẽ thay đổi trạng thái của danh mục ngay lập tức.
        </p>
      </div>
    </Modal>
  );
}
