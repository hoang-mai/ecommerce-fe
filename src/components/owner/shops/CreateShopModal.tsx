"use client";
import {useState} from "react";
import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import InputImage from "@/libs/InputImage";
import DropdownSelect from "@/libs/DropdownSelect";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {SHOP} from "@/services/api";
import {useDispatch} from "react-redux";
import {AlertType} from "@/type/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {useAddressMapping} from "@/hooks/useAddressMapping";
import {phoneRegex} from "@/util/regex";

const createShopSchema = z.object({
  shopName: z.string().min(1, "Tên cửa hàng không được để trống"),
  description: z.string().optional(),
  logoUrl: z.instanceof(File).optional()
    .refine((file) => !file || file.size <= 3 * 1024 * 1024, "Kích thước logo phải nhỏ hơn 3MB")
    .refine((file) => !file || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP"),
  bannerUrl: z.instanceof(File).optional()
    .refine((file) => !file || file.size <= 3 * 1024 * 1024, "Kích thước banner phải nhỏ hơn 3MB")
    .refine((file) => !file || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP"),
  province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
  ward: z.string().min(1, "Phường/Xã không được để trống"),
  detail: z.string().min(1, "Địa chỉ chi tiết không được để trống"),
  phoneNumber: z.string()
    .min(1, "Số điện thoại không được để trống")
    .regex(phoneRegex, "Số điện thoại không đúng định dạng"),
});

export type CreateShopFormData = z.infer<typeof createShopSchema>;

interface CreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  reload: () => void;
}

export default function CreateShopModal({
                                          isOpen,
                                          onClose,
                                          reload,
                                        }: CreateShopModalProps) {
  const { post } = useAxiosContext();

  const fetcher = (url: string, {arg}: { arg: FormData }) =>
    post<BaseResponse<never>>(url, arg, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const dispatch = useDispatch();

  const {provinceOptions, wardOptions} = useAddressMapping(selectedProvince);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<CreateShopFormData>({
    resolver: zodResolver(createShopSchema),
    mode: "onChange",
    defaultValues: {
      shopName: "",
      description: "",
      logoUrl: undefined,
      bannerUrl: undefined,
      province: "",
      ward: "",
      detail: "",
      phoneNumber: "",
    },
  });

  const {trigger, isMutating} = useSWRMutation(SHOP, fetcher, {
    revalidate: false,
  });

  const handleFormSubmit = (data: CreateShopFormData) => {
    const formData = new FormData();

    // Create shop data object
    const shopData = {
      shopName: data.shopName,
      description: data.description || "",
      province: data.province,
      ward: data.ward,
      detail: data.detail,
      phoneNumber: data.phoneNumber,
    };

    // Append JSON data as blob
    formData.append('data', new Blob([JSON.stringify(shopData)], {
      type: 'application/json'
    }));

    if (data.logoUrl) {
      formData.append('logoUrl', data.logoUrl);
    }
    if (data.bannerUrl) {
      formData.append('bannerUrl', data.bannerUrl);
    }

    trigger(formData).then(() => {
      handleClose();
      reload();
      const alert: AlertState = {
        isOpen: true,
        title: "Tạo cửa hàng thành công",
        message: "Cửa hàng mới đã được tạo thành công",
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alert))
    }).catch((errors: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Tạo cửa hàng thất bại",
        message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alert))
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo cửa hàng mới"
      onSave={handleSubmit(handleFormSubmit)}
      saveButtonText="Tạo cửa hàng"
      cancelButtonText="Hủy"
      maxWidth="3xl"
      isLoading={isMutating}
    >
      {isMutating && <Loading/>}
      <div className="flex flex-col gap-6">
        {/* Shop Information Section */}
        <div>
          <h3 className="text-lg font-bold text-primary-c900 mb-4 pb-2 ">
            1. Thông tin cửa hàng
          </h3>
          <div className="grid grid-cols-1  gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="shopName"
                render={({field}) => (
                  <TextField
                    label="Tên cửa hàng"
                    placeholder="Nhập tên cửa hàng"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.shopName?.message}
                    required
                    disabled={isMutating}
                  />
                )}
              />
              <Controller
                control={control}
                name="phoneNumber"
                render={({field}) => (
                  <TextField
                    label="Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.phoneNumber?.message}
                    required
                    disabled={isMutating}
                  />
                )}
              />
            </div>
            <div className="md:col-span-2">
              <Controller
                control={control}
                name="description"
                render={({field}) => (
                  <TextField
                    label="Mô tả"
                    placeholder="Nhập mô tả về cửa hàng"
                    value={field.value || ""}
                    onChange={field.onChange}
                    typeTextField={"textarea"}
                    rows={3}
                    disabled={isMutating}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div>
          <h3 className="text-lg font-bold text-primary-c900 mb-4 pb-2 ">
            2. Hình ảnh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              control={control}
              name="logoUrl"
              render={({field}) => (
                <InputImage
                  label="Logo cửa hàng"
                  value={field.value}
                  onChange={field.onChange}
                  preview
                  previewWidth={150}
                  previewHeight={150}
                  maxSize={3}
                  error={errors.logoUrl?.message}
                  disabled={isMutating}
                />
              )}
            />
            <Controller
              control={control}
              name="bannerUrl"
              render={({field}) => (
                <InputImage
                  label="Banner cửa hàng"
                  value={field.value}
                  onChange={field.onChange}
                  preview
                  previewWidth={300}
                  previewHeight={150}
                  maxSize={3}
                  error={errors.bannerUrl?.message}
                  disabled={isMutating}
                />
              )}
            />
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-lg font-bold text-primary-c900 mb-4 pb-2 ">
            3. Địa chỉ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="province"
              render={({field}) => (
                <DropdownSelect
                  label="Tỉnh/Thành phố"
                  placeholder="Chọn tỉnh/thành phố"
                  options={provinceOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setSelectedProvince(value);
                    setValue("ward", ""); // Reset ward value when province changes
                  }}
                  error={errors.province?.message}
                  required
                  enableSearch={true}
                  searchPlaceholder="Tìm tỉnh/thành phố..."
                  disabled={isMutating}
                />
              )}
            />
            <Controller
              control={control}
              name="ward"
              render={({field}) => (
                <DropdownSelect
                  label="Phường/Xã"
                  placeholder="Chọn phường/xã"
                  options={wardOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.ward?.message}
                  disabled={!selectedProvince || isMutating}
                  required
                  enableSearch={true}
                  searchPlaceholder="Tìm phường/xã..."
                />
              )}
            />
            <div className="md:col-span-2">
              <Controller
                control={control}
                name="detail"
                render={({field}) => (
                  <TextField
                    label="Địa chỉ chi tiết"
                    placeholder="Nhập số nhà, tên đường..."
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.detail?.message}
                    required
                    disabled={isMutating}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
