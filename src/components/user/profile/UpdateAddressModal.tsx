import Modal from "@/libs/Modal";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import {useEffect, useState} from "react";
import useSWRMutation from "swr/mutation";
import {ADDRESS} from "@/services/api";
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType} from "@/enum";
import Loading from "@/components/modals/Loading";
import Switch from "@/libs/Switch";
import {phoneRegex} from "@/util/regex";
import {useAddressMapping} from "@/hooks/useAddressMapping";

interface AddressData {
  addressId: number;
  userId: number;
  receiverName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

type Props = {
  isOpen: boolean;
  setIsOpen: () => void;
  mutate: () => void;
  addressData: AddressData;
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

export default function UpdateAddressModal({isOpen, setIsOpen, mutate, addressData, mutateParent}: Props) {
  const { patch } = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: AddressFormData }) =>
    patch<BaseResponse<undefined>>(url, arg).then(res => res.data);

   const [selectedProvince, setSelectedProvince] = useState<string>(addressData.province);
   const dispatch = useDispatch();
  const {provinceOptions, wardOptions} = useAddressMapping(selectedProvince);
  const {trigger, isMutating} = useSWRMutation(`${ADDRESS}/${addressData.addressId}`, fetcher, {
    revalidate: false,
  });

   const {
     control,
     handleSubmit,
     formState: {errors, isDirty},
     setValue,
   } = useForm<AddressFormData>({
     resolver: zodResolver(addressSchema),
     defaultValues: {
       receiverName: addressData.receiverName,
       province: addressData.province,
       ward: addressData.ward,
       detail: addressData.detail,
       phoneNumber: addressData.phoneNumber,
       isDefault: addressData.isDefault,
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
       title="Chỉnh sửa địa chỉ"
       onSave={handleSubmit(onSubmit)}
       saveButtonText="Cập nhật"
       isLoading={isMutating}
       disableSave={!isDirty}
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
       </div>
     </Modal>
   );
 }
