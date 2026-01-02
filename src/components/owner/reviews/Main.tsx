'use client';
import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import Star from '@/libs/Star';
import Reply from '@mui/icons-material/Reply';
import Send from '@mui/icons-material/Send';
import X from '@mui/icons-material/Close';
import MessageSquare from '@mui/icons-material/Message';
import ImagePreview from '@/libs/ImagePreview';
import Chip, {ChipSize, ChipVariant} from '@/libs/Chip';
import {ReviewView} from "@/types/interface";
import {formatDate, formatDateTime} from "@/util/fnCommon";
import Title from "@/libs/Title";
import FilterListIcon from "@mui/icons-material/FilterList";
import DropdownSelect from "@/libs/DropdownSelect";
import TextField from "@/libs/TextField";
import Button from "@/libs/Button";
import {AlertType, ColorButton, RatingNumber} from "@/types/enum";
import {useDispatch} from "react-redux";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {REVIEW_REPLY, REVIEW_VIEW} from "@/services/api";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import Pagination from "@/libs/Pagination";
import useSWRMutation from "swr/mutation";
import Empty from "@/libs/Empty";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

export const ratingOptions: Option[] = [
  {id: '', label: 'Tất cả đánh giá'},
  {id: 'FIVE', label: '5 sao'},
  {id: 'FOUR', label: '4 sao'},
  {id: 'THREE', label: '3 sao'},
  {id: 'TWO', label: '2 sao'},
  {id: 'ONE', label: '1 sao'},
]

export const sortOptions: Option[] = [
  {id: '', label: 'Mặc định'},
  {id: 'newest', label: 'Mới nhất'},
  {id: 'oldest', label: 'Cũ nhất'},
  {id: 'highest', label: 'Đánh giá cao nhất'},
  {id: 'lowest', label: 'Đánh giá thấp nhất'},
]

const statusOptions: Option[] = [
  {id: '', label: 'Tất cả'},
  {id: 'with_reply', label: 'Đã phản hồi'},
  {id: 'without_reply', label: 'Chưa phản hồi'},
]

type ReviewCardProps = {
  review: ReviewView;
  isReplying: boolean;
  onReplyClick: () => void;
  onCancel: () => void;
  onSubmit: (reviewId: string, content: string) => void;
  setPreviewImage: (url: string | null) => void;
};

const ReviewCard: React.FC<ReviewCardProps> = React.memo(function ReviewCard({
  review,
  isReplying,
  onReplyClick,
  onCancel,
  onSubmit,
  setPreviewImage,
}) {
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (!isReplying) {
      setTimeout(()=>{
        setReplyContent('');
      })

    }
  }, [isReplying]);

  return (
    <div className="bg-white rounded-lg p-6 border border-grey-c200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0 border-2 border-grey-c100 flex items-center justify-center">
          {review?.avatarUrl
            ? <Image
              width={48}
              height={48}
              src={review?.avatarUrl}
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            : <AccountCircleRoundedIcon className="text-primary-c700 !w-12 !h-12"/>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-grey-c900">{review.fullName}</h4>
              <div className="flex items-center mt-1 ">
                <Star rating={Number(RatingNumber[review.rating])} />
                <span className="text-sm text-grey-c500">{formatDateTime(review.createdAt)}</span>
              </div>
            </div>
            {review.isUpdated && (
              <span className="text-sm text-grey-c500 italic"> (Đã chỉnh sửa)</span>
            )}
          </div>

          <div className="text-grey-c900 mb-1">
            <span className="text-sm text-grey-c700 block truncate" title={review.productName}>
              <span className="font-medium mr-1">Tên sản phẩm:</span>
              <span className="text-primary-c700 font-semibold">{review.productName}</span>
            </span>
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
              <div className={"flex justify-between items-start gap-4"}>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary-c700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-grey-c900">Phản hồi từ Shop</span>
                      <span className="text-sm text-grey-c500">{formatDate(review.reviewReplyView.createdAt)}</span>
                    </div>
                    <p className="text-grey-c700 leading-relaxed">{review.reviewReplyView.content}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!review.reviewReplyView && (
            <div className="mt-4">
              {isReplying ? (
                <div className="bg-grey-c50 p-4 rounded-lg border border-grey-c200 pt-8">
                  <TextField
                    label={"Phản hồi của bạn"}
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder={"Nhập phản hồi của bạn..."}
                    typeTextField={"textarea"}
                    rows={3}
                    required={true}
                    maxLength={1000}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      startIcon={<Send />}
                      color={ColorButton.PRIMARY}
                      onClick={() => onSubmit(review.reviewId, replyContent)}
                    >
                      Gửi phản hồi
                    </Button>
                    <Button
                      startIcon={<X />}
                      onClick={() => {
                        setReplyContent('');
                        onCancel();
                      }}
                      color={ColorButton.ERROR}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <Button color={ColorButton.PRIMARY} startIcon={<Reply />} onClick={onReplyClick}>
                  Phản hồi đánh giá
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function Main() {
  const {get, post} = useAxiosContext();
  const [rating, setRating] = useState<string>('');
  const [sortLabel, setSortLabel] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const dispatch = useDispatch();
  const url = useBuildUrl({
    baseUrl: REVIEW_VIEW,
    queryParams: {
      isOwner: true,
      isReply: status === 'with_reply' ? true : status === 'without_reply' ? false : undefined,
      status: status || undefined,
      stars: rating || undefined,
      pageNo: currentPage,
      pageSize: 25,
      sortBy: sortBy || undefined,
      sortDir: sortDir || undefined,
    }
  })
  const fetcher = (url: string) => get<BaseResponse<PageResponse<ReviewView>>>(url, {isToken: true}).then(res => res.data);
  const {data, isLoading, error, mutate} = useSWR(url, fetcher)

  const fetcherCreateReply = (url: string, {arg}: { arg: { reviewId: string, content: string } }) =>
    post<BaseResponse<never>>(url, {reviewId: arg.reviewId, content: arg.content}).then(res => res.data);
  const {trigger: triggerCreateReply, isMutating: isCreatingReply} = useSWRMutation(REVIEW_REPLY, fetcherCreateReply, {
    revalidate: false
  });
  const pageData = data?.data;
  const reviews = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;
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

  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleReply = (reviewId: string, content: string) => {
    if (content.trim() === '') {
      const alert: AlertState = {
        isOpen: true,
        message: "Nội dung phản hồi không được để trống.",
        type: AlertType.WARNING,
        title: "Lỗi phản hồi",
      }
      dispatch(openAlert(alert));
      return;
    }

    triggerCreateReply({reviewId, content}).then(res => {
      const alert: AlertState = {
        isOpen: true,
        message: res.message || "Phản hồi đánh giá thành công.",
        type: AlertType.SUCCESS,
        title: "Phản hồi thành công",
      }
      dispatch(openAlert(alert));
      setReplyingTo(null);
      mutate();
    }).catch((errors: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau.",
        type: AlertType.ERROR,
        title: "Lỗi phản hồi",
      }
      dispatch(openAlert(alert));
    });
  };

  return (
    <div className="overflow-y-auto min-h-0">
      {isLoading && isCreatingReply && <Loading />}
      <Title title={"Đánh giá sản phẩm"} isDivide={true} />
      {/* Filter */}
      <div className="bg-white rounded-lg p-4  border border-grey-c100 hover:shadow-md transition-shadow mb-4">
        <div className="flex items-center gap-2 mb-4">
          <FilterListIcon className="w-5 h-5 text-grey-c500" />
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
                setSortDir('asc');
              } else if (value === 'lowest') {
                setSortBy('rating');
                setSortDir('desc');
              } else {
                setSortBy('');
                setSortDir('desc');
              }
            }}
            options={sortOptions}
          />
          <DropdownSelect
            label="Trạng thái phản hồi"
            placeholder="Chọn trạng thái"
            value={status}
            onChange={(value) => setStatus(value)}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              isReplying={replyingTo === review.reviewId}
              onReplyClick={() => setReplyingTo(review.reviewId)}
              onCancel={() => setReplyingTo(null)}
              onSubmit={handleReply}
              setPreviewImage={setPreviewImage}
            />
          ))
        ) : (
          <div className="text-center text-grey-c600 py-10 flex flex-col items-center justify-center">
            <Empty />
            <p className="mt-4">Chưa có đánh giá nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>

      {previewImage && (
        <ImagePreview imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
      )}
      <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};
