"use client";
import {useCallback, useEffect, useState} from "react";
import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import InputImage from "@/libs/InputImage";
import TextSearch from "@/libs/TextSearch";
import Button from "@/libs/Button";
import {z} from "zod";
import {Controller, useFieldArray, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { CATEGORY, PRODUCT} from "@/services/api";
import {useDispatch} from "react-redux";
import {AlertType, ColorButton} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import DropdownSelect from "@/libs/DropdownSelect";
import Loading from "@/components/modals/Loading";
import CheckBox from "@/libs/CheckBox";

const productAttributeSchema = z.object({
  attributeName: z.string().min(1, "Tên thuộc tính không được để trống"),
  attributeValues: z.array(z.string().min(1, "Giá trị không được để trống")).min(1, "Phải có ít nhất 1 giá trị"),
});

const productVariantSchema = z.object({
  price: z.number().positive("Giá phải lớn hơn 0"),
  stockQuantity: z.number().int().min(0, "Số lượng phải lớn hơn hoặc bằng 0"),
  isDefault : z.boolean().optional(),
  attributeValues: z.record(z.string(), z.string()).optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Danh mục không được để trống"),
  productDetails: z.array(z.object({
    key: z.string().min(1, "Trường không được để trống"),
    value: z.string().min(1, "Giá trị không được để trống"),
  })).optional(),
  imageUrls: z.array(z.instanceof(File))
    .min(1, "Vui lòng tải lên ít nhất 1 ảnh")
    .refine((files) => files.every(file => file.size <= 3 * 1024 * 1024),
      "Mỗi ảnh phải nhỏ hơn 3MB")
    .refine((files) => files.every(file => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)),
      "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP"),
  productAttributes: z.array(productAttributeSchema).optional(),
  productVariants: z.array(productVariantSchema).min(1, "Phải có ít nhất 1 biến thể sản phẩm"),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  reload: () => void;
  shopId: string;
}

export default function CreateProductModal({isOpen, onClose, reload, shopId}: CreateProductModalProps) {
  const dispatch = useDispatch();
  const { post, get } = useAxiosContext();
  const [tempAttributeValue, setTempAttributeValue] = useState<{ [key: number]: string }>({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [allCategories, setAllCategories] = useState<{ categoryId: number; categoryName: string }[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [variantAttributeValues, setVariantAttributeValues] = useState<{[variantIndex: number]: {[attrName: string]: string}}>({});

  const fetcher = (url: string, {arg}: { arg: FormData }) =>
    post<BaseResponse<never>>(url, arg, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }).then(res => res.data);

  const categoryFetcher = (url: string) =>
    get<BaseResponse<PageResponse<{ categoryId: number; categoryName: string }>>>(url)
      .then(res => res.data.data);

  const {isLoading: isLoadingCategories} = useSWR(
    isOpen ? `${CATEGORY}/search?keyword=${searchKeyword}&pageNo=${pageNo}&pageSize=10` : null,
    categoryFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        if(!data) return;
        if (pageNo === 0) {
          setAllCategories(data.data);
        } else {
          setAllCategories(prev => [...prev, ...data.data]);
        }
        setHasMore(data.hasNextPage);
      },
    }
  );

  useEffect(() => {
    setPageNo(0);
    setAllCategories([]);
    setHasMore(false);
  }, [searchKeyword]);


  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingCategories) {
      setPageNo(prev => prev + 1);
    }
  }, [hasMore, isLoadingCategories]);

  const categoryOptions: Option[] = allCategories.map(cat => ({
    id: cat.categoryId.toString(),
    label: cat.categoryName,
  }));

  const {trigger, isMutating} = useSWRMutation(`${PRODUCT}`, fetcher);

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      productDetails: [],
      imageUrls: [],
      productAttributes: [],
      productVariants: [{
        price: 0,
        stockQuantity: 0,
        isDefault: true,
        attributeValues: {},
      }],
    },
  });

  const {fields: attributeFields, append: appendAttribute, remove: removeAttribute} = useFieldArray({
    control,
    name: "productAttributes",
  });

  const {fields: variantFields, append: appendVariant, remove: removeVariant} = useFieldArray({
    control,
    name: "productVariants",
  });

  const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
    control,
    name: "productDetails",
  });

  const attributes = useWatch({
    control,
    name: "productAttributes",
  });



  const handleAddAttributeValue = (attrIndex: number) => {
    const currentValue = tempAttributeValue[attrIndex];
    if (!currentValue?.trim()) return;

    const currentValues = attributes?.[attrIndex]?.attributeValues || [];
    setValue(`productAttributes.${attrIndex}.attributeValues`, [...currentValues, currentValue.trim()]);
    setTempAttributeValue(prev => ({...prev, [attrIndex]: ""}));
  };

  const handleRemoveAttributeValue = (attrIndex: number, valueIndex: number) => {
    const currentValues = attributes?.[attrIndex]?.attributeValues || [];
    setValue(`productAttributes.${attrIndex}.attributeValues`, currentValues.filter((_, i) => i !== valueIndex));
  };

  const onSubmit = (data: CreateProductFormData) => {
    const formData = new FormData();

    const productDetailsRecord: { [key: string]: string } | undefined =
      data.productDetails && Array.isArray(data.productDetails) && data.productDetails.length > 0
        ? data.productDetails.reduce((acc: { [k: string]: string }, cur) => {
          if (cur.key && cur.key.trim()) {
            acc[cur.key.trim()] = cur.value ?? "";
          }
          return acc;
        }, {})
        : undefined;

    const cleanedVariants = data.productVariants.map((variant, index) => {
      const cleanedAttributeValues: {[key: string]: string} = {};

      const localAttrValues = variantAttributeValues[index] || {};

      Object.keys(localAttrValues).forEach(key => {
        const value = localAttrValues[key];
        if (value && value !== "" && value !== undefined) {
          cleanedAttributeValues[key] = value;
        }
      });

      return {
        price: variant.price,
        stockQuantity: variant.stockQuantity,
        isDefault: variant.isDefault,
        attributeValues: Object.keys(cleanedAttributeValues).length > 0 ? cleanedAttributeValues : undefined,
      };
    });

    const productData = {
      shopId: parseInt(shopId),
      name: data.name,
      description: data.description || "",
      categoryId: parseInt(data.categoryId),
      productAttributes: data.productAttributes || [],
      productVariants: cleanedVariants,
      productDetails: productDetailsRecord,
    };

    formData.append('data', new Blob([JSON.stringify(productData)], {type: 'application/json'}));

    // Append image files
    data.imageUrls.forEach((file) => {
      formData.append('imageUrls', file);
    });

    trigger(formData).then((res) => {

      const alert: AlertState = {
        isOpen: true,
        message: res.message || "Thêm sản phẩm thành công",
        type: AlertType.SUCCESS,
        title: "Thành công",
      };
      dispatch(openAlert(alert));

      reload();
      onClose();
    }).catch((err: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        message: err.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: AlertType.ERROR,
        title: "Thất bại",
      };
      dispatch(openAlert(alert));
    });
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        title="Thêm sản phẩm mới"
        onSave={handleSubmit(onSubmit)}
        onClose={onClose}
        saveButtonText="Thêm sản phẩm"
        isLoading={isMutating}
      >
        {isMutating && <Loading/>}
        {/* Basic Information */}
        <h4 className="font-bold text-primary-c900 mb-4">1. Thông tin cơ bản</h4>
        <div className={"flex flex-col gap-4 mb-4"}>
          <Controller
            name="name"
            control={control}
            render={({field}) => (
              <TextField
                value={field.value}
                onChange={field.onChange}
                label="Tên sản phẩm"
                placeholder="Nhập tên sản phẩm"
                error={errors.name?.message}
                required
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({field}) => (
              <TextField
                value={field.value}
                onChange={field.onChange}
                label="Mô tả sản phẩm"
                placeholder="Nhập mô tả sản phẩm"
                error={errors.description?.message}
                typeTextField={"textarea"}
                rows={4}
              />
            )}
          />

          <Controller
            name="categoryId"
            control={control}
            render={({field}) => {
              const selectedOption = categoryOptions.find(opt => opt.id === field.value);
              return (
                <TextSearch
                  label="Danh mục"
                  placeholder="Tìm kiếm danh mục"
                  options={categoryOptions}
                  value={selectedOption?.label || ""}
                  onSearch={(keyword) => setSearchKeyword(keyword)}
                  onSelect={(id) => {
                    setValue("categoryId", id);
                  }}
                  error={errors.categoryId?.message}
                  disabled={isMutating}
                  isLoading={isLoadingCategories}
                  debounceTime={300}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                  required
                />
              );
            }}
          />
        </div>

        <div className=" rounded-lg py-4 space-y-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-primary-c900">2. Thông tin chi tiết sản phẩm</h4>
            <Button
              type="button"
              color={ColorButton.PRIMARY}
              startIcon={<AddRoundedIcon/>}
              onClick={() => appendDetail({ key: "", value: "" })}
            >
              Thêm thông tin
            </Button>
          </div>

          {detailFields.length === 0 ? (
            <p className="text-sm text-grey-c600 text-center py-4">Chưa có thông tin chi tiết nào.</p>
          ) : (
            <div className="space-y-3">
              {detailFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-2 gap-3 items-center">
                  <Controller
                    name={`productDetails.${index}.key` as const}
                    control={control}
                    render={({field}) => (
                      <TextField
                        value={field.value}
                        onChange={field.onChange}
                        label="Trường"
                        placeholder=""
                        required
                        error={errors.productDetails?.[index]?.key?.message}
                      />
                    )}
                  />

                  <div className="flex gap-2">
                    <Controller
                      name={`productDetails.${index}.value` as const}
                      control={control}
                      render={({field}) => (
                        <TextField
                          value={field.value}
                          onChange={field.onChange}
                          label="Giá trị"
                          placeholder=""
                          required
                          error={errors.productDetails?.[index]?.value?.message}
                        />
                      )}
                    />

                    <button
                      type="button"
                      onClick={() => removeDetail(index)}
                      className="p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-colors"
                      title="Xóa thông tin"
                    >
                      <DeleteRoundedIcon fontSize="small"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h4 className="font-bold text-primary-c900 mb-3">3. Hình ảnh sản phẩm</h4>

        <Controller
          name="imageUrls"
          control={control}
          render={({field}) => (
            <InputImage
              label="Tải lên ảnh sản phẩm"
              onChange={field.onChange}
              error={errors.imageUrls?.message}
              required
              value={field.value}
              multiple={true}
              maxFiles={10}
            />
          )}
        />
        <p className="text-xs text-grey-c600">
          * Tải lên ít nhất 1 ảnh, tối đa 10 ảnh. Mỗi ảnh không quá 3MB. Hỗ trợ: JPEG, PNG, GIF, WEBP
        </p>

        {/* Product Attributes */}
        <div className=" rounded-lg py-4 space-y-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-primary-c900">4. Thuộc tính sản phẩm</h4>
            <Button
              type="button"
              color={ColorButton.PRIMARY}
              startIcon={<AddRoundedIcon/>}
              onClick={() => appendAttribute({attributeName: "", attributeValues: []})}
            >
              Thêm thuộc tính
            </Button>
          </div>

          {attributeFields.length === 0 ? (
            <p className="text-sm text-grey-c600 text-center py-4">
              Chưa có thuộc tính nào. Nhấn &#34;Thêm thuộc tính&#34; để thêm.
            </p>
          ) : (
            <div className="space-y-4">
              {attributeFields.map((field, index) => (
                <div key={field.id} className="bg-white rounded-lg p-4 space-y-3 border border-grey-c200">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-primary-c900">Thuộc tính {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="p-1 text-support-c800 hover:bg-support-c200 rounded-lg transition-colors"
                      title="Xóa thuộc tính"
                    >
                      <DeleteRoundedIcon fontSize="small"/>
                    </button>
                  </div>

                  <Controller
                    name={`productAttributes.${index}.attributeName`}
                    control={control}
                    render={({field}) => (
                      <TextField
                        value={field.value}
                        onChange={field.onChange}
                        label="Tên thuộc tính"
                        placeholder=""
                        error={errors.productAttributes?.[index]?.attributeName?.message}
                        required
                      />
                    )}
                  />

                  <div>

                    {/* Input to add value */}
                    <div className="flex gap-2 mb-3">
                      <TextField
                        label={"Thêm giá trị thuộc tính"}
                        required={true}
                        value={tempAttributeValue[index] || ""}
                        onChange={(value) => setTempAttributeValue(prev => ({
                          ...prev,
                          [index]: value || ""
                        }))}
                        placeholder=""
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAttributeValue(index);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        color={ColorButton.PRIMARY}
                        onClick={() => handleAddAttributeValue(index)}
                      >
                        Thêm
                      </Button>
                    </div>

                    {/* Display added values */}
                    <div className="flex flex-wrap gap-2">
                      {attributes?.[index]?.attributeValues?.map((value, valueIndex) => (
                        <div
                          key={valueIndex}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-c100 text-primary-c800 rounded-lg text-sm font-medium"
                        >
                          {value}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttributeValue(index, valueIndex)}
                            className="text-primary-c800 hover:text-support-c800 transition-colors cursor-pointer"
                          >
                            <DeleteRoundedIcon fontSize="small"/>
                          </button>
                        </div>
                      ))}
                    </div>

                    {errors.productAttributes?.[index]?.attributeValues && (
                      <p className="text-sm text-support-c900 mt-2">
                        {errors.productAttributes[index]?.attributeValues?.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Variants */}
        <div className=" rounded-lg py-4 space-y-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-primary-c900">5. Biến thể sản phẩm (Giá & Kho)</h4>
            <Button
              type="button"
              color={ColorButton.PRIMARY}
              startIcon={<AddRoundedIcon/>}
              onClick={() => appendVariant({price: 0, stockQuantity: 0, attributeValues: {}})}
            >
              Thêm biến thể
            </Button>
          </div>

          <div className="space-y-4">
            {variantFields.map((field, index) => (
              <div key={field.id} className="bg-white rounded-lg p-4 space-y-3 border border-grey-c200">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-primary-c900">Biến thể {index + 1}</h5>
                  {variantFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1 text-support-c800 hover:bg-support-c200 rounded-lg transition-colors"
                      title="Xóa biến thể"
                    >
                      <DeleteRoundedIcon fontSize="small"/>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name={`productVariants.${index}.price`}
                    control={control}
                    render={({field}) => (
                      <TextField
                        value={field.value.toString()}
                        label="Giá (VNĐ)"
                        type="number"
                        placeholder="0"
                        error={errors.productVariants?.[index]?.price?.message}
                        onChange={(value) => field.onChange(parseFloat(value) || 0)}
                        required
                      />
                    )}
                  />

                  <Controller
                    name={`productVariants.${index}.stockQuantity`}
                    control={control}
                    render={({field}) => (
                      <TextField
                        value={field.value.toString()}
                        label="Số lượng"
                        type="number"
                        placeholder="0"
                        error={errors.productVariants?.[index]?.stockQuantity?.message}
                        onChange={(value) => field.onChange(parseInt(value) || 0)}
                        required
                      />
                    )}
                  />
                </div>

                {/* Is Default Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-primary-c50 rounded-lg border border-primary-c200">
                  <Controller
                    name={`productVariants.${index}.isDefault`}
                    control={control}
                    render={({field}) => (
                      <CheckBox
                        checked={field.value || false}
                        onChange={(checked) => {
                          // Set all variants to false first
                          variantFields.forEach((_, i) => {
                            setValue(`productVariants.${i}.isDefault`, false);
                          });
                          // Then set the selected one to true
                          field.onChange(checked);
                        }}
                        label="Đặt làm biến thể mặc định"
                      />
                    )}
                  />
                  <span className="text-xs text-primary-c700 ml-auto">
                    (Biến thể này sẽ được hiển thị đầu tiên)
                  </span>
                </div>

                {/* Attribute Values Mapping */}
                {attributes && attributes.length > 0 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-primary-c900">
                      Giá trị thuộc tính cho biến thể này
                    </label>
                    {attributes.map((attr, attrIndex) => {
                      if (!attr?.attributeName) return null;
                      return (
                        <DropdownSelect
                          key={attrIndex}
                          label={attr.attributeName}
                          placeholder={`Chọn ${attr.attributeName}`}
                          options={attr.attributeValues?.map(val => ({id: val, label: val})) || []}
                          value={variantAttributeValues[index]?.[attr.attributeName] || ""}
                          onChange={(value) => {
                            setVariantAttributeValues(prev => ({
                              ...prev,
                              [index]: {
                                ...(prev[index] || {}),
                                [attr.attributeName]: value || ""
                              }
                            }));
                          }}
                          align={'top'}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {errors.productVariants && typeof errors.productVariants.message === 'string' && (
            <p className="text-sm text-support-c900">{errors.productVariants.message}</p>
          )}
        </div>
      </Modal>
    </>
  );
}
