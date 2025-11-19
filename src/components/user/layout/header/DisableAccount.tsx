import {patch, post} from "@/services/axios";
import {AccountStatus, AlertType} from "@/enum";
import Modal from "@/libs/Modal";
import useSWRMutation from "swr/mutation";
import {AUTH, LOGOUT} from "@/services/api";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {useRouter} from "next/navigation";
import {clearAllLocalStorage} from "@/services/localStorage";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const fetcher = (url: string) => patch<BaseResponse<never>>(url, {accountStatus: AccountStatus.INACTIVE}).then(res => res.data);
const fetcherLogout = (url: string) => post<BaseResponse<never>>(url, {}, {withCredentials: true}).then(res => res.data);

export default function DisableAccount({isOpen, setIsOpen}: Props) {
  const router = useRouter();
  const {trigger, isMutating} = useSWRMutation(AUTH, fetcher);
  const {trigger: triggerLogout} = useSWRMutation(LOGOUT, fetcherLogout);
  const dispatch = useDispatch();
  const onSubmit = () => {
    trigger().then((res) => {
      const alert: AlertState = {
        isOpen: true,
        type: AlertType.SUCCESS,
        message: res.message,
        title: "Vô hiệu hóa tài khoản thành công"
      }
      dispatch(openAlert(alert));
      triggerLogout().finally(() => {
        clearAllLocalStorage();
        router.replace('/login');
      });
    }).catch((error: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        type: AlertType.ERROR,
        message: error.message,
        title: "Vô hiệu hóa tài khoản thất bại"
      }
      dispatch(openAlert(alert));
    })
  }
  return <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={"Vô hiệu hóa tài khoản"}
                onSave={onSubmit}
                isLoading={isMutating}
                showSaveButton={true}
                saveButtonText={"Vô hiệu"}
  >
    <div className="">
      <div className="p-4 ">
        <p className="text-grey-c800 font-bold text-lg">
          Bạn có chắc chắn muốn vô hiệu hóa tài khoản?
        </p>
      </div>
      <div className="flex items-start gap-3 p-4 bg-grey-c50 rounded-lg">
        <svg className="w-5 h-5 text-primary-c600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-grey-c700 text-sm leading-relaxed">
          Vui lòng liên hệ admin để có thể mở lại tài khoản sau khi vô hiệu hóa.
        </p>
      </div>
    </div>
  </Modal>

}