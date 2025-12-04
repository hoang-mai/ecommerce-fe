'use client';

import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import TextField from "@/libs/TextField";
import {AlertType, Gender, GenderLabel, Role} from "@/types/enum";
import DropdownSelect from "@/libs/DropdownSelect";
import DatePicker from "@/libs/DatePicker";
import Modal from "@/libs/Modal";
import useSWRMutation from "swr/mutation";
import {USER} from "@/services/api";
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {phoneRegex} from "@/util/regex";


const profileSchema = z.object({
  email: z.email('Email không hợp lệ').optional().or(z.literal('')),
  description: z.string().max(500, 'Mô tả không được quá 500 ký tự').optional().or(z.literal('')),
  fullName: z.string()
    .nonempty('Họ và tên không được để trống')
    .min(1, 'Họ và tên phải có từ 1 đến 30 ký tự')
    .max(30, 'Họ và tên phải có từ 1 đến 30 ký tự'),
  phoneNumber: z.string()
    .regex(phoneRegex, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.date()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      return birthDate < new Date();
    }, 'Ngày sinh phải là ngày trong quá khứ'),
  gender: z.enum(Gender).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileData {
  userId: number;
  email: string | null;
  description: string | null;
  fullName: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  role: Role;
  gender: Gender | null;
  isVerification: boolean;
  createdAt: string;
  updatedAt: string;
}
interface Props {
  profileData: ProfileData;
  isOpen: boolean;
  setIsOpen: () => void;
  reload: () => void;
}

export default function UpdateProfileModal({
  profileData,
  isOpen,
  setIsOpen,
  reload,
}: Props) {
  const { patch } = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: ProfileFormData }) => patch<BaseResponse<never>>(url, arg).then(res => res.data);

  const {
    control,
    handleSubmit,
    formState: {errors, isDirty},
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: profileData.email || '',
      description: profileData.description || '',
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber || '',
      dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
      gender: profileData.gender || undefined,
    },
  });

  const { trigger , isMutating } = useSWRMutation(USER, fetcher,{ revalidate: false })
  const dispatch = useDispatch();
  const onSubmit = (data: ProfileFormData) => {
    trigger(data).then(res => {
      const alert : AlertState = {
        isOpen: true,
        title: "Cập nhật thông tin cá nhân",
        message: res.message || "Cập nhật thông tin cá nhân thành công",
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alert));
      setIsOpen();
      reload();
    }).catch((errors: ErrorResponse)=>{
      const alert : AlertState = {
        isOpen: true,
        title: "Cập nhật thông tin cá nhân thất bại",
        message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alert));
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={setIsOpen}
      title={"Chỉnh sửa thông tin cá nhân"}
      onSave={handleSubmit(onSubmit)}
      disableSave={!isDirty}
      isLoading={isMutating}
    >
      {isMutating && <Loading/>}

      {/* Thông tin tài khoản */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-primary-c900">1. Thông tin tài khoản</h3>

        <Controller control={control} name={"email"} render={({field}) =>
          <TextField
            htmlFor={"email"}
            id={"email"}
            label={"Email"}
            placeholder={"Nhập email"}
            disabled={isMutating}
            error={errors.email?.message}
            value={field.value}
            onChange={field.onChange}
          />
        }/>
      </div>

      {/* Thông tin cá nhân */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-primary-c900">2. Thông tin cá nhân</h3>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Controller control={control} name={"fullName"} render={({field}) =>
            <TextField
              htmlFor={"fullName"}
              id={"fullName"}
              label={"Họ và tên"}
              placeholder={"Nhập họ và tên"}
              disabled={isMutating}
              error={errors.fullName?.message}
              required={true}
              value={field.value}
              onChange={field.onChange}
            />
          }/>
          {/* Phone Number */}
          <Controller control={control} name={"phoneNumber"} render={({field}) =>
            <TextField
              htmlFor={"phoneNumber"}
              id={"phoneNumber"}
              label={"Số điện thoại"}
              placeholder={"Nhập số điện thoại"}
              disabled={isMutating}
              error={errors.phoneNumber?.message}
              value={field.value}
              onChange={field.onChange}
            />
          }/>
        </div>

        {/* Gender and Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller control={control} name={"gender"} render={({field}) =>
            <DropdownSelect
              htmlFor={"gender"}
              id={"gender"}
              label={"Giới tính"}
              placeholder={"Chọn giới tính"}
              disabled={isMutating}
              error={errors.gender?.message}
              value={field.value}
              onChange={field.onChange}
              options={[Gender.MALE, Gender.FEMALE, Gender.OTHER].map(gender => ({
                id: gender,
                label: GenderLabel[gender],
              }))}
            />
          }/>

          <Controller control={control} name={"dateOfBirth"} render={({field}) =>
            <DatePicker
              id={"dateOfBirth"}
              htmlFor={"dateOfBirth"}
              label={"Ngày sinh"}
              placeholder={"Chọn ngày sinh"}
              disabled={isMutating}
              error={errors.dateOfBirth?.message}
              value={field.value}
              onChange={field.onChange}
            />
          }/>
        </div>



        {/* Description */}
        <Controller control={control} name={"description"} render={({field}) =>
          <TextField
            htmlFor={"description"}
            id={"description"}
            label={"Mô tả"}
            placeholder={"Giới thiệu về bản thân"}
            disabled={isMutating}
            error={errors.description?.message}
            value={field.value}
            onChange={field.onChange}
            typeTextField="textarea"
            rows={4}
          />
        }/>
      </div>
    </Modal>
  );
}
