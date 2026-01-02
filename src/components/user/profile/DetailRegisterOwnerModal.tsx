"use client";
import Modal from "@/libs/Modal";
import {UserVerificationStatus, UserVerificationStatusLabel , ColorButton} from "@/types/enum";
import {useState} from "react";
import ImagePreview from "@/libs/ImagePreview";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import {formatDateTime} from "@/util/fnCommon";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";
import Image from "next/image";
import InfoRow from "@/libs/InfoRow";

interface ResUserVerificationDTO {
  userVerificationId: number;
  verificationCode: string;
  avatarUrl: string;
  accountNumber: string;
  bankName: string;
  frontImageUrl: string;
  backImageUrl: string;
  rejectReason: string | null;
  userVerificationStatus: UserVerificationStatus;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResUserVerificationDTO;
}

export default function DetailRegisterOwnerModal({
                                                   isOpen,
                                                   onClose,
                                                   data,
                                                 }: DetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);




  const getStatusColor = (status: UserVerificationStatus) => {
    switch (status) {
      case UserVerificationStatus.PENDING:
        return ChipColor.WARNING;
      case UserVerificationStatus.APPROVED:
        return ChipColor.SUCCESS;
      case UserVerificationStatus.REJECTED:
        return ChipColor.ERROR;
      default:
        return ChipColor.INFO;
    }
  };





  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Chi tiết đăng ký người bán"
        maxWidth="4xl"
        showSaveButton={false}
        cancelButtonText={"Đóng"}
        saveButtonColor= {ColorButton.SUCCESS}
      >
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between bg-primary-c50 p-4 rounded-lg border border-primary-c200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary-c300">
                <Image
                  src={data.avatarUrl}
                  alt={data.userName}
                  onClick={() => setSelectedImage(data.avatarUrl)}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-grey-c900">
                  {data.userName}
                </h3>
                <p className="text-sm text-grey-c700">{data.userEmail}</p>
                <p className="text-xs text-grey-c600 mt-1">
                  User ID: {data.userId}
                </p>
              </div>
            </div>
            <div>
              <Chip
                label={UserVerificationStatusLabel[data.userVerificationStatus]}
                variant={ChipVariant.SOFT}
                color={getStatusColor(data.userVerificationStatus)}
              />
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thông tin người dùng
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<PersonRoundedIcon/>}
                label="Họ và tên"
                value={data.userName}
              />
              <InfoRow
                icon={<EmailRoundedIcon/>}
                label="Email"
                value={data.userEmail}
              />
            </div>
          </div>

          {/* Verification Information */}
          <div>
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thông tin CCCD
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4">
              <InfoRow
                icon={<BadgeRoundedIcon/>}
                label="Mã CCCD"
                value={data.verificationCode}
              />
            </div>
          </div>

          {/* Bank Information */}
          <div>
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thông tin ngân hàng
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<AccountBalanceRoundedIcon/>}
                label="Tên ngân hàng"
                value={data.bankName}
              />
              <InfoRow
                icon={<CreditCardRoundedIcon/>}
                label="Số tài khoản"
                value={data.accountNumber}
              />
            </div>
          </div>

          {/* CCCD Images */}
          <div>
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Hình ảnh CCCD
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="border-2 border-grey-c300 rounded-lg overflow-hidden hover:border-primary-c500 transition-colors">
                <div className="bg-grey-c200 px-3 py-2 text-sm font-semibold text-grey-c700">
                  Mặt trước
                </div>
                <div className="p-2 bg-grey-c50">
                  <Image
                    src={data.frontImageUrl}
                    alt="CCCD mặt trước"
                    width={400}
                    height={250}
                    className="w-full h-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                    style={{height: 'auto'}}
                    onClick={() => setSelectedImage(data.frontImageUrl)}
                  />
                </div>
              </div>
              <div
                className="border-2 border-grey-c300 rounded-lg overflow-hidden hover:border-primary-c500 transition-colors">
                <div className="bg-grey-c200 px-3 py-2 text-sm font-semibold text-grey-c700">
                  Mặt sau
                </div>
                <div className="p-2 bg-grey-c50">
                  <Image
                    src={data.backImageUrl}
                    alt="CCCD mặt sau"
                    width={400}
                    height={250}
                    className="w-full h-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                    style={{height: 'auto'}}
                    onClick={() => setSelectedImage(data.backImageUrl)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reject Reason */}
          {data.rejectReason && (
            <div>
              <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-support-c700 rounded"></div>
                Lý do từ chối
              </h3>
              <div className="bg-support-c100 border border-support-c300 rounded-lg p-4">
                <p className="text-base text-support-c900 whitespace-pre-wrap break-words">
                  {data.rejectReason}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thông tin hệ thống
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  icon={<CalendarTodayRoundedIcon/>}
                  label="Ngày tạo"
                  value={formatDateTime(data.createdAt)}
                />
                <InfoRow
                  icon={<CalendarTodayRoundedIcon/>}
                  label="Ngày cập nhật"
                  value={formatDateTime(data.updatedAt)}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>


      {/* Image Preview */}
      <ImagePreview
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="CCCD"
      />
    </>
  );
}
