"use client";
import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {AlertType, ColorButton} from "@/type/enum";
import Loading from "@/components/modals/Loading";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import useSWRMutation from "swr/mutation";
import {USER_VERIFICATION} from "@/services/api";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";

const rejectReasonSchema = z.object({
  reason: z.string()
    .min(1, "Vui lòng nhập lý do từ chối")
    .min(10, "Lý do từ chối phải có ít nhất 10 ký tự")
    .max(500, "Lý do từ chối không được vượt quá 500 ký tự"),
});

type RejectReasonFormData = z.infer<typeof rejectReasonSchema>;

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userVerificationId: number;
  reload: () => void;
  onParentClose: () => void;
}

export default function RejectReasonModal({
                                            isOpen,
                                            onClose,
                                            userName,
                                            reload,
                                            userVerificationId,
                                            onParentClose,
                                          }: RejectReasonModalProps) {
  const {

    handleSubmit,
    control,
    formState: {errors},
  } = useForm<RejectReasonFormData>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: {
      reason: "",
    },
  });
  const { patch } = useAxiosContext();
  const actualFetcher = (url: string, {arg}: { arg:RejectReasonFormData }) =>
    patch<BaseResponse<void>>(url, arg).then(res => res.data);
  const {trigger: rejectRequest, isMutating: isRejecting} = useSWRMutation(
    `${USER_VERIFICATION}/${userVerificationId}/reject`,
    actualFetcher
  );
  const dispatch = useDispatch();
  const onSubmit = (reason: RejectReasonFormData) => {

    rejectRequest(reason).then(response => {
      const alert: AlertState = {
        isOpen: true,
        title: "Thành công",
        message: response.message || "Đã từ chối yêu cầu thành công",
        type: AlertType.SUCCESS,
      };
      dispatch(openAlert(alert));
      reload();
      onClose();
      onParentClose();
    }).catch((error: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Lỗi",
        message: error.message || "Không thể từ chối yêu cầu",
        type: AlertType.ERROR,
      };
      dispatch(openAlert(alert));
    });
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Từ chối yêu cầu"
      maxWidth="md"
      showSaveButton={true}
      showCancelButton={true}
      saveButtonText="Xác nhận từ chối"
      cancelButtonText="Hủy"
      onSave={handleSubmit(onSubmit)}
      saveButtonColor={ColorButton.ERROR}
      cancelButtonColor={ColorButton.SECONDARY}
      isLoading={isRejecting}
    >
      {isRejecting && <Loading/>}
      <div className="space-y-4">

        <Controller name={"reason"} control={control} render={({field}) => (
          <TextField
            label="Lý do từ chối"
            placeholder="Nhập lý do từ chối yêu cầu..."
            value={field.value}
            onChange={field.onChange}
            typeTextField="textarea"
            rows={4}
            required
            error={errors.reason?.message}
            maxLength={500}
          />)}
        />
        <div className="bg-support-c200 border border-support-c500 p-4 rounded-lg">
          <p className="text-sm text-support-c900">
            Bạn đang từ chối yêu cầu đăng ký làm người bán của <strong>{userName}</strong>.
            Vui lòng nhập lý do từ chối để người dùng có thể biết và cải thiện.
          </p>
        </div>
      </div>
    </Modal>
  );
}
