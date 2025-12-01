import Modal from "@/libs/Modal";
import useSWRMutation from "swr/mutation";
import {ADDRESS} from "@/services/api";
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType} from "@/types/enum";
import Loading from "@/components/modals/Loading";
import {useAddressMapping} from "@/hooks/useAddressMapping";

interface AddressData {
  addressId: number;
  userId: number;
  receiverName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

type Props = {
  isOpen: boolean;
  setIsOpen: () => void;
  mutate: () => void;
  addressData: AddressData;
  mutateParent?: () => void;
}

export default function SetDefaultAddressModal({isOpen, setIsOpen, mutate, addressData,mutateParent}: Props) {
  const dispatch = useDispatch();
  const { patch } = useAxiosContext();
  const fetcher = (url: string) => patch<BaseResponse<undefined>>(url).then(res => res.data);
  const {trigger, isMutating} = useSWRMutation(`${ADDRESS}/${addressData.addressId}/default`, fetcher, {
    revalidate: false,
  });

  const handleSetDefault = () => {
    trigger().then(res => {
      const alertState: AlertState = {
        isOpen: true,
        title: 'Thành công',
        message: res.message,
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alertState));
      mutate();
      if (mutateParent) {
        mutateParent();
      }
      setIsOpen();
    }).catch((err: ErrorResponse) => {
      const alertState: AlertState = {
        isOpen: true,
        title: 'Thất bại',
        message: err.message,
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alertState));
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={setIsOpen}
      title="Đặt làm địa chỉ mặc định"
      onSave={handleSetDefault}
      saveButtonText="Xác nhận"
      cancelButtonText="Hủy"
      isLoading={isMutating}
      maxWidth="md"
    >
      {isMutating && <Loading/>}
      <div className="space-y-4">
        <p className="text-grey-c700">
          Bạn có chắc chắn muốn đặt địa chỉ này làm địa chỉ mặc định không?
        </p>

        <div className="bg-primary-c50 border border-primary-c300 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-grey-c800 min-w-[120px]">Người nhận:</span>
            <span className="text-grey-c700">{addressData.receiverName}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-grey-c800 min-w-[120px]">Số điện thoại:</span>
            <span className="text-grey-c700">{addressData.phoneNumber}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-grey-c800 min-w-[120px]">Địa chỉ:</span>
            <span className="text-grey-c700">{addressData.detail}</span>
          </div>
        </div>

        <p className="text-primary-c700 text-sm">
          <strong>Lưu ý:</strong> Địa chỉ mặc định hiện tại sẽ được thay thế bởi địa chỉ này.
        </p>
      </div>
    </Modal>
  );
}
