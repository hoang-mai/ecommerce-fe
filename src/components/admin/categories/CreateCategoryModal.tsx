import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import TextSearch from "@/libs/TextSearch";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CATEGORY} from "@/services/api";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import {get, post} from "@/services/axios";
import {useDispatch} from "react-redux";
import {AlertType} from "@/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useCallback, useEffect, useState} from "react";
import Loading from "@/components/modals/Loading";

const createCategorySchema = z.object({
  categoryName: z.string().min(1, "Tên loại mặt hàng không được để trống"),
  description: z.string().max(500).optional(),
  parentCategoryId: z.number().optional(),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reload: () => void;
}

const fetcher = (url: string, {arg}: {
  arg: CreateCategoryFormData
}) => post<BaseResponse<never>>(url, arg).then(res => res.data);

const categoriesFetcher = (url: string) => get<BaseResponse<PageResponse<ResCategorySearchDTO>>>(url).then(res => res.data.data);

interface ResCategorySearchDTO {
  categoryId: number;
  categoryName: string;
  description: string;
  categoryStatus: string;
}

export default function CreateCategoryModal({isOpen, setIsOpen, reload}: Props) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [allCategories, setAllCategories] = useState<ResCategorySearchDTO[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const {data: categoriesResponse, isLoading: isLoadingCategories,error: errorCategories} = useSWR(
    isOpen ? `${CATEGORY}/search?keyword=${searchKeyword}&pageNo=${pageNo}&pageSize=10` : null,
    categoriesFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,

    }
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if( errorCategories){
      const alert : AlertState = {
        isOpen: true,
        message: errorCategories.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  },[dispatch, errorCategories]);
  // Reset page and categories when search keyword changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageNo(0);
    setAllCategories([]);
    setHasMore(false);
  }, [searchKeyword]);

  // Update categories when new data arrives
  useEffect(() => {
    if (categoriesResponse) {
      if (pageNo === 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAllCategories(categoriesResponse.data);
      } else {
        setAllCategories(prev => [...prev, ...categoriesResponse.data]);
      }
      setHasMore(categoriesResponse.hasNextPage);
    }
  }, [categoriesResponse, pageNo]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingCategories) {
      setPageNo(prev => prev + 1);
    }
  }, [hasMore, isLoadingCategories]);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      parentCategoryId: undefined,
    },
  });

  const {trigger, isMutating} = useSWRMutation(CATEGORY, fetcher,{
    revalidate: false,
  });


  const categoryOptions: Option[] = [
    ...allCategories.map((category) => ({
      id: category.categoryId.toString(),
      label: category.categoryName,
    })),
  ];

  const handleFormSubmit = (data: CreateCategoryFormData) => {
    trigger(data).then(() => {
      setIsOpen(false);
      reload();
      const alert: AlertState = {
        isOpen: true,
        title: "Tạo loại mặt hàng thành công",
        message: "Loại mặt hàng mới đã được tạo thành công",
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alert))
    }).catch((errors: ErrorResponse)=>{
      const alert: AlertState = {
        isOpen: true,
        title: "Tạo loại mặt hàng thất bại",
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
    title={"Tạo loại mặt hàng"}
    onSave={handleSubmit(handleFormSubmit)}
    saveButtonText="Tạo"
    cancelButtonText="Hủy"
    maxWidth="lg"
    isLoading={isMutating}
  >
    {isMutating && <Loading/>}
    <div className="grid grid-cols-1 gap-4">
      <Controller
        control={control}
        name="parentCategoryId"
        render={({field}) => {
          const selectedOption = categoryOptions.find(opt => opt.id === field.value?.toString());
          return (
            <TextSearch
              label="Loại mặt hàng cha"
              placeholder="Tìm kiếm loại mặt hàng cha"
              options={categoryOptions}
              value={selectedOption?.label || ""}
              onSearch={(keyword) => setSearchKeyword(keyword)}
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
  </Modal>
}