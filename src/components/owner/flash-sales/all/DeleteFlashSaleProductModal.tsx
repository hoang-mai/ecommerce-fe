import Modal from "@/libs/Modal";
import {AlertType} from "@/types/enum";
import useSWRMutation from "swr/mutation";
import {FLASH_SALE_PRODUCT} from "@/services/api";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {FlashSaleProductView} from "@/types/interface";
import {formatPrice} from "@/util/fnCommon";
import Image from "next/image";
import {AxiosResponse} from "axios";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reload: () => void;
  flashSaleProduct: FlashSaleProductView;
}

export default function DeleteFlashSaleProductModal({
  isOpen,
  setIsOpen,
  reload,
  flashSaleProduct
}: Props) {
  const { del } = useAxiosContext();
  const dispatch = useDispatch();

  const fetcher = (url: string) =>
    del<BaseResponse<never>>(url).then((res: AxiosResponse<BaseResponse<never>>) => res.data);

  const {trigger, isMutating} = useSWRMutation(
    `${FLASH_SALE_PRODUCT}/${flashSaleProduct.flashSaleProductId}`,
    fetcher,
    {
      revalidate: false,
    }
  );

  const handleDelete = () => {
    trigger()
      .then(() => {
        setIsOpen(false);
        reload();
        const alert: AlertState = {
          isOpen: true,
          title: "Xóa sản phẩm thành công",
          message: "Sản phẩm đã được xóa khỏi chương trình Flash Sale",
          type: AlertType.SUCCESS,
        };
        dispatch(openAlert(alert));
      })
      .catch((errors: ErrorResponse) => {
        const alert: AlertState = {
          isOpen: true,
          title: "Xóa sản phẩm thất bại",
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
      title="Xác nhận xóa sản phẩm"
      onSave={handleDelete}
      saveButtonText="Xác nhận xóa"
      cancelButtonText="Hủy"
      maxWidth="md"
      isLoading={isMutating}
    >
      {isMutating && <Loading/>}
      <div className="space-y-4">
        <p className="text-grey-c700">
          Bạn có chắc chắn muốn xóa sản phẩm này khỏi chương trình Flash Sale?
        </p>

        <div className="bg-grey-c50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            {flashSaleProduct.productImages && flashSaleProduct.productImages.length > 0 && (
              <Image
                src={flashSaleProduct.productImages[0].imageUrl}
                alt={flashSaleProduct.productName}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-grey-c900 mb-1">
                {flashSaleProduct.productName}
              </h4>
              {flashSaleProduct.productAttributes && flashSaleProduct.productAttributes.length > 0 && (
                <p className="text-sm text-grey-c600 mb-2">
                  {flashSaleProduct.productAttributes.map(attr =>
                    `${attr.attributeName}: ${attr.attributeValue}`
                  ).join(", ")}
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-grey-c600 line-through">
                  {formatPrice(flashSaleProduct.originalPrice)}
                </span>
                <span className="text-sm font-semibold text-red-500">
                  -{flashSaleProduct.discountPercentage}%
                </span>
                <span className="text-base font-bold text-primary-c900">
                  {formatPrice(flashSaleProduct.originalPrice * (100 - flashSaleProduct.discountPercentage) / 100)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-grey-c200">
            <div>
              <p className="text-sm text-grey-c600">Tổng số lượng:</p>
              <p className="font-semibold text-grey-c900">{flashSaleProduct.totalQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-grey-c600">Đã bán:</p>
              <p className="font-semibold text-grey-c900">{flashSaleProduct.soldQuantity}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-support-c100 border border-support-c300 rounded-xl justify-start">
          <WarningRoundedIcon className={"text-yellow-c700"}/>
          <p className="text-sm text-support-c900 font-medium">
            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa khỏi chương trình Flash Sale.
          </p>
        </div>
      </div>
    </Modal>
  );
}

