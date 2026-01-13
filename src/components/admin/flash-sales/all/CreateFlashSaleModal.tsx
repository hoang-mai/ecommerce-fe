"use client";
import React from "react";
import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import DateTimePicker from "@/libs/DateTimePicker";
import {FLASH_SALE_CAMPAIGN} from "@/services/api";

const createFlashSaleSchema = z.object({
  campaignName: z.string().min(1, "Tên chiến dịch không được để trống"),
  description: z.string().optional(),
  startTime: z.date({
    message: "Thời gian bắt đầu không được để trống",
  }),
  endTime: z.date({
    message: "Thời gian kết thúc không được để trống",
  }),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu",
  path: ["endTime"],
}).refine((data) => {
  if (data.startTime) {
    return data.startTime > new Date();
  }
  return true;
}, {
  message: "Thời gian bắt đầu phải sau thời điểm hiện tại",
  path: ["startTime"],
});

export type CreateFlashSaleFormData = z.infer<typeof createFlashSaleSchema>;

interface CreateFlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


export default function CreateFlashSaleModal({
                                               isOpen,
                                               onClose,
                                               onSuccess,
                                             }: CreateFlashSaleModalProps) {
  const dispatch = useDispatch();
  const {post} = useAxiosContext();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<CreateFlashSaleFormData>({
    resolver: zodResolver(createFlashSaleSchema),
    defaultValues: {
      campaignName: "",
      description: "",
      startTime: undefined,
      endTime: undefined,
    },
  });

  const createFlashSale = (url: string, {arg}: { arg: CreateFlashSaleFormData }) => post<BaseResponse<unknown>>(url, {
      campaignName: arg.campaignName,
      description: arg.description || null,
      startTime: arg.startTime,
      endTime: arg.endTime,
    },{isToken: true});

  const {trigger, isMutating} = useSWRMutation(FLASH_SALE_CAMPAIGN, createFlashSale);

  const onSubmit = (data: CreateFlashSaleFormData) => {
    trigger(data).then(() => {
      const alert: AlertState = {
        isOpen: true,
        message: "Tạo Flash Sale thành công",
        type: AlertType.SUCCESS,
        title: "Thành công",
      };
      dispatch(openAlert(alert));
      onSuccess();
      onClose();
    }).catch((error: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra khi tạo Flash Sale",
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
      title="Tạo Flash Sale mới"
      onSave={handleSubmit(onSubmit)}
      saveButtonText="Tạo Flash Sale"
      cancelButtonText="Hủy"
      isLoading={isMutating}
      maxWidth="lg"
    >
      {isMutating && <Loading/>}
      <div className="flex flex-col gap-6">
        {/* Campaign Name */}
        <Controller
          name="campaignName"
          control={control}
          render={({field}) => (
            <TextField
              label="Tên chiến dịch"
              placeholder="Nhập tên chiến dịch Flash Sale"
              value={field.value}
              onChange={field.onChange}
              error={errors.campaignName?.message}
              required
            />
          )}
        />



        <div className={"flex flex-row gap-2"}>{/* Start Time */}
          <Controller
            name="startTime"
            control={control}
            render={({field}) => (
              <DateTimePicker
                label="Thời gian bắt đầu"
                placeholder="Chọn thời gian bắt đầu"
                value={field.value || null}
                onChange={field.onChange}
                error={errors.startTime?.message}
                required
                minDate={new Date()}
              />
            )}
          />

          {/* End Time */}
          <Controller
            name="endTime"
            control={control}
            render={({field}) => (
              <DateTimePicker
                label="Thời gian kết thúc"
                placeholder="Chọn thời gian kết thúc"
                value={field.value || null}
                onChange={field.onChange}
                error={errors.endTime?.message}
                required
                minDate={new Date()}
              />
            )}
          /></div>
        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({field}) => (
            <TextField
              label="Mô tả"
              placeholder="Nhập mô tả cho Flash Sale (tùy chọn)"
              value={field.value || ""}
              onChange={field.onChange}
              typeTextField="textarea"
              rows={3}
            />
          )}
        />
      </div>
    </Modal>
  );
}

