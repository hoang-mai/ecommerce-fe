import Modal from "@/libs/Modal";
import {AlertType, CategoryStatus} from "@/types/enum";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";
import {formatDateTime} from "@/util/FnCommon";
import useSWR from "swr";
import {CATEGORY} from "@/services/api";
import {useEffect} from "react";
import Table, {Column} from "@/libs/Table";
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import InfoRow from "@/libs/InfoRow";
import {useAxiosContext} from "@/components/provider/AxiosProvider";

interface ResCategoryDTO {
  categoryId: number;
  categoryName: string;
  description: string;
  categoryStatus: CategoryStatus;
  countChildren: number;
  createdAt: string;
  updatedAt: string;
  subCategories: ResCategoryDTO[];
  parentCategory: ResCategoryDTO | null;
}

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categoryId: number;
}


export default function DetailCategoryModal({isOpen, setIsOpen, categoryId}: Props) {

  const {get} = useAxiosContext();
  const fetcher = (url: string) => get<BaseResponse<ResCategoryDTO>>(url).then(res => res.data.data);
  const {data: category, isLoading, error} = useSWR(
    isOpen && categoryId ? `${CATEGORY}/${categoryId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải danh mục",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);
  const getStatusLabel = (status: CategoryStatus) => {
    switch (status) {
      case CategoryStatus.ACTIVE:
        return "Hoạt động";
      case CategoryStatus.INACTIVE:
        return "Ngừng hoạt động";
      default:
        return status;
    }
  };

  const getStatusColor = (status: CategoryStatus) => {
    switch (status) {
      case CategoryStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case CategoryStatus.INACTIVE:
        return ChipColor.SECONDARY;
      default:
        return ChipColor.SUCCESS;
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const subCategoryColumns: Column<ResCategoryDTO>[] = [
    {
      key: "categoryId",
      label: "ID",
      render: (sub) => (
        <span className="text-sm text-grey-c900">{sub.categoryId}</span>
      )
    },
    {
      key: "name",
      label: "Tên danh mục",
      render: (sub) => (
        <span className="text-sm font-semibold text-grey-c900">{sub.categoryName}</span>
      )
    },
    {
      key: "categoryStatus",
      label: "Trạng thái",
      render: (sub) => (
        <Chip
          label={getStatusLabel(sub.categoryStatus)}
          variant={ChipVariant.SOFT}
          color={getStatusColor(sub.categoryStatus)}
        />
      )
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chi tiết danh mục"
      showSaveButton={false}
      maxWidth="3xl"
    >
      {isLoading && <Loading/>}
      {category ? (
        <div>
          {/* Thông tin danh mục */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thông tin danh mục
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InfoRow
                icon={<NumbersRoundedIcon/>}
                label="Mã danh mục"
                value={category.categoryId.toString()}
              />
              <InfoRow
                icon={<ToggleOnRoundedIcon/>}
                label="Trạng thái"
                value={
                  <Chip
                    label={getStatusLabel(category.categoryStatus)}
                    variant={ChipVariant.SOFT}
                    color={getStatusColor(category.categoryStatus)}
                  />
                }
              />
              <InfoRow
                icon={<CategoryRoundedIcon/>}
                label="Tên danh mục"
                value={category.categoryName}
              />
              <InfoRow
                icon={<CategoryRoundedIcon/>}
                label="Danh mục cha"
                value={category.parentCategory ? category.parentCategory.categoryName : 'Không có'}
              />
              <InfoRow
                icon={<NumbersRoundedIcon/>}
                label="Số lượng danh mục con"
                value={category.countChildren.toString()}
              />
            </div>
          </div>

          {/* Mô tả */}
          {category.description && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                Mô tả
              </h3>
              <div className="bg-grey-c50 rounded-lg p-4">
                <InfoRow
                  icon={<DescriptionRoundedIcon/>}
                  label="Mô tả"
                  value={category.description}
                />
              </div>
            </div>
          )}

          {/* Thông tin hệ thống */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thông tin hệ thống
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InfoRow
                  icon={<CalendarTodayRoundedIcon/>}
                  label="Ngày tạo"
                  value={formatDateTime(category.createdAt)}
                />
                <InfoRow
                  icon={<CalendarTodayRoundedIcon/>}
                  label="Ngày cập nhật"
                  value={formatDateTime(category.updatedAt)}
                />
              </div>
            </div>
          </div>

          {/* Danh mục con */}
          {category.subCategories && category.subCategories.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                Danh mục con ({category.subCategories.length})
              </h3>
              <Table<ResCategoryDTO>
                columns={subCategoryColumns}
                data={category.subCategories}
                keyExtractor={(row) => row.categoryId}
                emptyMessage="Không có danh mục con"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-grey-c600">
          Không tìm thấy thông tin danh mục
        </div>
      )}
    </Modal>
  );
}
