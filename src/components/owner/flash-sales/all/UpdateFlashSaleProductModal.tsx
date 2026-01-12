import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import {z} from "zod";
import {Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FLASH_SALE_PRODUCT} from "@/services/api";
import useSWRMutation from "swr/mutation";
import {useDispatch} from "react-redux";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {FlashSaleProductView} from "@/types/interface";
import {formatPrice} from "@/util/fnCommon";
import Image from "next/image";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";

const updateFlashSaleProductSchema = z.object({
  originalPrice: z.number(),
  rating: z.number(),
  totalSold: z.number(),
  discountPercentage: z
    .number({message: "Phần trăm giảm giá phải là số"})
    .min(20, "Phần trăm giảm giá tối thiểu là 20%")
    .max(70, "Phần trăm giảm giá tối đa là 70%"),
  totalQuantity: z
    .number({message: "Tổng số lượng phải là số"})
    .int("Tổng số lượng phải là số nguyên")
    .min(1, "Tổng số lượng phải lớn hơn 0"),
  maxQuantityPerUser: z
    .number({message: "Số lượng tối đa phải là số"})
    .int("Số lượng tối đa/người phải là số nguyên")
    .min(1, "Số lượng tối đa mỗi người phải lớn hơn 0"),
}).refine(
  (data) => data.maxQuantityPerUser <= data.totalQuantity,
  {
    message: "Số lượng tối đa mỗi người không được lớn hơn tổng số lượng",
    path: ["maxQuantityPerUser"],
  }
);

export type UpdateFlashSaleProductFormData = z.infer<typeof updateFlashSaleProductSchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reload: () => void;
  flashSaleProduct: FlashSaleProductView;
}

export default function UpdateFlashSaleProductModal({
  isOpen,
  setIsOpen,
  reload,
  flashSaleProduct
}: Props) {
  const {patch} = useAxiosContext();
  const dispatch = useDispatch();

  const fetcher = (url: string, {arg}: {arg: UpdateFlashSaleProductFormData}) =>
    patch<BaseResponse<never>>(url, arg).then(res => res.data);

  const {
    control,
    handleSubmit,
    formState: {errors, isDirty},
  } = useForm<UpdateFlashSaleProductFormData>({
    resolver: zodResolver(updateFlashSaleProductSchema),
    defaultValues: {
      discountPercentage: flashSaleProduct.discountPercentage,
      totalQuantity: flashSaleProduct.totalQuantity,
      maxQuantityPerUser: flashSaleProduct.maxQuantityPerUser,
      originalPrice: flashSaleProduct.originalPrice,
      rating: flashSaleProduct.score,
      totalSold: flashSaleProduct.soldQuantity,
    },
  });

  const watchedDiscountPercentage = useWatch({
    control,
    name: "discountPercentage",
    defaultValue: flashSaleProduct.discountPercentage,
  });

  const flashSalePrice = flashSaleProduct.originalPrice * (100 - (watchedDiscountPercentage || 0)) / 100;

  const {trigger, isMutating} = useSWRMutation(
    `${FLASH_SALE_PRODUCT}/${flashSaleProduct.flashSaleProductId}`,
    fetcher,
    {
      revalidate: false,
    }
  );

  const handleFormSubmit = (data: UpdateFlashSaleProductFormData) => {
    trigger(data)
      .then(() => {
        setIsOpen(false);
        reload();
        const alert: AlertState = {
          isOpen: true,
          title: "Cập nhật sản phẩm thành công",
          message: "Thông tin sản phẩm Flash Sale đã được cập nhật",
          type: AlertType.SUCCESS,
        };
        dispatch(openAlert(alert));
      })
      .catch((errors: ErrorResponse) => {
        const alert: AlertState = {
          isOpen: true,
          title: "Cập nhật sản phẩm thất bại",
          message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
          type: AlertType.ERROR,
        };
        dispatch(openAlert(alert));
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Chỉnh sửa sản phẩm Flash Sale"
      onSave={handleSubmit(handleFormSubmit)}
      saveButtonText="Cập nhật"
      cancelButtonText="Hủy"
      maxWidth="4xl"
      isLoading={isMutating}
      disableSave={!isDirty}
    >
      {isMutating && <Loading/>}
      <div className="space-y-6">
        {/* Product Info Section */}
        <div className="bg-primary-c50 p-4 rounded-xl border border-primary-c200">
          <h3 className="text-base font-bold text-primary-c800 mb-4 flex items-center gap-2">
            <InventoryRoundedIcon className="text-primary-c700"/>
            Thông tin sản phẩm
          </h3>

          <div className="p-4 bg-white rounded-xl border border-primary-c300">
            <div className="flex items-start gap-4">
              {flashSaleProduct.productImages && flashSaleProduct.productImages.length > 0 ? (
                <Image
                  src={flashSaleProduct.productImages[0].imageUrl}
                  alt={flashSaleProduct.productName}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-primary-c200"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-grey-c100 flex items-center justify-center">
                  <InventoryRoundedIcon className="text-grey-c400 !text-3xl"/>
                </div>
              )}
              <div className="flex-1">
                <p className="text-base font-bold text-grey-c900">{flashSaleProduct.productName}</p>
                {flashSaleProduct.productAttributes && flashSaleProduct.productAttributes.length > 0 && (
                  <p className="text-sm text-grey-c600 mt-1">
                    {flashSaleProduct.productAttributes.map(attr =>
                      `${attr.attributeName}: ${attr.attributeValue}`
                    ).join(" | ")}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="font-bold text-primary-c700">{formatPrice(flashSaleProduct.originalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Sale Configuration */}
        <div className="bg-primary-c50 p-4 rounded-xl border border-primary-c200">
          <h3 className="text-base font-bold text-primary-c700 mb-4">Cấu hình Flash Sale</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="totalQuantity"
              control={control}
              render={({field}) => (
                <TextField
                  label="Tổng số lượng"
                  placeholder="Nhập tổng số lượng"
                  type="number"
                  value={field.value ?? ""}
                  onChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                  error={errors.totalQuantity?.message}
                  required
                  disabled={isMutating}
                />
              )}
            />

            <Controller
              name="maxQuantityPerUser"
              control={control}
              render={({field}) => (
                <TextField
                  label="Số lượng tối đa mỗi người"
                  placeholder="Nhập số lượng tối đa"
                  type="number"
                  value={field.value ?? ""}
                  onChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                  error={errors.maxQuantityPerUser?.message}
                  required
                  disabled={isMutating}
                />
              )}
            />

            <Controller
              name="discountPercentage"
              control={control}
              render={({field}) => (
                <TextField
                  label="Phần trăm giảm giá (%)"
                  placeholder="Nhập % giảm giá (20-70)"
                  type="number"
                  value={field.value ?? ""}
                  onChange={(value) => field.onChange(value ? parseFloat(value) : null)}
                  error={errors.discountPercentage?.message}
                  required
                  disabled={isMutating}
                />
              )}
            />

            {/* Display calculated discount price */}
            {watchedDiscountPercentage && watchedDiscountPercentage > 0 && (
              <div className="flex flex-col justify-center">
                <p className="text-sm text-grey-c600">Giá sau giảm:</p>
                <p className="text-lg font-bold text-support-c900">
                  {formatPrice(flashSalePrice)}
                </p>
                <p className="text-xs text-grey-c500 line-through">
                  {formatPrice(flashSaleProduct.originalPrice)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Warning Note */}
        <div className="flex items-center gap-3 p-4 bg-support-c100 border border-support-c300 rounded-xl justify-start">
          <WarningRoundedIcon className="text-yellow-c700"/>
          <p className="text-sm text-support-c900 font-medium">
            <strong>Lưu ý:</strong> Cập nhật thông tin sẽ áp dụng ngay lập tức cho sản phẩm trong chương trình Flash Sale.
          </p>
        </div>
      </div>
    </Modal>
  );
}

