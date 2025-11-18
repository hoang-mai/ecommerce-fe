'use client';

import {ReactNode, useEffect, useState} from 'react';
import Image from 'next/image';
import Button from "@/libs/Button";
import {AlertType, ColorButton, Gender, GenderLabel, Role} from "@/enum";
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import WcRoundedIcon from '@mui/icons-material/WcRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import UpdateProfileModal from "@/components/user/profile/UpdateProfileModal";
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import HistoryEduRoundedIcon from '@mui/icons-material/HistoryEduRounded';
import {formatDate, formatDateTime} from "@/util/FnCommon";
import useSWR from "swr";
import {USER} from "@/services/api";
import {get} from "@/services/axios";
import Loading from "@/components/modals/Loading";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import AddressModal from "@/components/user/profile/AddressModal";
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import UpdateAvatarModal from "@/components/user/profile/UpdateAvatarModal";
import RegisterOwnerModal from "@/components/user/profile/RegisterOwnerModal";
import HistoryRegisterOwnerModal from "@/components/user/profile/HistoryRegisterOwnerModal";

interface ProfileData {
  userId: number;
  email: string | null;
  description: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  role: Role;
  gender: Gender | null;
  isVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => get<BaseResponse<ProfileData>>(url).then(res => res.data.data);


export default function Main() {
  const [isOpen, setIsOpen] = useState<boolean[]>([false, false, false, false, false]);
  const {data, error, isLoading, mutate} = useSWR(USER, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const dispatch = useDispatch();
  useEffect(() => {
    if(error){
      const alert : AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải thông tin cá nhân"
      }
      dispatch(openAlert(alert));
    }
  },[dispatch, error]);

  const handleAvatarClick = () => {
    setIsOpen(prevState => {
      const newState = [...prevState];
      newState[3] = true;
      return newState;
    });
  };

  return (
    <div className={"flex flex-col md:flex-row gap-6 p-8 max-w-6xl mx-auto"}>
      {isLoading && <Loading/>}
      {/* Left Section */}
      <div className={"w-fit h-fit flex flex-col items-center gap-2"}>
        <div className={"w-full flex flex-col items-center gap-2 rounded-lg shadow-md p-6 border border-gray-200"}>
          <div className="text-sm text-grey-c600">
            ID: {data?.userId}
          </div>
          <div className="relative group">
            <div
              className="w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-primary-c200 transition-all duration-500 hover:shadow-lg cursor-pointer">
              <Image
                src={data?.avatarUrl || '/avatar_hoat_hinh_db4e0e9cf4.webp'}
                alt="Avatar"
                width={150}
                height={150}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Edit Icon Overlay */}
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 w-10 h-10 bg-primary-c700 hover:bg-primary-c800
                       rounded-full flex items-center justify-center shadow-lg
                       transition-all duration-200 transform hover:scale-110 active:scale-95
                       border-2 border-white cursor-pointer"
            >
              <CameraAltRoundedIcon className="text-white !text-xl" />
            </button>
          </div>
          <div className={"text-2xl font-semibold text-grey-c800"}>
            {data?.firstName} {data?.middleName ? data.middleName + ' ' : ''}{data?.lastName}
          </div>
          <div className="text-grey-c600">{data?.role}</div>
          <div className="text-grey-c600">{data?.email}</div>
          <div className={"flex flex-row gap-4 whitespace-nowrap"}>
            <Button
              type={"button"}
              color={ColorButton.PRIMARY}
              startIcon={<BorderColorRoundedIcon/>}
              onClick={() => setIsOpen(prevState => {
                const newState = [...prevState];
                newState[0] = true;
                return newState;
              })}
              fullWidth
            >
              Chỉnh sửa
            </Button>
            <Button
              type={"button"}
              color={ColorButton.PRIMARY}
              startIcon={<LocationOnRoundedIcon/>}
              onClick={() => setIsOpen(prevState => {
                const newState = [...prevState];
                newState[1] = true;
                return newState;
              })}
              fullWidth
            >
              Địa chỉ
            </Button>
          </div>
        </div>
        <div className={"w-full flex flex-row gap-2 whitespace-nowrap"}>
          <Button type={"button"}
                  color={ColorButton.PRIMARY}
                  startIcon={<AddCircleRoundedIcon/>}
                  disabled={data?.isVerification}
                  onClick={() => setIsOpen(prevState => {
                    const newState = [...prevState];
                    newState[2] = true;
                    return newState;
                  })}
          >
            Đăng ký làm người bán
          </Button>
          <Button type={"button"}
                  color={ColorButton.PRIMARY}
                  startIcon={<HistoryEduRoundedIcon/>}
                  onClick={() => setIsOpen(prevState => {
                    const newState = [...prevState];
                    newState[4] = true;
                    return newState;
                  })}
          >
            Lịch sử
          </Button>
        </div>

      </div>

      {/* Right Section */}
      <div className={"flex-2"}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-primary-c700 text-white p-6">
            <div className="flex items-center gap-3">
              <PersonRoundedIcon style={{fontSize: 32}}/>
              <div>
                <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
                <p className="text-sm text-primary-c100">Chi tiết thông tin tài khoản của bạn</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Thông tin cá nhân */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                Thông tin cá nhân
              </h3>
              <div className="bg-grey-c50 rounded-lg p-4 grid grid-cols-1 lg:grid-cols-2  gap-4">
                <InfoRow
                  icon={<PersonRoundedIcon/>}
                  label="Họ và tên"
                  value={data?.lastName ? `${data?.firstName || ''} ${data?.middleName || ''} ${data?.lastName}`.trim() : null}
                />
                <InfoRow
                  icon={<WcRoundedIcon/>}
                  label="Giới tính"
                  value={data?.gender ? GenderLabel[data.gender] : null}
                />
                <InfoRow
                  icon={<CakeRoundedIcon/>}
                  label="Ngày sinh"
                  value={data?.dateOfBirth ? formatDate(data.dateOfBirth) : null}
                />
                <InfoRow
                  icon={<PhoneRoundedIcon/>}
                  label="Số điện thoại"
                  value={data?.phoneNumber}
                />
              </div>
            </div>

            {/* Mô tả */}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                Giới thiệu
              </h3>
              <div className="bg-grey-c50 rounded-lg p-4">
                <InfoRow
                  icon={<DescriptionRoundedIcon/>}
                  label="Mô tả"
                  value={data?.description}
                />
              </div>
            </div>

            {/* Thông tin hệ thống */}
            <div>
              <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-c700 rounded"></div>
                Thông tin hệ thống
              </h3>
              <div className="bg-grey-c50 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InfoRow
                    icon={<CalendarTodayRoundedIcon/>}
                    label={"Tạo lúc"}
                    value={data?.createdAt ? formatDateTime(data.createdAt) : formatDateTime("2025-11-03T14:54:16.260363Z")}
                  />
                  <InfoRow
                    icon={<CalendarTodayRoundedIcon/>}
                    label={"Cập nhật lần cuối"}
                    value={data?.updatedAt ? formatDateTime(data.updatedAt) : null}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {isOpen[0] && data && <UpdateProfileModal reload={mutate} isOpen={isOpen[0]} profileData={data}
                                                setIsOpen={() => setIsOpen(prevState => {
                                                  const newState = [...prevState];
                                                  newState[0] = false;
                                                  return newState;
                                                })}/>}


      {isOpen[1] && <AddressModal isOpen={isOpen[1]} setIsOpen={() => {
        setIsOpen(prevState => {
          const newState = [...prevState];
          newState[1] = false;
          return newState;
        });
      }}/>}

      {isOpen[2] && <RegisterOwnerModal isOpen={isOpen[2]}
                                        reload={mutate}
                                        setIsOpen={() => {
        setIsOpen(prevState => {
          const newState = [...prevState];
          newState[2] = false;
          return newState;
        });
      }}/>}

      {isOpen[3] && <UpdateAvatarModal
        isOpen={isOpen[3]}
        currentAvatarUrl={data?.avatarUrl}
        reload={mutate}
        setIsOpen={() => {
          setIsOpen(prevState => {
            const newState = [...prevState];
            newState[3] = false;
            return newState;
          });
        }}
      />}

      {isOpen[4] && <HistoryRegisterOwnerModal
        isOpen={isOpen[4]}
        setIsOpen={() => {
          setIsOpen(prevState => {
            const newState = [...prevState];
            newState[4] = false;
            return newState;
          });
        }}
      />}
    </div>
  );
}
const InfoRow = ({icon, label, value}: { icon?: ReactNode; label: string; value?: string | null }) => (
  <div className="flex items-start gap-3 py-3 border-b border-grey-c200">
    {icon && <div className="text-primary-c600 mt-0.5">{icon}</div>}
    <div className="flex-1">
      <span className="text-sm font-semibold text-grey-c600 block mb-1">{label}</span>
      <span className="text-base text-grey-c800">{value || 'Chưa cập nhật'}</span>
    </div>
  </div>
);
