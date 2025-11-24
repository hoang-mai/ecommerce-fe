import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState} from "react";
import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import useSWRMutation from "swr/mutation";
import {AUTH} from "@/services/api";
import { AlertType } from "@/enum";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Mật khẩu hiện tại phải có ít nhất 6 ký tự').max(20, 'Mật khẩu hiện tại không được quá 20 ký tự'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').max(20, 'Mật khẩu mới không được quá 20 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự').max(20, 'Xác nhận mật khẩu không được quá 20 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Mật khẩu mới phải khác với mật khẩu hiện tại',
  path: ['newPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export default function ChangePassword({isOpen, setIsOpen}: Props) {
  const { patch } = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: ChangePasswordFormData }) =>
    patch<BaseResponse<never>>(url, arg).then(res => res.data);
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const {trigger, isMutating} = useSWRMutation(AUTH, fetcher);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const onSubmit = (data: ChangePasswordFormData) => {
    trigger(data).then((res) => {
      const alert : AlertState = {
        isOpen: true,
        type: AlertType.SUCCESS,
        message: res.message,
        title:"Đổi mật khẩu thành công"
      }
      dispatch(openAlert(alert));
      setIsOpen(false);
    }).catch((error: ErrorResponse) => {
      const alert : AlertState = {
        isOpen: true,
        type: AlertType.ERROR,
        message: error.message,
        title:"Đổi mật khẩu thất bại"
      }
      dispatch(openAlert(alert));
    })
  }
  return <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={"Đổi mật khẩu"}
                showSaveButton={true}
                isLoading={isMutating}
                onSave={handleSubmit(onSubmit)}
  >

    <div className={"flex flex-col gap-6"}>
      <Controller control={control} name={"currentPassword"} render={({field}) =>
        <div className={"relative"}>
          <TextField htmlFor={"currentPassword"}
                     id={"currentPassword"}
                     label={"Mật khẩu hiện tại"}
                     type={showCurrentPassword ? "text" : "password"}
                     placeholder={"Nhập mật khẩu hiện tại"}
                     error={errors.currentPassword?.message}
                     required={true}
                     value={field.value}
                     onChange={field.onChange}
                     className={"pr-10"}
                     disabled={isMutating}
          />
          {showCurrentPassword ? <VisibilityOffRoundedIcon
            className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
            onClick={() => setShowCurrentPassword(false)}
          /> : <VisibilityRoundedIcon
            className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
            onClick={() => setShowCurrentPassword(true)}
          />}
        </div>
      }/>
      <Controller control={control} name={"newPassword"} render={({field}) =>
        <div className={"relative"}>
          <TextField htmlFor={"newPassword"}
                     id={"newPassword"}
                     label={"Mật khẩu mới"}
                     type={showNewPassword ? "text" : "password"}
                     placeholder={"Nhập mật khẩu mới"}
                     error={errors.newPassword?.message}
                     required={true}
                     value={field.value}
                     onChange={field.onChange}
                     className={"pr-10"}
                     disabled={isMutating}
          />
          {showNewPassword ? <VisibilityOffRoundedIcon
            className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
            onClick={() => setShowNewPassword(false)}
          /> : <VisibilityRoundedIcon
            className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
            onClick={() => setShowNewPassword(true)}
          />}
        </div>
      }/>
      <Controller control={control} name={"confirmPassword"} render={({field}) =>
        <div className={"relative"}>
          <TextField htmlFor={"confirmPassword"}
                     id={"confirmPassword"}
                     label={"Xác nhận mật khẩu mới"}
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder={"Nhập lại mật khẩu mới"}
                     error={errors.confirmPassword?.message}
                     required={true}
                     value={field.value}
                     onChange={field.onChange}
                     className={"pr-10"}
                     disabled={isMutating}
          />
          {showConfirmPassword ? <VisibilityOffRoundedIcon
            className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
            onClick={() => setShowConfirmPassword(false)}
          /> : <VisibilityRoundedIcon
            className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
            onClick={() => setShowConfirmPassword(true)}
          />}
        </div>
      }/>
    </div>
  </Modal>;
}