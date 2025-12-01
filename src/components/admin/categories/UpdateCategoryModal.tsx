import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import TextSearch from "@/libs/TextSearch";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CATEGORY} from "@/services/api";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import {useDispatch} from "react-redux";
import {AlertType, CategoryStatus} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useState, useCallback, useEffect} from "react";
import Loading from "@/components/modals/Loading";
import {useAxiosContext} from "@/components/provider/AxiosProvider";

const updateCategorySchema = z.object({
  categoryName: z.string().min(1, "Tên loại mặt hàng không được để trống"),
  description: z.string().max(500).optional(),
  parentCategoryId: z.number().optional(),
});

export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reload: () => void;
  categoryId: number;
}


interface ResCategorySearchDTO {
  categoryId: number;
  categoryName: string;
  description: string;
  categoryStatus: string;
}

interface ResCategoryDetailDTO {
  categoryId: number;
  categoryName: string;
  description: string;
  categoryStatus: CategoryStatus;
  countChildren: number;
  createdAt: string;
  updatedAt: string;
  parentCategory: ResCategoryDetailDTO | null;
  subCategories: ResCategoryDetailDTO[];
}

export default function UpdateCategoryModal({isOpen, setIsOpen, reload, categoryId}: Props) {
  const { patch, get } = useAxiosContext();
  const fetcher = (url: string, {arg}: {
    arg: UpdateCategoryFormData
  }) => patch<BaseResponse<never>>(url, arg).then(res => res.data);

  const categoriesFetcher = (url: string) => get<BaseResponse<PageResponse<ResCategorySearchDTO>>>(url).then(res => res.data.data);

  const categoryDetailFetcher = (url: string) => get<BaseResponse<ResCategoryDetailDTO>>(url).then(res => res.data.data);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [allCategories, setAllCategories] = useState<ResCategorySearchDTO[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const {data: categoryDetail, isLoading: isLoadingDetail,error: errorDetail} = useSWR(
    isOpen && categoryId ? `${CATEGORY}/${categoryId}` : null,
    categoryDetailFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const {data: categoriesResponse, isLoading: isLoadingCategories,error: errorCategories} = useSWR(
    isOpen ? `${CATEGORY}/search?keyword=${encodeURIComponent(searchKeyword.trim())}&pageNo=${pageNo}&pageSize=10` : null,
    categoriesFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const {
    control,
    handleSubmit,
    formState: {errors, isDirty},
    setValue,
    reset,
  } = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      parentCategoryId: undefined,
    },
  });

  const dispatch = useDispatch();
  const {trigger, isMutating} = useSWRMutation(
    categoryId ? `${CATEGORY}/${categoryId}` : null,
    fetcher,
    {
      revalidate: false,
    }
  );
  useEffect(() => {
    if(errorDetail || errorCategories){
      const error = errorDetail || errorCategories;
      const alert : AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  },[dispatch, errorDetail, errorCategories]);

  useEffect(() => {
    setPageNo(0);
    setAllCategories([]);
    setHasMore(false);
  }, [searchKeyword]);


  useEffect(() => {
    if (categoriesResponse) {
      if (pageNo === 0) {
        const filtered = categoriesResponse.data.filter(cat => cat.categoryId !== categoryId);
        setAllCategories(filtered);
      } else {
        const filtered = categoriesResponse.data.filter(cat => cat.categoryId !== categoryId);
        setAllCategories(prev => [...prev, ...filtered]);
      }
      setHasMore(categoriesResponse.hasNextPage);
    }
  }, [categoriesResponse, pageNo, categoryId]);

  useEffect(() => {
    if (categoryDetail) {
      reset({
        categoryName: categoryDetail.categoryName,
        description: categoryDetail.description || "",
        parentCategoryId: categoryDetail.parentCategory?.categoryId,
      });
    }
  }, [categoryDetail, reset]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingCategories) {
      setPageNo(prev => prev + 1);
    }
  }, [hasMore, isLoadingCategories]);

  const categoryOptions: Option[] = [
    ...allCategories.map((category) => ({
      id: category.categoryId.toString(),
      label: category.categoryName,
    })),
  ];

  const handleFormSubmit = (data: UpdateCategoryFormData) => {
    if(searchKeyword.trim() === ""){
      data.parentCategoryId = undefined;
    }
    trigger(data).then(() => {
      setIsOpen(false);
      reload();
      const alert: AlertState = {
        isOpen: true,
        title: "Cập nhật loại mặt hàng thành công",
        message: "Thông tin loại mặt hàng đã được cập nhật",
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alert))
    }).catch((errors: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Cập nhật loại mặt hàng thất bại",
        message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alert))
    });
  };

  return <Modal
    isOpen={isOpen}
    onClose={() => {
      setIsOpen(false)
    }}
    title={"Chỉnh sửa loại mặt hàng"}
    onSave={handleSubmit(handleFormSubmit)}
    saveButtonText="Cập nhật"
    cancelButtonText="Hủy"
    maxWidth="lg"
    isLoading={isMutating || isLoadingDetail}
    disableSave={!isDirty}
  >
    {isLoadingDetail && isMutating ? (
      <Loading/>
    ) : (
      <div className="grid grid-cols-1 gap-4">
        <Controller
          control={control}
          name="parentCategoryId"
          render={({field}) => {
            const selectedOption = categoryOptions.find(opt => opt.id === field.value?.toString());
            const initialValue = categoryDetail?.parentCategory?.categoryName || "";

            return (
              <TextSearch
                label="Loại mặt hàng cha"
                placeholder="Tìm kiếm loại mặt hàng cha"
                options={categoryOptions}
                value={selectedOption?.label || initialValue}
                onSearch={(keyword) => {
                  setSearchKeyword(keyword);
                }}
                onSelect={(id) => {
                  setValue("parentCategoryId", id ? parseInt(id) : undefined);
                }}
                error={errors.parentCategoryId?.message}
                disabled={isMutating}
                isLoading={isLoadingCategories}
                debounceTime={300}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
            );
          }}
        />

        <Controller
          control={control}
          name="categoryName"
          render={({field}) => (
            <TextField
              label="Tên loại mặt hàng"
              placeholder="Nhập tên loại mặt hàng"
              value={field.value}
              onChange={field.onChange}
              error={errors.categoryName?.message}
              required
              disabled={isMutating}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({field}) => (
            <TextField
              label="Mô tả"
              placeholder="Nhập mô tả về loại mặt hàng"
              value={field.value || ""}
              onChange={field.onChange}
              typeTextField={"textarea"}
              rows={3}
              maxLength={500}
              error={errors.description?.message}
              disabled={isMutating}
            />
          )}
        />
      </div>
    )}
  </Modal>
}
