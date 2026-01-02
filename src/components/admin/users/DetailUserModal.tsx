import {AccountStatus, Role} from "@/types/enum";
import Modal from "@/libs/Modal";
import InfoRow from "@/libs/InfoRow";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import Chip, {ChipColor} from "@/libs/Chip";
import React from "react";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import {formatDateTime} from "@/util/fnCommon";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import Image from "next/image";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
interface UserViewDto {
  userId: number;
  username: string;
  email: string | null;
  accountStatus: AccountStatus;
  fullName: string;
  phoneNumber: string | null;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: UserViewDto;
}

export default function DetailUserModal({isOpen, setIsOpen, user}: Props) {
  const getStatusLabel = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.INACTIVE:
        return "Vô hiệu hóa";
      case AccountStatus.ACTIVE:
        return "Hoạt động";
      case AccountStatus.SUSPENDED:
        return "Đình chỉ";
      default:
        return status;
    }
  };

  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.INACTIVE:
        return ChipColor.WARNING;
      case AccountStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case AccountStatus.SUSPENDED:
        return ChipColor.ERROR;
      default:
        return ChipColor.INFO;
    }
  };
  return <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title={"Chi tiết người dùng"}
    cancelButtonText={"Đóng"}
    showSaveButton={false}
  >
    <div className={"flex flex-col gap-6"}>
      <div>
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin tài khoản
        </h3>
        <div className={"grid grid-cols-2 gap-x-8 gap-y-4 bg-grey-c50 rounded-lg p-4"}>
          <InfoRow icon={<AccountCircleIcon/>} label="ID" value={user.userId}/>
          <InfoRow label={"Tên đăng nhập"}
                   icon={<AccountCircleIcon/>}
                   value={
            <div className={"flex items-center gap-2 justify-between"}>
              <span>{user.username}</span>
              <Chip
                label={getStatusLabel(user.accountStatus)}
                color={getStatusColor(user.accountStatus)}
              />
            </div>

          }/>
          <InfoRow label={"Email"} value={user.email} icon={<EmailRoundedIcon/>}/>
          <InfoRow icon={<WorkRoundedIcon/>} label={"Vai trò"} value={user.role}/>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin cá nhân
        </h3>
        <div className={"grid grid-cols-2 gap-x-8 gap-y-4 bg-grey-c50 rounded-lg p-4"}>
          <InfoRow icon={<AccountCircleIcon/>} label={"Họ và tên"} value={
            <div className={"flex items-center flex-row gap-2"}>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-c200 bg-white flex-shrink-0 flex items-center justify-center">
                {user?.avatarUrl
                  ? <Image
                    width={40}
                    height={40}
                    src={user?.avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                  : <AccountCircleRoundedIcon className="text-primary-c700 !w-[40px] !h-[40px]"/>
                }
              </div>
              <div >
                {user.fullName}
              </div>
            </div>
          }/>
          <InfoRow icon={<PhoneRoundedIcon/>} label={"Số điện thoại"} value={user.phoneNumber}/>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin hệ thống
        </h3>
        <div className={"grid grid-cols-2 gap-x-8 gap-y-4 bg-grey-c50 rounded-lg p-4"}>

          <InfoRow icon={<CalendarTodayRoundedIcon/>} label={"Ngày tạo"} value={formatDateTime(user.createdAt)}/>
          <InfoRow icon={<CalendarTodayRoundedIcon/>}  label={"Cập nhật lần cuối"} value={formatDateTime(user.updatedAt)}/>
        </div>
      </div>
    </div>
  </Modal>
}