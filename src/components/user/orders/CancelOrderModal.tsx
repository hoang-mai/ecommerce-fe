import React from "react";
import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import {AlertType} from "@/types/enum";
import {z} from "zod";
import {useForm, Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import {PAYMENT} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";

type ActionType = "CANCELLED" | "RETURNED";

interface CancelOrderModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  orderId: string;
  mutate: () => void;
  actionType?: ActionType;
}

const createSchema = (actionType: ActionType) => z.object({
  reason: z.string()
    .min(10, actionType === "CANCELLED" ? "Lý do hủy phải có ít nhất 10 ký tự" : "Lý do trả hàng phải có ít nhất 10 ký tự")
    .max(500, actionType === "CANCELLED" ? "Lý do hủy tối đa 500 ký tự" : "Lý do trả hàng tối đa 500 ký tự"),
});

type CancelOrderFormData = z.infer<ReturnType<typeof createSchema>>;

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  setIsOpen,
  orderId,
  mutate,
  actionType = "CANCELLED"
}) => {
  const isReturn = actionType === "RETURNED";
  const {patch} = useAxiosContext();
  const fetcherCancelOrder = (url: string, {arg}: { arg: { orderId: string, reason: string, paymentStatus: string } }) =>
    patch<BaseResponse<unknown>>(`${url}/${arg.orderId}`, {reason :arg.reason,paymentStatus: arg.paymentStatus}).then(res => res.data);

  const {trigger: triggerCancelOrder, isMutating} = useSWRMutation(PAYMENT, fetcherCancelOrder, {
    revalidate: false
  });
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: {errors,isDirty},
  } = useForm<CancelOrderFormData>({
    resolver: zodResolver(createSchema(actionType)),
    defaultValues: {
      reason: "",
    },
  });


  const onSubmit = (data: CancelOrderFormData) => {

    triggerCancelOrder({orderId, reason: data.reason, paymentStatus:"CANCELLED"=== actionType ? "CANCELLED" : "REFUNDED"}).then(() => {
      const alert: AlertState = {
        isOpen: true,
        message: isReturn ? "Yêu cầu trả hàng đã được gửi" : "Hủy đơn hàng thành công",
        type: AlertType.SUCCESS,
        title: "Thành công",
      };
      dispatch(openAlert(alert));
      setIsOpen(false);
      mutate();
    }).catch((error : ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: AlertType.ERROR,
        title: isReturn ? "Yêu cầu trả hàng thất bại" : "Hủy đơn hàng thất bại",
      };
      dispatch(openAlert(alert));
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={isReturn ? "Bạn có chắc chắn muốn trả hàng đơn này?" : "Bạn có chắc chắn muốn hủy đơn hàng này?"}
      onSave={handleSubmit(onSubmit)}
      isLoading={isMutating}
      saveButtonText={isReturn ? "Xác nhận trả hàng" : "Xác nhận hủy"}
      disableSave={!isDirty}
    >
      {isMutating && <Loading/>}
          <div className="mb-2">
            <Controller
              name="reason"
              control={control}
              render={({field}) => (
                <TextField
                  {...field}
                  label={isReturn ? "Lý do trả hàng" : "Lý do hủy đơn hàng"}
                  required={true}
                  placeholder={isReturn ? "Vui lòng nhập lý do trả hàng (ít nhất 10 ký tự)..." : "Vui lòng nhập lý do hủy đơn hàng (ít nhất 10 ký tự)..."}
                  typeTextField="textarea"
                  rows={4}
                  error={errors.reason?.message}
                  disabled={isMutating}
                  maxLength={500}
                />
              )}
            />
          </div>
      <div className="">
        <p className="text-sm text-support-c900 bg-support-c200 p-3 rounded-lg border border-support-c300">
          {isReturn
            ? "Lưu ý: Sau khi gửi yêu cầu trả hàng, shop sẽ xem xét và phản hồi trong thời gian sớm nhất."
            : "Lưu ý: Sau khi hủy đơn hàng, bạn sẽ không thể khôi phục lại."
          }
        </p>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;

