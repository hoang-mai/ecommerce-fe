"use client";
import Modal from "@/libs/Modal";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import TimePicker from "@/libs/TimePicker";
import {FLASH_SALE_CAMPAIGN_SCHEDULE} from "@/services/api";
const createScheduleSchema = z.object({
  startTime: z.string().min(1, "Giờ bắt đầu không được để trống"),
  endTime: z.string().min(1, "Giờ kết thúc không được để trống"),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "Giờ kết thúc phải sau giờ bắt đầu",
  path: ["endTime"],
});

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateScheduleModal({
                                              isOpen,
                                              onClose,
                                              onSuccess,
                                            }: CreateScheduleModalProps) {
  const dispatch = useDispatch();
  const {post} = useAxiosContext();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<CreateScheduleFormData>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  const createSchedule = (url: string, {arg}: { arg: CreateScheduleFormData }) => post<BaseResponse<unknown>>(url, {
      startTime: arg.startTime + ":00",
      endTime: arg.endTime + ":00",
    },{isToken: true});


  const {trigger, isMutating} = useSWRMutation(FLASH_SALE_CAMPAIGN_SCHEDULE, createSchedule);

  const onSubmit = (data: CreateScheduleFormData) => {
    trigger(data).then(() => {
      const alert: AlertState = {
        isOpen: true,
        message: "Tạo lịch Flash Sale thành công",
        type: AlertType.SUCCESS,
        title: "Thành công",
      };
      dispatch(openAlert(alert));
      onSuccess();
      onClose();
    }).catch((error: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra khi tạo lịch",
        type: AlertType.ERROR,
        title: "Lỗi",
      };
      dispatch(openAlert(alert));
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo lịch Flash Sale mới"
      onSave={handleSubmit(onSubmit)}
      saveButtonText="Tạo lịch"
      cancelButtonText="Hủy"
      isLoading={isMutating}
      maxWidth="md"
    >
      {isMutating && <Loading/>}
      <div className="flex flex-col gap-6">
        <p className="text-grey-c700 text-sm">
          Tạo khung giờ cho Flash Sale. Flash Sale sẽ diễn ra hàng ngày trong khung giờ này.
        </p>

        {/* Start Time */}
        <Controller
          name="startTime"
          control={control}
          render={({field}) => (
            <TimePicker
              label="Giờ bắt đầu"
              placeholder="Chọn giờ bắt đầu"
              value={field.value}
              onChange={field.onChange}
              error={errors.startTime?.message}
              required
            />
          )}
        />

        {/* End Time */}
        <Controller
          name="endTime"
          control={control}
          render={({field}) => (
            <TimePicker
              label="Giờ kết thúc"
              placeholder="Chọn giờ kết thúc"
              value={field.value}
              onChange={field.onChange}
              error={errors.endTime?.message}
              required
            />
          )}
        />
      </div>
    </Modal>
  );
}