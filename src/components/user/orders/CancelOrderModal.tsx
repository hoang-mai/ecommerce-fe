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

interface CancelOrderModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  orderId: string;
  mutate: () => void;
}

const CancelOrderSchema = z.object({
  reason: z.string().min(10, "Lý do hủy phải có ít nhất 10 ký tự").max(500, "Lý do hủy tối đa 500 ký tự"),
});

type CancelOrderFormData = z.infer<typeof CancelOrderSchema>;

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  setIsOpen,
  orderId,
  mutate
}) => {
  const {patch} = useAxiosContext();
  const fetcherCancelOrder = (url: string, {arg}: { arg: { orderId: string, reason: string } }) =>
    patch<BaseResponse<unknown>>(`${url}/${arg.orderId}`, arg.reason).then(res => res.data);

  const {trigger: triggerCancelOrder, isMutating} = useSWRMutation(`${PAYMENT}/refund`, fetcherCancelOrder, {
    revalidate: false
  });
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: {errors,isDirty},
  } = useForm<CancelOrderFormData>({
    resolver: zodResolver(CancelOrderSchema),
    defaultValues: {
      reason: "",
    },
  });


  const onSubmit = (data: CancelOrderFormData) => {

    triggerCancelOrder({orderId, reason: data.reason}).then(() => {

      const alert: AlertState = {
        isOpen: true,
        message: "Hủy đơn hàng thành công",
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
        title: "Hủy đơn hàng thất bại",
      };
      dispatch(openAlert(alert));
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Bạn có chắc chắn muốn hủy đơn hàng này?"
      onSave={handleSubmit(onSubmit)}
      isLoading={isMutating}
      saveButtonText="Xác nhận hủy"
      disableSave={!isDirty}
    >
          <div className="mb-2">
            <Controller
              name="reason"
              control={control}
              render={({field}) => (
                <TextField
                  {...field}
                  label="Lý do hủy đơn hàng"
                  required={true}
                  placeholder="Vui lòng nhập lý do hủy đơn hàng (ít nhất 10 ký tự)..."
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
          Lưu ý: Sau khi hủy đơn hàng, bạn sẽ không thể khôi phục lại.
        </p>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;

