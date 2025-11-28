import Modal from "@/libs/Modal";
import {ProductStatus} from "@/type/enum";
import useSWRMutation from "swr/mutation";
import {PRODUCT} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import {AlertType} from "@/type/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Chip, {ChipColor, ChipSize, ChipVariant} from "@/libs/Chip";
import Loading from "@/components/modals/Loading";

interface ReqUpdateProductStatusDTO {
  productStatus: ProductStatus;
}

type Props = {
  isOpen: boolean;
  setIsOpen: () => void;
  reload: () => void;
  productId: string;
  currentStatus: ProductStatus;
  productName: string;
}

export default function UpdateStatusProductModal({
  isOpen,
  setIsOpen,
  reload,
  productId,
  currentStatus,
  productName
}: Props) {
  const dispatch = useDispatch();
  const { patch } = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: ReqUpdateProductStatusDTO }) =>
    patch<BaseResponse<never>>(url, arg).then(res => res.data);

  const {trigger, isMutating} = useSWRMutation(
    `${PRODUCT}/${productId}/product-status`,
    fetcher,
    {
      revalidate: false,
    }
  );

  const newStatus = currentStatus === ProductStatus.ACTIVE
    ? ProductStatus.INACTIVE
    : ProductStatus.ACTIVE;

  const getStatusLabel = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return "Đang bán";
      case ProductStatus.INACTIVE:
        return "Ngừng bán";
      default:
        return status;
    }
  };

  const getStatusColor = (status: ProductStatus): ChipColor => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ProductStatus.INACTIVE:
        return ChipColor.SECONDARY;
      default:
        return ChipColor.SECONDARY;
    }
  };

  const handleUpdateStatus = () => {
    trigger({ productStatus: newStatus })
      .then(() => {
        setIsOpen();
        reload();
        const alert: AlertState = {
          isOpen: true,
          title: "Đổi trạng thái thành công",
          message: `Trạng thái sản phẩm đã được chuyển sang ${getStatusLabel(newStatus)}`,
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
      onClose={setIsOpen}
      title="Xác nhận đổi trạng thái sản phẩm"
      onSave={handleUpdateStatus}
      saveButtonText="Xác nhận"
      cancelButtonText="Hủy"
      maxWidth="md"
      isLoading={isMutating}
    >
      {isMutating && <Loading/>}
      <div className="space-y-4">
        <p className="text-grey-c700">
          Bạn có chắc chắn muốn đổi trạng thái của sản phẩm <strong className="text-grey-c900">{productName}</strong>?
        </p>

        <div className="bg-grey-c50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-grey-c700">Trạng thái hiện tại:</span>
            <Chip
              label={getStatusLabel(currentStatus)}
              variant={ChipVariant.SOFT}
              color={getStatusColor(currentStatus)}
              size={ChipSize.MEDIUM}
            />
          </div>

          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-grey-c400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-grey-c700">Trạng thái mới:</span>
            <Chip
              label={getStatusLabel(newStatus)}
              variant={ChipVariant.SOFT}
              color={getStatusColor(newStatus)}
              size={ChipSize.MEDIUM}
            />
          </div>
        </div>

        <p className="text-sm text-grey-c600 italic">
          * Hành động này sẽ thay đổi trạng thái của sản phẩm ngay lập tức.
        </p>
      </div>
    </Modal>
  );
}
