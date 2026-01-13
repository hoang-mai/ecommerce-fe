import Modal from "@/libs/Modal";
import {AlertType, ProductStatus} from "@/types/enum";
import useSWRMutation from "swr/mutation";
import {PRODUCT} from "@/services/api";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {ProductView, ReqUpdateProductStatusDTO} from "@/types/interface";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reload: () => void;
  product: ProductView;
}

export default function DeleteProductModal({
  isOpen,
  setIsOpen,
  reload,
  product
}: Props) {
  const { patch } = useAxiosContext();
  const dispatch = useDispatch();

  const fetcher = (url: string, {arg}: { arg: ReqUpdateProductStatusDTO }) =>
    patch<BaseResponse<never>>(url, arg).then(res => res.data);

  const {trigger, isMutating} = useSWRMutation(
    `${PRODUCT}/${product.productId}/product-status`,
    fetcher,
    {
      revalidate: false,
    }
  );

  const handleDelete = () => {
    trigger({ productStatus: ProductStatus.DELETED })
      .then(() => {
        setIsOpen(false);
        reload();
        const alert: AlertState = {
          isOpen: true,
          title: "Xóa sản phẩm thành công",
          message: "Sản phẩm đã được xóa",
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
          Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-grey-c900">{product.name}</strong>?
        </p>

        <div className="flex items-center gap-3 p-4 bg-support-c100 border border-support-c300 rounded-xl justify-start">
          <WarningRoundedIcon className={"text-yellow-c700"}/>
          <p className="text-sm text-support-c900 font-medium">
            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Sản phẩm sẽ không thể được chỉnh sửa và bán cho khách hàng.
          </p>
        </div>
      </div>
    </Modal>
  );
}

