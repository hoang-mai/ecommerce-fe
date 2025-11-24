'use client';

import Modal from "@/libs/Modal";
import {useState} from "react";
import InputImage from "@/libs/InputImage";
import Button from "@/libs/Button";
import {AlertType, ColorButton} from "@/enum";
import Image from "next/image";
import {USER} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import useSWRMutation from "swr/mutation";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {useForm, Controller} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import Loading from "@/components/modals/Loading";

interface UpdateAvatarModalProps {
  isOpen: boolean;
  setIsOpen: () => void;
  currentAvatarUrl?: string | null;
  reload: () => void;
}

const avatarSchema = z.object({
  avatar: z.union([z.instanceof(File), z.string(), z.null()]).optional()
    .refine((file) => {
      if (!file || typeof file === 'string') return true;
      return file.size <= 3 * 1024 * 1024;
    }, "Kích thước avatar phải nhỏ hơn 3MB")
    .refine((file) => {
      if (!file || typeof file === 'string') return true;
      return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    }, "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP"),
});

type AvatarFormData = z.infer<typeof avatarSchema>;

export default function UpdateAvatarModal({
                                            isOpen,
                                            setIsOpen,
                                            currentAvatarUrl,
                                            reload
                                          }: UpdateAvatarModalProps) {
  const { post } = useAxiosContext();
  const uploadAvatarFetcher = (url: string, {arg}: { arg: AvatarFormData }) => {
    const formData = new FormData();

    if (arg.avatar === null) {
      formData.append('isDelete', 'true');
    }


    if (arg.avatar && arg.avatar instanceof File) {
      formData.append('file', arg.avatar);
    }


    return post<BaseResponse<void>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  };

  const {trigger, isMutating} = useSWRMutation(`${USER}/avatar`, uploadAvatarFetcher);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: {errors, isDirty},
  } = useForm<AvatarFormData>({
    resolver: zodResolver(avatarSchema),
    mode: "onChange",
    defaultValues: {
      avatar: currentAvatarUrl || '',
    }
  });

  const onSubmit = (data: AvatarFormData) => {
    trigger(data).then(response => {
      const alert: AlertState = {
        isOpen: true,
        title: "Thành công",
        message: response.message || "Cập nhật ảnh đại diện thành công",
        type: AlertType.SUCCESS,
      };
      dispatch(openAlert(alert));
      reload();
      setIsOpen();
    }).catch((error: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Lỗi",
        message: error.message || "Không thể cập nhật ảnh đại diện",
        type: AlertType.ERROR,
      };
      dispatch(openAlert(alert));
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Cập nhật ảnh đại diện"
      onClose={setIsOpen}
      onSave={handleSubmit(onSubmit)}
      isLoading={isMutating}
      disableSave={!isDirty}
    >
      {isMutating && <Loading/>}
      {/* Content */}
      <div className={``}>

        {/* Upload ảnh mới */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-grey-c800 flex items-center gap-2">
            <div className="w-1 h-5 bg-primary-c700 rounded"></div>
            {currentAvatarUrl ? 'Ảnh mới' : 'Chọn ảnh đại diện'}
          </h3>
          <div className="">
            <Controller
              name="avatar"
              control={control}
              render={({field: {onChange, value}}) => (
                <InputImage
                  label=""
                  value={value}
                  onChange={onChange}
                  preview={true}
                  previewWidth={180}
                  previewHeight={180}
                  maxSize={3}
                  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                  disabled={isMutating}
                  error={errors.avatar?.message}
                />
              )}
            />

            {!errors.avatar && (
              <div className="mt-4 p-3 bg-primary-c50 rounded-lg border border-primary-c200">
                <p className="text-sm text-primary-c800 font-medium">
                  💡 Gợi ý:
                </p>
                <ul className="text-sm text-grey-c700 mt-2 space-y-1 list-disc list-inside">
                  <li>Sử dụng ảnh rõ nét, chân dung chính diện</li>
                  <li>Kích thước đề xuất: 500x500px trở lên</li>
                  <li>Ảnh vuông sẽ hiển thị đẹp nhất</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
