'use client';

import {useState} from 'react';
import Link from 'next/link';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import CheckBox from "@/libs/CheckBox";
import TextField from "@/libs/TextField";
import Button from "@/libs/Button";
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {LOGIN} from "@/services/api";
import useSWRMutation from "swr/mutation";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useRouter} from "next/navigation";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType, Role} from "@/type/enum";
import {ColorButton} from "@/type/enum";
import {getRoleFromJwtToken} from "@/util/FnCommon";

const loginSchema = z.object({
  username: z.string()
    .min(3, 'Tên đăng nhập phải có ít nhất 6 ký tự')
    .max(20, 'Tên đăng nhập không được quá 20 ký tự')
    .regex(/^[a-zA-Z0-9_@.]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và ký tự đặc biệt _ @ .'),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(20, 'Mật khẩu không được quá 20 ký tự'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  tokenType: string;
  sessionState: string;
  scope: string;
}

export function Main() {
  const { post } = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: LoginFormData }) =>
    post<BaseResponse<LoginResponse>>(url, arg, {withCredentials: true}).then(res => res.data);
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const {trigger, isMutating} = useSWRMutation(LOGIN, fetcher);
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });
  const onSubmit = (data: LoginFormData) => {
    trigger({username: data.username, password: data.password}).then(res => {
      if(res.data) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('expiresIn', String(res.data.expiresIn));
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('refreshExpiresIn', String(res.data.refreshExpiresIn));
        localStorage.setItem('tokenType', res.data.tokenType);
        localStorage.setItem('sessionState', res.data.sessionState);
        localStorage.setItem('scope', res.data.scope);
        window.dispatchEvent(new Event('authChanged'));
        switch (getRoleFromJwtToken(res.data.accessToken)) {
          case Role.ADMIN:
            router.replace('/admin/dashboard');
            break;
          case Role.OWNER:
            router.replace('/owner/dashboard');
            break;
          case Role.EMPLOYEE:
            router.replace('/employee/dashboard');
            break;
          case Role.USER:
            router.replace('/');
            break;
          default:
            router.replace('/');
        }
      }
    }).catch((err: ErrorResponse) => {
      const alertState: AlertState = {
        isOpen: true,
        title: 'Đăng nhập thất bại',
        message: err.message,
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alertState));
    })
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[url('/imageBanner.jpg')] bg-no-repeat bg-cover">
      <div className="w-full max-w-lg">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-black font-bold text-3xl">
              Đăng nhập
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <CheckBox checked={checked}
                        onChange={(checked) => {
                          setChecked(checked);
                        }}
                        label="Ghi nhớ đăng nhập"/>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-c700 hover:text-primary-c800 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isMutating}
              color={ColorButton.PRIMARY}
              fullWidth
              className={"py-3"}
            >
              <LoginRoundedIcon/> Đăng nhập
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                className="text-primary-c700 hover:text-primary-c800 font-medium transition-colors"
              >
                Đăng ký miễn phí
              </Link>
            </p>
          </div>
          {/* Footer Text */}
          <p className="mt-8 text-center text-xs text-gray-500">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
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
