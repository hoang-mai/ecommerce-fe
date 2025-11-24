import Modal from "@/libs/Modal";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import {useState} from "react";
import useSWRMutation from "swr/mutation";
import {ADDRESS} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType} from "@/enum";
import Loading from "@/components/modals/Loading";
import Switch from "@/libs/Switch";
import {phoneRegex} from "@/util/regex";
import {useAddressMapping} from "@/hooks/useAddressMapping";

type Props = {
  isOpen: boolean;
  setIsOpen: () => void;
  mutate: () => void;
  mutateParent?: () => void;
}

const addressSchema = z.object({
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
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CreateAddressModal({isOpen, setIsOpen, mutate, mutateParent}: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const dispatch = useDispatch();
  const { post } = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: AddressFormData }) =>
    post<BaseResponse<undefined>>(url, arg).then(res => res.data);
  const {trigger, isMutating} = useSWRMutation(ADDRESS, fetcher,{
    revalidate: false,
  });

  const {provinceOptions, wardOptions} = useAddressMapping(selectedProvince);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      receiverName: '',
      province: '',
      ward: '',
      detail: '',
      phoneNumber: '',
      isDefault: false,
    },
  });

  const onSubmit = (data: AddressFormData) => {
    trigger(data).then(res => {
      const alertState: AlertState = {
        isOpen: true,
        title: 'Thành công',
        message: res.message,
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alertState));
      mutate();
      if (mutateParent) {
        mutateParent();
      }
      setIsOpen();
    }).catch((err: ErrorResponse) => {
      const alertState: AlertState = {
        isOpen: true,
        title: 'Thất bại',
        message: err.message,
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alertState));
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={setIsOpen}
      title="Thêm địa chỉ mới"
      onSave={handleSubmit(onSubmit)}
      saveButtonText="Thêm địa chỉ"
      isLoading={isMutating}
      maxWidth="2xl"
    >
      {isMutating && <Loading/>}
      <div className="space-y-4">
        {/* Receiver Name and Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="receiverName"
            render={({field}) => (
              <TextField
                htmlFor="receiverName"
                id="receiverName"
                label="Tên người nhận"
                placeholder="Nhập tên người nhận"
                disabled={isMutating}
                error={errors.receiverName?.message}
                required={true}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({field}) => (
              <TextField
                htmlFor="phoneNumber"
                id="phoneNumber"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                disabled={isMutating}
                error={errors.phoneNumber?.message}
                required={true}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Province and Ward */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="province"
            render={({field}) => (
              <DropdownSelect
                htmlFor="province"
                id="province"
                label="Tỉnh/Thành phố"
                placeholder="Chọn tỉnh/thành phố"
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
              />
            )}
          />

          <Controller
            control={control}
            name="ward"
            render={({field}) => (
              <DropdownSelect
                htmlFor="ward"
                id="ward"
                label="Phường/Xã"
                placeholder="Chọn phường/xã"
                disabled={isMutating || !selectedProvince}
                error={errors.ward?.message}
                required={true}
                value={field.value}
                onChange={field.onChange}
                options={wardOptions}
                enableSearch={true}
                searchPlaceholder="Tìm phường/xã..."
              />
            )}
          />
        </div>

        {/* Detail Address */}
        <Controller
          control={control}
          name="detail"
          render={({field}) => (
            <TextField
              htmlFor="detail"
              id="detail"
              label="Địa chỉ chi tiết"
              placeholder="Nhập địa chỉ chi tiết (Số nhà, tên đường...)"
              disabled={isMutating}
              error={errors.detail?.message}
              required={true}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* Is Default Checkbox */}
        <Controller
          control={control}
          name="isDefault"
          render={({field}) => (
            <Switch checked={field.value || false} onChange={field.onChange} label={"Đặt làm mặc định"}/>
          )}
        />
      </div>
    </Modal>
  );
}
