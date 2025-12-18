'use client';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import {ReactNode, useEffect, useState} from "react";
import DropdownMenu from "@/libs/DropdownMenu";
import {useRouter} from "next/navigation";
import ChangePassword from "@/components/user/layout/header/ChangePassword";
import {LOGOUT, MESSAGE, NOTIFICATION, USER} from "@/services/api";
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import useSWRMutation from "swr/mutation";
import {AlertType} from "@/types/enum";
import {useDispatch, useSelector} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import DisableAccount from "@/components/user/layout/header/DisableAccount";
import {useCartData, useCartRef} from "@/components/provider/CartProvider";
import {clearAllLocalStorage} from "@/services/localStorage";
import {Cart} from "@/components/user/layout/header/Cart";
import useSWR from "swr";
import {ProfileData} from "@/components/user/profile/Main";
import Image from "next/image";
import ChatPreviewList from "@/components/user/layout/header/ChatPreviewList";
import NotificationPreviewList from "@/components/user/layout/header/NotificationPreviewList";
import {RootState} from "@/redux/store";
import {usePushNotification} from "@/hooks/usePushNotification";
import {NotificationView} from "@/types/interface";
import NotificationDetailModal from "@/components/owner/notifications/NotificationDetailModal";
export default function Information() {
  const chatState = useSelector((state: RootState) => state.chat);
  const { get, post } = useAxiosContext();
  const fetcher = (url: string) => post<BaseResponse<never>>(url, {}, {withCredentials: true}).then(res => res.data);
  const fetcherUser = (url: string) => get<BaseResponse<ProfileData>>(url).then(res => res.data.data);
  const fetcherCountChat = (url: string) => get<BaseResponse<number>>(url).then(res => res.data.data);

  const {data: dataUser} = useSWR(USER, fetcherUser, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const {data: countChat, mutate} = useSWR(`${MESSAGE}/count-unread`, fetcherCountChat, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })


  const fetcherCountNotification = (url: string) => get<BaseResponse<number>>(url).then(res => res.data.data);
  const {data: countNotification} = useSWR(`${NOTIFICATION}/unread-count`, fetcherCountNotification, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const {
    isSubscribed,
    unsubscribe
  } = usePushNotification();
  const {data} = useCartData();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenDisableAccount, setIsOpenDisableAccount] = useState<boolean>(false);
  const [isOpenNotification, setIsOpenNotification] = useState<boolean>(false);
  const [notificationSelected, setNotificationSelected] = useState<NotificationView | null>(null);
  const router = useRouter();
  const {trigger} = useSWRMutation(LOGOUT, fetcher);
  const [isOpenCart, setIsOpenCart] = useState<boolean>(false);
  const dispatch = useDispatch();


  const handleLogout = () => {

    trigger().then(res => {
      const alert: AlertState = {
        isOpen: true,
        title: "Đăng xuất thành công",
        message: res.message,
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alert))
    }).finally(() => {
      if (isSubscribed) {
        unsubscribe();
      }
      clearAllLocalStorage();
      window.dispatchEvent(new Event('authChanged'));
      router.replace('/login');
    });
  };

  const cartRef = useCartRef();
  useEffect(() => {
    if(chatState.newMessage){
      setTimeout(() => {
        mutate();
      }, 500);
    }
  }, [chatState.newMessage, mutate]);
  return (
    <div className="flex items-center gap-2">
      {/* Tin nhắn */}
      <DropdownMenu
        trigger={
          <IconButton
            icon={<QuestionAnswerRoundedIcon/>}
            badge={countChat}
            label="Tin nhắn"
          />
        }
        align="right"
      >
        <ChatPreviewList/>
      </DropdownMenu>

      {/* Thông báo */}
      <DropdownMenu
        trigger={
          <IconButton
            icon={<NotificationsRoundedIcon/>}
            badge={countNotification}
            label="Thông báo"
          />
        }
        align="right"
      >
        <NotificationPreviewList
          setIsOpenNotification={setIsOpenNotification}
          setNotificationSelected={setNotificationSelected}
        />
      </DropdownMenu>

      {/* Giỏ hàng */}
      <div
        ref={cartRef}
      >
        <IconButton
          icon={<ShoppingCartRoundedIcon/>}
          badge={data}
          label="Giỏ hàng"
          onClick={() => setIsOpenCart(true)}
        />
      </div>


      {/* Tài khoản */}
      <div className="ml-2 pl-2 border-l-2 border-grey-c200">
        <DropdownMenu
          label="Tài khoản"
          trigger={
            <button className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-full
                             hover:bg-primary-c50 transition-all duration-200 group">
              {dataUser?.avatarUrl
                ? <Image
                  width={32}
                  height={32}
                  src={dataUser?.avatarUrl}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                : <AccountCircleRoundedIcon className="text-primary-c700 !text-4xl"/>
              }
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-xs text-grey-c600">Tài khoản</span>
                <span className="text-sm font-semibold text-grey-c800 group-hover:text-primary-c700 truncate max-w-[100px]">
                  {dataUser?.fullName || 'Người dùng'}
                </span>
              </div>
            </button>
          }
          align="right"
          items={[
            {
              id: 1,
              label: (
                <div className="flex items-center gap-2">
                  <PersonRoundedIcon className="text-primary-c700"/>
                  <span>Hồ sơ</span>
                </div>
              ),
              onClick: () => router.push('/profile')
            },
            {
              id: 2,
              label: (
                <div className="flex items-center gap-2">
                  <ShoppingCartRoundedIcon className="text-success-c700"/>
                  <span>Đơn mua</span>
                </div>
              ),
              onClick: () => router.push('/orders')
            },
            {
              id: 3,
              label: (
                <div className="flex items-center gap-2">
                  <LockRoundedIcon className="text-support-c900"/>
                  <span>Đổi mật khẩu</span>
                </div>
              ),
              onClick: () => setIsOpen(true)
            },
            {
              id: 4,
              label: (
                <div className="flex items-center gap-2">
                  <BlockRoundedIcon className="text-yellow-c700"/>
                  <span>Vô hiệu hóa tài khoản</span>
                </div>
              ),
              onClick: () => setIsOpenDisableAccount(true)
            },
            {id: 5, label: 'Divider', divider: true},
            {
              id: 6,
              label: (
                <div className="flex items-center gap-2 text-support-c900">
                  <LogoutRoundedIcon/>
                  <span className="font-semibold">Đăng xuất</span>
                </div>
              ),
              onClick: handleLogout
            },
          ]}
        />
      </div>

      {isOpen && <ChangePassword isOpen={isOpen} setIsOpen={setIsOpen}/>}
      {isOpenDisableAccount && <DisableAccount isOpen={isOpenDisableAccount} setIsOpen={setIsOpenDisableAccount}/>}
      {isOpenCart && <Cart isOpen={isOpenCart} setIsOpen={setIsOpenCart}/>}
      {isOpenNotification && notificationSelected && <NotificationDetailModal isOpen={isOpenNotification} onClose={()=>setIsOpenNotification(false)} notification={notificationSelected}/>}
    </div>
  );
}

interface IconButtonProps {
  icon: ReactNode;
  badge?: number;
  onClick?: () => void;
  label: string;
}

function IconButton({icon, badge, onClick, label}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer relative p-2.5 bg-white hover:bg-primary-c50 rounded-full transition-all duration-200
                 border-2 border-transparent hover:border-primary-c300 group"
      aria-label={label}
    >
      <div className="text-grey-c700 group-hover:text-primary-c700 transition-colors">
        {icon}
      </div>
      {Number(badge) > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
                       bg-gradient-to-r from-support-c900 to-support-c800
                       text-white text-xs font-semibold rounded-full
                       flex items-center justify-center shadow-md
                       animate-pulse">
          {Number(badge) > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
