import Modal from "@/libs/Modal";
import useSWRMutation from "swr/mutation";
import {ADDRESS} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType} from "@/type/enum";
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
}

export default function DeleteAddressModal({isOpen, setIsOpen, mutate, addressData}: Props) {
  const dispatch = useDispatch();
  const { del } = useAxiosContext();
  const fetcher = (url: string) => del<BaseResponse<undefined>>(url).then(res => res.data);
  const {trigger, isMutating} = useSWRMutation(`${ADDRESS}/${addressData.addressId}`, fetcher, {
    revalidate: false,
  });
  const {getProvinceName, getWardName} = useAddressMapping();

  const handleDelete = () => {
    trigger().then(res => {
      const alertState: AlertState = {
        isOpen: true,
        title: 'Thành công',
        message: res.message,
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alertState));
      mutate();
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
      title="Xác nhận xóa địa chỉ"
      onSave={handleDelete}
      saveButtonText="Xóa"
      cancelButtonText="Hủy"
      isLoading={isMutating}
      maxWidth="md"
    >
      {isMutating && <Loading/>}
      <div className="space-y-4">
        <p className="text-grey-c700">
          Bạn có chắc chắn muốn xóa địa chỉ này không?
        </p>

        <div className="bg-grey-c50 rounded-lg p-4 space-y-2">
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

        <p className="text-support-c700 text-sm">
          <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
        </p>
      </div>
    </Modal>
  );
}
