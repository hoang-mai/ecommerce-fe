"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import InsightsIcon from '@mui/icons-material/Insights';
import GroupIcon from '@mui/icons-material/Group';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from "@/libs/Button";
import {AlertType, ColorButton} from "@/enum";
import { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import useSWRMutation from "swr/mutation";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {LOGOUT, USER} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import useSWR from "swr";
import {ProfileData} from "@/components/user/profile/Main";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

interface MenuItem {
  name: string;
  link: string;
  icon: SvgIconComponent;
}
export default function Sidebar(){
  const { get, post } = useAxiosContext();
  const fetcher = (url: string) => post<BaseResponse<never>>(url, {}, {withCredentials: true}).then(res => res.data);
  const fetcherUser = (url: string) => get<BaseResponse<ProfileData>>(url).then(res => res.data.data);
  const {data: dataUser} = useSWR(USER, fetcherUser, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const pathname = usePathname();
  const menuItems: MenuItem[] = [
    { name: "Tổng quan", link: "/owner/dashboard", icon: InsightsIcon },
    { name: "Nhân viên", link: "/owner/employees", icon: GroupIcon },
    { name: "Cửa hàng", link: "/owner/shops", icon: StorefrontIcon },
    { name: "Cài đặt", link: "/admin/settings", icon: ManageAccountsIcon },
  ];

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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('expiresIn');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refreshExpiresIn');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('sessionState');
      localStorage.removeItem('scope');
      router.push('/login');
    });
  }
  return <div className={"hidden md:flex sticky top-0 left-0 z-sidebar h-screen w-60 min-w-60 border-r border-grey-c200 shadow-md flex flex-col px-4 pt-8 pb-4 rounded-r-lg overflow-y-auto"}>
    {/* Logo */}
    <div className="flex items-center justify-center mb-8">
      <Image src={"/evoway.svg"} alt={"logo"} width={300} height={40} className={"h-full w-30"}/>
    </div>

    {/* Menu Items */}
    <nav className="flex-1 flex flex-col gap-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.link;
        const IconComponent = item.icon;
        return (
          <Link
            key={item.link}
            href={item.link}
            className={`px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 hover:bg-grey-c100 ${
              isActive 
                ? "bg-grey-c100 text-primary-c700 font-bold" 
                : "text-primary-c500 font-medium"
            }`}
          >
            <IconComponent className="text-xl" />
            {item.name}
          </Link>
        );
      })}
    </nav>

    {/* Divider */}
    <div className={"border border-grey-c200 w-full"}></div>

    {/* Avatar */}
    <div className="flex items-center gap-3 px-4 py-3 bg-grey-c100 rounded-lg mt-2 cursor-pointer">
      <div
        className="w-[40px] h-[40px] rounded-full overflow-hidden border-2 border-primary-c200">
        {dataUser?.avatarUrl
          ? <Image
            width={32}
            height={32}
            src={dataUser?.avatarUrl}
            alt="User Avatar"
            className="w-full h-full rounded-full object-cover"
          />
          : <AccountCircleRoundedIcon className="text-primary-c700 !text-4xl"/>
        }
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-grey-c800 truncate">{`${dataUser?.firstName} ${dataUser?.middleName} ${dataUser?.lastName}`.trim() || 'Người dùng'}</p>
        <p className="text-xs text-grey-c500 truncate">{dataUser?.email}</p>
      </div>
    </div>

    {/* Logout Button */}
    <Button
      onClick={handleLogout}
      type={"button"}
      startIcon={<LogoutIcon />}
      fullWidth={true}
      color={ColorButton.ERROR}
      className="mt-2"
    >
      Đăng xuất
    </Button>
  </div>;
}