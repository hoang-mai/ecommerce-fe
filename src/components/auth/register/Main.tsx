'use client';

import { useState} from 'react';
import Link from 'next/link';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import TextField from "@/libs/TextField";
import Button from "@/libs/Button";
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import {REGISTER, USER_VIEW} from "@/services/api";
import useSWRMutation from "swr/mutation";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useRouter} from "next/navigation";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType, ColorButton, Gender, GenderLabel} from "@/types/enum";
import DropdownSelect from "@/libs/DropdownSelect";
import {phoneRegex} from "@/util/regex";
import {useAddressMapping} from "@/hooks/useAddressMapping";
import TextSearch from "@/libs/TextSearch";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import useSWR from "swr";
import Loading from "@/components/modals/Loading";


const registerSchema = z.object({
  username: z.string()
    .nonempty('Tên đăng nhập không được để trống')
    .min(3, 'Tên đăng nhập phải có từ 3 đến 20 ký tự')
    .max(20, 'Tên đăng nhập phải có từ 3 đến 20 ký tự')
    .regex(/^[a-zA-Z0-9_@.]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và ký tự đặc biệt _ @ .'),
  password: z.string()
    .nonempty('Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có từ 6 đến 20 ký tự')
    .max(20, 'Mật khẩu phải có từ 6 đến 20 ký tự'),
  fullName: z.string()
    .nonempty('Họ và tên không được để trống')
    .min(1, 'Họ và tên phải có từ 1 đến 30 ký tự')
    .max(30, 'Họ và tên phải có từ 1 đến 30 ký tự'),
  gender: z.enum(Gender).optional(),
  receiverName: z.string()
    .nonempty('Tên người nhận không được để trống'),
  province: z.string()
    .nonempty('Tỉnh/Thành phố không được để trống'),
  ward: z.string()
    .nonempty('Phường/Xã không được để trống'),
  detail: z.string()
    .nonempty('Địa chỉ chi tiết không được để trống'),
  phoneNumber: z.string()
    .nonempty('Số điện thoại không được để trống')
    .regex(phoneRegex, 'Số điện thoại không hợp lệ'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Main() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const router = useRouter();
  const dispatch = useDispatch();
  const {provinceOptions, wardOptions} = useAddressMapping(selectedProvince);
  const {get, post} = useAxiosContext();
  const [keyword, setKeyword] = useState('');
  const url = useBuildUrl({
    baseUrl: `${USER_VIEW}/search-address`,
    queryParams: {
      keyword: keyword
    },
  })
  const fetcherAddressDetail = (url: string) => get<BaseResponse<string[]>>(url).then(res => res.data.data);
  const {data: addressDetails, isLoading} = useSWR(keyword ? url : null, fetcherAddressDetail, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const fetcher = (url: string, {arg}: {
    arg: RegisterFormData
  }) => post<BaseResponse<undefined>>(url, arg).then(res => res.data);
  const {trigger, isMutating} = useSWRMutation(REGISTER, fetcher);
  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      gender: undefined,
      receiverName: '',
      province: '',
      ward: '',
      detail: '',
      phoneNumber: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    trigger(data).then(res => {
      const alertState: AlertState = {
        isOpen: true,
        title: 'Đăng ký thành công',
        message: res.message,
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alertState));
      router.push('/login');
    }).catch((err: ErrorResponse) => {
      console.log(err);
      const alertState: AlertState = {
        isOpen: true,
        title: 'Đăng ký thất bại',
        message: err.message,
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alertState));
    })
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[url('/imageBanner.jpg')] bg-no-repeat bg-cover py-8">
      {isMutating && <Loading/>}
      <div className="w-full max-w-4xl">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-black font-bold text-3xl">
              Đăng ký tài khoản
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Thông tin đăng nhập */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-grey-c800">Thông tin đăng nhập</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username Field */}
                <Controller control={control} name={"username"} render={({field}) =>
                  <TextField htmlFor={"username"}
                             id={"username"}
                             label={"Tên đăng nhập"}
                             placeholder={"Nhập tên đăng nhập"}
                             disabled={isMutating}
                             error={errors.username?.message}
                             required={true}
                             value={field.value}
                             onChange={field.onChange}
                  />
                }/>

                {/* Password Field */}
                <Controller control={control} name={"password"} render={({field}) =>
                  <div className={"relative"}>
                    <TextField htmlFor={"password"}
                               id={"password"}
                               label={"Mật khẩu"}
                               type={showPassword ? "text" : "password"}
                               placeholder={"Nhập mật khẩu"}
                               disabled={isMutating}
                               error={errors.password?.message}
                               required={true}
                               value={field.value}
                               onChange={field.onChange}
                               className={"pr-10"}
                    />
                    {showPassword ? <VisibilityOffRoundedIcon
                      className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
                      onClick={() => setShowPassword(false)}
                    /> : <VisibilityRoundedIcon
                      className="absolute right-5 top-3.5 cursor-pointer text-grey-c600"
                      onClick={() => setShowPassword(true)}
                    />}
                  </div>
                }/>
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-grey-c800">Thông tin cá nhân</h3>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Controller control={control} name={"fullName"} render={({field}) =>
                  <TextField htmlFor={"fullName"}
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
                {/* Gender Field */}
                <Controller control={control} name={"gender"} render={({field}) =>
                  <DropdownSelect htmlFor={"gender"}
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
              </div>


            </div>

            {/* Thông tin địa chỉ */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-grey-c800">Thông tin địa chỉ</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Receiver Name */}
                <Controller control={control} name={"receiverName"} render={({field}) =>
                  <TextField htmlFor={"receiverName"}
                             id={"receiverName"}
                             label={"Tên người nhận"}
                             placeholder={"Nhập tên người nhận"}
                             disabled={isMutating}
                             error={errors.receiverName?.message}
                             required={true}
                             value={field.value}
                             onChange={field.onChange}
                  />
                }/>
                {/* Phone Number */}
                <Controller control={control} name={"phoneNumber"} render={({field}) =>
                  <TextField htmlFor={"phoneNumber"}
                             id={"phoneNumber"}
                             label={"Số điện thoại"}
                             placeholder={"Nhập số điện thoại"}
                             disabled={isMutating}
                             error={errors.phoneNumber?.message}
                             required={true}
                             value={field.value}
                             onChange={field.onChange}
                  />
                }/>
              </div>
              {/* Province and Ward */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller control={control} name={"province"} render={({field}) =>
                  <DropdownSelect htmlFor={"province"}
                                  id={"province"}
                                  label={"Tỉnh/Thành phố"}
                                  placeholder={"Chọn tỉnh/thành phố"}
                                  disabled={isMutating}
                                  error={errors.province?.message}
                                  required={true}
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    setSelectedProvince(value);
                                    setValue('ward', '');
                                  }}
                                  options={provinceOptions}
                                  enableSearch={true}
                                  searchPlaceholder="Tìm tỉnh/thành phố..."
                                  align={"top"}
                  />
                }/>

                <Controller control={control} name={"ward"} render={({field}) =>
                  <DropdownSelect htmlFor={"ward"}
                                  id={"ward"}
                                  placeholder={"Chọn phường/xã"}
                                  disabled={isMutating || !selectedProvince}
                                  error={errors.ward?.message}
                                  required={true}
                                  value={field.value}
                                  onChange={field.onChange}
                                  options={wardOptions}
                                  enableSearch={true}
                                  searchPlaceholder="Tìm phường/xã..."
                                  align={"top"}
                  />
                }/>
              </div>

              {/* Detail Address */}
              <Controller control={control} name={"detail"} render={({field}) => {
                const options: Option[] = addressDetails
                  ? addressDetails.map(address => ({
                    id: address,
                    label: address,
                  }))
                  : [];

                return <TextSearch id={"detail"}
                                   label={"Địa chỉ chi tiết"}
                                   placeholder={"Nhập địa chỉ chi tiết"}
                                   disabled={isMutating}
                                   isLoading={isLoading}
                                   error={errors.detail?.message}
                                   required={true}
                                   value={field.value}
                                   onSelect={field.onChange}
                                   options={options}
                                   onSearch={(value) => setKeyword(value)}
                                   debounceTime={1000}
                />
              }
              }
              />


            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isMutating}
              color={ColorButton.PRIMARY}
              fullWidth
              className={"py-3"}
            >
              <PersonAddRoundedIcon/> Đăng ký
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                href="/login"
                className="text-primary-c700 hover:text-primary-c800 font-medium transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {/* Footer Text */}
          <p className="mt-8 text-center text-xs text-gray-500">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link href="/terms" className="text-primary-c700 hover:text-primary-c800 font-medium hover:underline">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-primary-c700 hover:text-primary-c800 font-medium hover:underline">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
