"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from "@/libs/Button";
import {AlertType, ColorButton} from "@/types/enum";
import {SvgIconComponent} from '@mui/icons-material';
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import RateReviewIcon from "@mui/icons-material/RateReview";
import useSWRMutation from "swr/mutation";
import {useDispatch, useSelector} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {LOGOUT, MESSAGE, NOTIFICATION, USER} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import useSWR from "swr";
import {ProfileData} from "@/components/user/profile/Main";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import {useEffect} from "react";
import {RootState} from "@/redux/store";
import {getCurrentUserId} from "@/util/fnCommon";
import {usePushNotification} from "@/hooks/usePushNotification";
import {clearAllLocalStorage} from "@/services/localStorage";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import {clearAllCookie} from "@/services/cookie";
import FlashOnIcon from "@mui/icons-material/FlashOn";
interface MenuItem {
  name: string;
  link: string;
  icon: SvgIconComponent;
}

export default function Sidebar() {
  const {get, post} = useAxiosContext();
  const fetcher = (url: string) => post<BaseResponse<never>>(url, {}, {withCredentials: true}).then(res => res.data);
  const fetcherUser = (url: string) => get<BaseResponse<ProfileData>>(url).then(res => res.data.data);
  const {data: dataUser} = useSWR(USER, fetcherUser, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const chatState = useSelector((state: RootState) => state.chat);
  const fetcherCountChat = (url: string) => get<BaseResponse<number>>(url).then(res => res.data.data);

  const {data: countChat,mutate} = useSWR(`${MESSAGE}/count-unread`, fetcherCountChat, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const fetcherCountNotification = (url: string) => get<BaseResponse<number>>(url).then(res => res.data.data);
  const {data: countNotification} = useSWR(`${NOTIFICATION}/unread-count`, fetcherCountNotification, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const pathname = usePathname();
  const menuItems: MenuItem[] = [
    {name: "Tổng quan", link: "/owner/dashboard", icon: DashboardIcon},
    {name: "Quản lý cửa hàng", link: "/owner/shops", icon: StorefrontIcon},
    {name: "Quản lý đơn hàng", link: "/owner/orders", icon: ShoppingCartCheckoutIcon},
    {name: "Quản lý đánh giá", link: "/owner/reviews", icon: RateReviewIcon},
    {name: "Flash Sale", link: "/owner/flash-sales", icon: FlashOnIcon},
    {name: "Tin nhắn", link: "/owner/chats", icon: ChatRoundedIcon},
    {name: "Thông báo", link: "/owner/notifications", icon: NotificationsRoundedIcon},
  ];
  const {
    isSubscribed,
    unsubscribe
  } = usePushNotification();
  const router = useRouter();
  const {trigger} = useSWRMutation(LOGOUT, fetcher);
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
      if(isSubscribed){
        unsubscribe();
      }
      clearAllLocalStorage();
      clearAllCookie();
      window.dispatchEvent(new Event('authChanged'));
      router.push('/login');
    });
  }
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const currentUserId = getCurrentUserId(token);
      if(chatState.newMessage && chatState.newMessage.senderId !== currentUserId) {
        setTimeout(() => {
          mutate();
        }, 500);
      }
    }

  }, [chatState.newMessage, mutate]);
  return <div
    className={"hidden md:flex sticky top-0 left-0 z-sidebar h-screen w-60 min-w-60 border-r border-grey-c200 shadow-md flex-col px-4 pt-8 pb-4 rounded-r-lg overflow-y-auto"}>
    {/* Logo */}
    <div className="flex items-center justify-center mb-8">
      <Image src={"/evoway.svg"} alt={"logo"} width={300} height={40} className={"h-full w-30"}/>
    </div>

    {/* Menu Items */}
    <nav className="flex-1 flex flex-col gap-2">
      {menuItems.map((item) => {
        const isActive = pathname.includes(item.link);
        const IconComponent = item.icon;
        const isMessageTab = item.link === "/owner/chats";
        const isNotificationTab = item.link === "/owner/notifications";
        return (
          <Link
            key={item.link}
            href={item.link}
            className={`px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:bg-grey-c100 relative ${
              isActive
                ? "bg-grey-c100 text-primary-c700 font-bold"
                : "text-primary-c500 font-medium"
            }`}
          >
            <IconComponent className="text-xl"/>
            {item.name}
            {isMessageTab && Number(countChat)>0  && (
              <span className="ml-auto bg-support-c900 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                {Number(countChat) > 99 ? '99+' : countChat}
              </span>
            )}
            {isNotificationTab && Number(countNotification)>0  && (
              <span className="ml-auto bg-support-c900 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                {Number(countNotification) > 99 ? '99+' : countNotification}
              </span>
            )}
          </Link>
        );
      })}
    </nav>

    {/* Divider */}
    <div className={"border border-grey-c200 w-full"}></div>

    {/* Avatar */}
    <Link href={"/owner/profile"}>
    <div className="flex items-center gap-3 px-4 py-3 bg-grey-c100 rounded-lg mt-2 cursor-pointer">

        <div
          className="w-[40px] h-[40px] rounded-full overflow-hidden border-2 border-primary-c200 flex items-center justify-center">
          {dataUser?.avatarUrl
            ? <Image
              width={40}
              height={40}
              src={dataUser?.avatarUrl}
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover"
            />
            : <AccountCircleRoundedIcon className="text-primary-c700 !w-[40px] !h-[40px]"/>
          }
        </div>

      <div className="flex-1 overflow-hidden">
        <p
          className="text-sm font-semibold text-grey-c800 truncate"> {dataUser?.fullName || 'Người dùng'}</p>
        <p className="text-xs text-grey-c500 truncate">{dataUser?.email}</p>
      </div>
    </div>
    </Link>
    {/* Logout Button */}
    <Button
      onClick={handleLogout}
      type={"button"}
      startIcon={<LogoutIcon/>}
      fullWidth={true}
      color={ColorButton.ERROR}
      className="mt-2"
    >
      Đăng xuất
    </Button>
  </div>;
}