import Modal from "@/libs/Modal";
import InputImage from "@/libs/InputImage";
import TextField from "@/libs/TextField";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {USER_VERIFICATION} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import useSWRMutation from "swr/mutation";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType} from "@/types/enum";
import Loading from "@/components/modals/Loading";

const registerOwnerSchema = z.object({
  verificationCode: z.string().min(1, "Số căn cước công dân là bắt buộc"),
  frontImage: z.instanceof(File)
    .refine((file) => !!file, "Ảnh mặt trước CCCD là bắt buộc")
    .refine((file) => file && file.size <= 3 * 1024 * 1024, "Kích thước ảnh phải nhỏ hơn 3MB")
    .refine((file) => file && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP"),
  backImage: z.instanceof(File)
    .refine((file) => !!file, "Ảnh mặt sau CCCD là bắt buộc")
    .refine((file) => file && file.size <= 3 * 1024 * 1024, "Kích thước ảnh phải nhỏ hơn 3MB")
    .refine((file) => file && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP"),
  avatar: z.instanceof(File)
    .refine((file) => !!file, "Ảnh đại diện là bắt buộc")
    .refine((file) => file && file.size <= 3 * 1024 * 1024, "Kích thước ảnh phải nhỏ hơn 3MB")
    .refine((file) => file && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP"),
  accountNumber: z.string().min(1, "Số tài khoản là bắt buộc").regex(/^\d+$/, "Số tài khoản chỉ chứa chữ số"),
  bankName: z.string().min(1, "Tên ngân hàng là bắt buộc"),
});

type RegisterOwnerFormData = z.infer<typeof registerOwnerSchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: () => void;
  reload: () => void;
}

export default function RegisterOwnerModal({isOpen, setIsOpen,reload}: Props) {
  const { post } = useAxiosContext();
  const registerOwnerFetcher = (url: string, {arg}: { arg: RegisterOwnerFormData }) => {
    const formData = new FormData();

    formData.append('frontImage', arg.frontImage);
    formData.append('backImage', arg.backImage);
    formData.append('avatar', arg.avatar);

    const dataBlob = new Blob([JSON.stringify({
      verificationCode: arg.verificationCode,
      accountNumber: arg.accountNumber,
      bankName: arg.bankName
    })], { type: 'application/json' });

    formData.append('data', dataBlob);

    return post<BaseResponse<void>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  };

  const {trigger, isMutating} = useSWRMutation(USER_VERIFICATION, registerOwnerFetcher);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<RegisterOwnerFormData>({
    resolver: zodResolver(registerOwnerSchema),
    mode: "onChange",
    defaultValues: {
      verificationCode: "",
      frontImage: undefined,
      backImage: undefined,
      avatar: undefined,
      accountNumber: "",
      bankName: "",
    },
  });

  const onSubmit = (data: RegisterOwnerFormData) => {
    trigger(data).then(response => {
      const alert: AlertState = {
        isOpen: true,
        title: "Thành công",
        message: response.message || "Đăng ký làm người bán thành công",
        type: AlertType.SUCCESS,
      };
      dispatch(openAlert(alert));
      reload();
      setIsOpen();
    }).catch((error: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Lỗi",
        message: error.message || "Không thể đăng ký làm người bán",
        type: AlertType.ERROR,
      };
      dispatch(openAlert(alert));
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={setIsOpen}
      title={"Đăng ký làm người bán"}
      showSaveButton={true}
      onSave={handleSubmit(onSubmit)}
      maxWidth="3xl"
      isLoading={isMutating}
    >
      {isMutating && <Loading/>}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CCCD */}
          <Controller
            control={control}
            name="verificationCode"
            render={({field}) => (
              <TextField
                label="Mã số căn cước công dân"
                placeholder="Nhập mã số căn cước công dân"
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.verificationCode?.message}
              />
            )}
          />
          {/* Thông tin ngân hàng */}

          <Controller
            control={control}
            name="accountNumber"
            render={({field}) => (
              <TextField
                label="Số tài khoản"
                placeholder="Nhập số tài khoản ngân hàng"
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.accountNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="bankName"
            render={({field}) => (
              <TextField
                label="Tên ngân hàng"
                placeholder="Nhập tên ngân hàng"
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.bankName?.message}
              />
            )}
          />
        </div>
        {/* Ảnh đại diện */}
        <Controller
          control={control}
          name="avatar"
          render={({field}) => (
            <InputImage
              label="Ảnh đại diện"
              value={field.value}
              onChange={field.onChange}
              required
              maxSize={3}
              error={errors.avatar?.message}
            />
          )}
        />

        {/* Ảnh CCCD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            control={control}
            name="frontImage"
            render={({field}) => (
              <InputImage
                label="Ảnh mặt trước CCCD"
                value={field.value}
                onChange={field.onChange}
                required
                maxSize={3}
                error={errors.frontImage?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="backImage"
            render={({field}) => (
              <InputImage
                label="Ảnh mặt sau CCCD"
                value={field.value}
                onChange={field.onChange}
                required
                maxSize={3}
                error={errors.backImage?.message}
              />
            )}
          />
        </div>


      </div>
    </Modal>
  );
}