import React, {useState, useEffect, useMemo} from 'react';
import Image from 'next/image';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import MessageIcon from '@mui/icons-material/Message';
import FilterListIcon from '@mui/icons-material/FilterList';
import Title from '@/libs/Title';
import Chip, {ChipSize, ChipVariant} from '@/libs/Chip';
import Empty from '@/libs/Empty';
import ImagePreview from '@/libs/ImagePreview';
import DropdownSelect from '@/libs/DropdownSelect';
import {AlertType, RatingNumber} from '@/types/enum';
import {formatDateTime} from "@/util/FnCommon";
import {ProductView, ReviewView} from "@/types/interface";
import Star from "@/libs/Star";
import {ratingOptions, sortOptions} from "@/components/owner/reviews/Main";
import {useDispatch} from "react-redux";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {REVIEW_VIEW} from "@/services/api";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import Pagination from "@/libs/Pagination";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";

type Props = {
  id: string,
  product: ProductView;
};

const mockReviews: ReviewView[] = [
  {
    reviewId: '1',
    userId: 'user1',
    fullName: 'Nguyễn Văn A',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment: 'Sản phẩm rất tốt, chất lượng vượt mong đợi. Giao hàng nhanh, đóng gói cẩn thận.',
    imageUrls: ['https://picsum.photos/200/200?random=1', 'https://picsum.photos/200/200?random=2'],
    attributes: {Mau: 'Đỏ', Size: 'L'},
    createdAt: '2024-11-20T10:30:00',
    reviewReplyView: {
      replyId: 'r1',
      content: 'Cảm ơn bạn đã tin tưởng sử dụng sản phẩm của shop!',
      createdAt: '2024-11-21T09:00:00',
      replierId: "",
      updatedAt: ""
    },
    orderItemId: "",
    productId: "",
    productName: "",
    productVariantId: "",
    ownerId: "",
    shopId: "",
    updatedAt: "",
    isUpdated: false
  },
  {
    reviewId: '2',
    userId: 'user2',
    fullName: 'Trần Thị B',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    comment: 'Sản phẩm đẹp, đúng mô tả. Tuy nhiên giao hàng hơi lâu.',
    imageUrls: ['https://picsum.photos/200/200?random=3'],
    attributes: {Mau: 'Xanh', Size: 'M'},
    createdAt: '2024-11-19T15:20:00',
    reviewReplyView: null,
    orderItemId: "",
    productId: "",
    productName: "",
    productVariantId: "",
    ownerId: "",
    shopId: "",
    updatedAt: "",
    isUpdated: false
  },
  {
    reviewId: '3',
    userId: 'user3',
    fullName: 'Lê Văn C',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    comment: 'Tuyệt vời, sẽ ủng hộ shop lần sau.',
    imageUrls: [],
    attributes: {Mau: 'Đen', Size: 'XL'},
    createdAt: '2024-11-18T08:45:00',
    reviewReplyView: null,
    orderItemId: "",
    productId: "",
    productName: "",
    productVariantId: "",
    ownerId: "",
    shopId: "",
    updatedAt: "",
    isUpdated: false
  },
  {
    reviewId: '4',
    userId: 'user4',
    fullName: 'Phạm Thị D',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    rating: 3,
    comment: 'Sản phẩm bình thường, giá hơi cao.',
    imageUrls: [],
    attributes: {Mau: 'Trắng', Size: 'S'},
    createdAt: '2024-11-17T14:30:00',
    reviewReplyView: null,
    orderItemId: "",
    productId: "",
    productName: "",
    productVariantId: "",
    ownerId: "",
    shopId: "",
    updatedAt: "",
    isUpdated: false
  }
];

export default function Review({id, product}: Props) {
  const {get} = useAxiosContext();
  const [rating, setRating] = useState<string>('');
  const [sortLabel, setSortLabel] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(0);

  const dispatch = useDispatch();
  const url = useBuildUrl({
    baseUrl: REVIEW_VIEW,
    queryParams: {
      productId: id,
      stars: rating || undefined,
      pageNo: currentPage,
      pageSize: 25,
      sortBy: sortBy || undefined,
      sortDir: sortDir || undefined,
    }
  })
  const fetcher = (url: string) => get<BaseResponse<PageResponse<ReviewView>>>(url).then(res => res.data);
  const {data, isLoading, error} = useSWR(url, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const pageData = data?.data;
  const reviews = pageData?.data || mockReviews;
  const totalPages = pageData?.totalPages || 0;

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const statistics = useMemo(() => {
    const totalReviews = product.numberOfReviews || 0;
    const totalRatings = product.numberOfRatings || 0;
    const averageRating = product.rating / product.numberOfRatings || 0;
    const ratingDistribution: Record<number, number> = {
      1: product.ratingStatistics?.["ONE"] || 0,
      2: product.ratingStatistics?.["TWO"] || 0,
      3: product.ratingStatistics?.["THREE"] || 0,
      4: product.ratingStatistics?.["FOUR"] || 0,
      5: product.ratingStatistics?.["FIVE"] || 0,
    };
    return {totalReviews, totalRatings, averageRating, ratingDistribution};
  }, [product]);


  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  const ReviewCard: React.FC<{ review: ReviewView }> = ({review}) => {

    return (
      <div className="bg-white rounded-lg p-6 border border-grey-c100 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0 border-2 border-grey-c100">
            <Image
              src={review.avatarUrl ?? '/avatar_hoat_hinh_db4e0e9cf4.webp'}
              alt={review.fullName}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-grey-c900">{review.fullName}</h4>
                <div className="flex items-center mt-1">
                  <Star rating={Number(RatingNumber[review.rating])}/>
                  <span className="text-sm text-grey-c500">{formatDateTime(review.createdAt)}</span>
                </div>
              </div>
            </div>

            {review.attributes && Object.keys(review.attributes).length > 0 && (
              <div className="flex items-center gap-2 mb-3 text-sm text-grey-c600 flex-wrap">
                <span className="text-xs text-grey-c500">Phân loại:</span>
                {Object.entries(review.attributes).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    variant={ChipVariant.SOFT}
                    size={ChipSize.SMALL}
                    className="truncate"
                  />
                ))}
              </div>
            )}

            <p className="text-grey-c700 mb-3 leading-relaxed whitespace-pre-line">{review.comment}</p>

            {review.imageUrls && review.imageUrls.length > 0 && (
              <div className="mb-3">
                <div className="flex gap-2 flex-wrap">
                  {review.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPreviewImage(url)}
                      className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-grey-c200 hover:border-blue-400 transition-all transform hover:scale-105"
                    >
                      <Image
                        src={url}
                        alt={`Review ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {review.reviewReplyView && (
              <div className="bg-primary-c50 rounded-lg p-4 mt-4 border-l-4 border-primary-c400">
                <div className="flex items-start gap-3">
                  <MessageIcon className="w-5 h-5 text-primary-c700 mt-0.5 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-grey-c900">
                        Phản hồi từ shop
                      </span>
                      <span className="text-sm text-grey-c500">
                        {formatDateTime(review.reviewReplyView.createdAt)}
                      </span>
                    </div>
                    <p className="text-grey-c700 leading-relaxed">{review.reviewReplyView.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      {isLoading && <Loading/>}
      <Title title="Đánh giá sản phẩm"/>

      <div className="bg-white rounded-lg p-6 border border-grey-c100 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-8 flex-wrap">
          <div className="text-center">
            <div className="text-5xl font-bold text-grey-c900 mb-2">
              {statistics.averageRating.toFixed(1)}
            </div>
            <Star rating={Number(statistics.averageRating)} fontSize={"medium"}/>
            <div className="text-sm text-grey-c500 mt-2">
              {statistics.totalReviews} đánh giá
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {(Object.values(RatingNumber).reverse().filter(v => typeof v === 'number') as number[]).map((rating) => {
              const count = statistics.ratingDistribution[rating] || 0;
              const percentage = statistics.totalRatings > 0 ? (count / statistics.totalRatings) * 100 : 0;

              return (
                <div
                  key={rating}
                  className="w-full flex items-center gap-3 hover:bg-grey-c50 rounded p-2 transition-colors group"
                >
                   <span className="text-sm w-12 flex items-center gap-1 font-medium text-grey-c700">
                     {rating} <StarRateRoundedIcon className="w-3 h-3 text-yellow-400"/>
                   </span>
                  <div className="flex-1 h-2.5 bg-grey-c200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300 group-hover:opacity-90"
                      style={{width: `${percentage}%`}}
                    />
                  </div>
                  <span className="text-sm text-grey-c600 w-16 text-right font-medium flex justify-start">
                     {count}
                   </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4  border border-grey-c100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <FilterListIcon className="w-5 h-5 text-grey-c500"/>
          <span className="text-sm font-medium text-grey-c700">Lọc và sắp xếp</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DropdownSelect
            label="Đánh giá"
            placeholder="Chọn đánh giá"
            value={rating}
            onChange={(value) => setRating(value)}
            options={ratingOptions}
          />

          <DropdownSelect
            label="Sắp xếp theo"
            placeholder="Chọn cách sắp xếp"
            value={sortLabel}
            onChange={(value) => {
              setSortLabel(value);
              if (value === 'newest') {
                setSortBy('createdAt');
                setSortDir('desc');
              } else if (value === 'oldest') {
                setSortBy('createdAt');
                setSortDir('asc');
              } else if (value === 'highest') {
                setSortBy('rating');
                setSortDir('desc');
              } else if (value === 'lowest') {
                setSortBy('rating');
                setSortDir('asc');
              } else {
                setSortBy('');
                setSortDir('desc');
              }
            }}
            options={sortOptions}
          />
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.reviewId} review={review}/>
          ))
        ) : (
          <div
            className="bg-white rounded-lg p-12 text-center border flex flex-col items-center justify-center border-grey-c100 hover:shadow-md transition-shadow">
            <Empty/>
            <p className="text-grey-c500 mt-4 font-medium">Chưa có đánh giá nào</p>
            <p className="text-grey-c400 text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        )}
      </div>
      <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}/>
      {previewImage && <ImagePreview imageUrl={previewImage} onClose={() => setPreviewImage(null)}/>}
    </div>
  );
}

