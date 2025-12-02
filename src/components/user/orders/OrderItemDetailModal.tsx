import Modal from "@/libs/Modal";
import {formatPrice} from "@/util/FnCommon";
import Divide from "@/libs/Divide";
import React, {useState, useCallback} from "react";
import {InfoRow} from "@/libs/InfoRow";
import {OrderItem} from "@/components/user/orders/Main";
import Image from "next/image";
import TextField from "@/libs/TextField";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import Button from "@/libs/Button";
import {ColorButton, RatingNumber, OrderStatus} from "@/types/enum";
import {z} from "zod";
import {useForm, Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {REVIEW} from "@/services/api";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType} from "@/types/enum";
import useSWRMutation from "swr/mutation";
import Chip, { ChipColor, ChipVariant, ChipSize } from "@/libs/Chip";

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedOrderItem: OrderItem;
    orderStatus: OrderStatus | "";
}
const ReviewSchema = z.object({
    rating: z.number().int().min(1, "Vui lòng chọn đánh giá").max(5, "Vui lòng chọn đánh giá").optional(),
    comment: z.string().min(1, "Vui lòng nhập nhận xét").max(500, "Nhận xét tối đa 500 ký tự"),
    orderItemId: z.string().min(1, "orderItemId không được rỗng"),
    productId: z.string().min(1, "productId không được rỗng"),
    productVariantId: z.string().min(1, "productVariantId không được rỗng"),
    attributes: z.record(z.string(), z.string()).refine(obj => Object.keys(obj).length > 0, {message: "Thuộc tính sản phẩm không được rỗng"}),
});
type ReviewForm = z.infer<typeof ReviewSchema>;

export default function OrderItemDetailModal({isOpen, setIsOpen, selectedOrderItem, orderStatus}: Props) {
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const {post} = useAxiosContext();
    const fetcher = (url: string, {arg}: {
        arg: ReviewForm
    }) => post<BaseResponse<unknown>>(url, arg).then(res => res.data);
    const dispatch = useDispatch();
    const {trigger, isMutating} = useSWRMutation(REVIEW, fetcher);
    const buildAttributes = useCallback((): Record<string, string> => {
        const attrs: Record<string, string> = {};
        selectedOrderItem.productAttributes.forEach(attr => {
            attrs[attr.attributeName] = attr.attributeValue;
        });
        return attrs;
    }, [selectedOrderItem.productAttributes]);

    const {
        control,
        handleSubmit,
        formState: {errors,isDirty}
    } = useForm<ReviewForm>({
        resolver: zodResolver(ReviewSchema),
        defaultValues: {
            rating: undefined,
            comment: "",
            orderItemId: "",
            productId: "",
            productVariantId: "",
            attributes: {},
        }
    });


    const onSubmit = (data: ReviewForm) => {

    };


    return <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Chi tiết sản phẩm #${selectedOrderItem.orderItemId}`}
        onSave={handleSubmit(onSubmit)}
        isLoading={isMutating}
        disableSave={!isDirty}
        saveButtonText={"Gửi đánh giá"}
        showSaveButton={orderStatus === OrderStatus.COMPLETED}
        childrenFooter={
            <div className="p-4">
                <Divide/>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-base font-semibold text-grey-c800">
                        <span>Số lượng:</span>
                        <span>{selectedOrderItem.quantity}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-grey-c800">
                        <span>Giá:</span>
                        <span>{formatPrice(selectedOrderItem.price)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-grey-c800">
                        <span>Tổng giá:</span>
                        <span>{formatPrice(selectedOrderItem.totalPrice)}</span>
                    </div>
                    {selectedOrderItem.totalDiscount > 0 && (
                        <div className="flex justify-between text-base font-semibold text-orange-600">
                            <span>Giảm giá:</span>
                            <span>-{formatPrice(selectedOrderItem.totalDiscount)}</span>
                        </div>
                    )}
                    <Divide/>
                    <div className="flex justify-between text-lg font-bold text-primary-c900">
                        <span>Thành tiền:</span>
                        <span>{formatPrice(selectedOrderItem.totalFinalPrice)}</span>
                    </div>
                </div>
            </div>
        }
    >
        <div className="">
            {/* Product Detail */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                    Thông tin sản phẩm
                </h3>
                <div className="border border-grey-c200 rounded-xl p-4">
                    <div className="flex gap-4">
                        <Image
                            src={selectedOrderItem.productImageUrl}
                            alt={selectedOrderItem.productName}
                            width={120}
                            height={120}
                            className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h4 className="font-semibold text-grey-c800 text-xl mb-3">{selectedOrderItem.productName}</h4>
                            <div className="space-y-2 text-sm">
                                <InfoRow
                                    label="Mã sản phẩm"
                                    value={<span
                                        className="font-medium text-grey-c800">{selectedOrderItem.productId}</span>}
                                />
                                <InfoRow
                                    label="Mã biến thể"
                                    value={<span
                                        className="font-medium text-grey-c800">{selectedOrderItem.productVariantId}</span>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Attributes */}
            {selectedOrderItem.productAttributes && selectedOrderItem.productAttributes.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                        Thuộc tính sản phẩm
                    </h3>
                    <div className="bg-grey-c50 rounded-xl p-5">
                        <div className="grid grid-cols-2 gap-4">
                            {selectedOrderItem.productAttributes.map((attr, index) => (
                                <InfoRow
                                    key={index}
                                    label={attr.attributeName}
                                    value={<span className="font-semibold text-grey-c800">{attr.attributeValue}</span>}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Section: only show when orderStatus is COMPLETED */}
            {orderStatus === OrderStatus.COMPLETED && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                        Đánh giá sản phẩm
                    </h3>
                    <div className="border border-grey-c200 rounded-xl p-5">
                        {/* Star Rating */}
                        <div className="mb-4">
                            <Controller
                                name="rating"
                                control={control}
                                render={({field}) => (
                                    <div className="flex items-center gap-2">
                                        {(Object.values(RatingNumber).filter(v => typeof v === 'number') as number[]).map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => field.onChange((field.value === star) ? undefined : star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(null)}
                                                className="transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                {(hoveredRating ?? field.value ?? 0) >= star ? (
                                                    <StarRoundedIcon fontSize="large" className="text-yellow-500"/>
                                                ) : (
                                                    <StarBorderRoundedIcon fontSize="large"
                                                                           className="text-yellow-500"/>
                                                )}
                                            </button>
                                        ))}

                                        {(field.value ?? 0) > 0 && (
                                            <Chip
                                                label={
                                                    field.value === 5 ? "Tuyệt vời" :
                                                        field.value === 4 ? "Hài lòng" :
                                                            field.value === 3 ? "Bình thường" :
                                                                field.value === 2 ? "Không hài lòng" :
                                                                    "Rất tệ"
                                                }
                                                variant={ChipVariant.SOFT}
                                                color={ChipColor.PRIMARY}
                                                size={ChipSize.SMALL}
                                                className="ml-2"
                                            />
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        <Controller control={control} name="comment" render={({field}) => (
                            <TextField
                                label="Nhận xét"
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                typeTextField="textarea"
                                rows={4}
                                error={errors.comment?.message}
                                required
                                maxLength={500}
                            />
                        )}/>
                    </div>
                </div>
            )}
        </div>
    </Modal>
}
