'use client';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import {useState} from "react";
import DropdownMenu from "@/libs/DropdownMenu";
import {useRouter} from "next/navigation";
import ChangePassword from "@/components/user/layout/header/ChangePassword";
import {LOGOUT} from "@/services/api";
import {post} from "@/services/axios";
import useSWRMutation from "swr/mutation";
import {AlertType} from "@/enum";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import DisableAccount from "@/components/user/layout/header/DisableAccount";
import {useCartRef} from "@/components/context/cartContext";

const fetcher = (url: string) => post<BaseResponse<never>>(url, {}, {withCredentials: true}).then(res => res.data);

interface IconButtonProps {
  icon: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  label: string;
}

function IconButton({icon, badge, onClick, label}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2.5 bg-white hover:bg-primary-c50 rounded-full transition-all duration-200
                 border-2 border-transparent hover:border-primary-c300 group"
      aria-label={label}
    >
      <div className="text-grey-c700 group-hover:text-primary-c700 transition-colors">
        {icon}
      </div>
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
                       bg-gradient-to-r from-support-c900 to-support-c800
                       text-white text-xs font-semibold rounded-full
                       flex items-center justify-center shadow-md
                       animate-pulse">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export default function Information() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenDisableAccount, setIsOpenDisableAccount] = useState<boolean>(false);
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
  };

  const cartRef = useCartRef();

  return (
    <div className="flex items-center gap-2">
      {/* Tin nhắn */}
      <DropdownMenu
        label="Tin nhắn"
        trigger={
          <IconButton
            icon={<QuestionAnswerRoundedIcon/>}
            badge={1}
            label="Tin nhắn"
          />
        }
        align="right"
        items={[
          {
            id: 1, label: 'Không có tin nhắn mới', onClick: () => {
            }
          },
        ]}
      />

      {/* Thông báo */}
      <DropdownMenu
        label="Thông báo"
        trigger={
          <IconButton
            icon={<NotificationsRoundedIcon/>}
            badge={2}
            label="Thông báo"
          />
        }
        align="right"
        items={[
          {
            id: 1, label: 'Không có thông báo mới', onClick: () => {
            }
          },
        ]}
      />

      {/* Giỏ hàng */}
      <div
        ref={cartRef}
      >
        <IconButton
          icon={<ShoppingCartRoundedIcon/>}
          badge={3}
          label="Giỏ hàng"
          onClick={() => router.push('/cart')}
        />
      </div>


      {/* Tài khoản */}
      <div className="ml-2 pl-2 border-l-2 border-grey-c200">
        <DropdownMenu
          label="Tài khoản"
          trigger={
            <button className="flex items-center gap-2 px-3 py-2 rounded-full
                             hover:bg-primary-c50 transition-all duration-200 group">
              <AccountCircleRoundedIcon className="text-primary-c700 !text-4xl"/>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-xs text-grey-c600">Tài khoản</span>
                <span className="text-sm font-semibold text-grey-c800 group-hover:text-primary-c700">
                  Người dùng
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
                  <LockRoundedIcon className="text-grey-c600"/>
                  <span>Đổi mật khẩu</span>
                </div>
              ),
              onClick: () => setIsOpen(true)
            },
            {
              id: 3,
              label: (
                <div className="flex items-center gap-2">
                  <BlockRoundedIcon className="text-yellow-c700"/>
                  <span>Vô hiệu hóa tài khoản</span>
                </div>
              ),
              onClick: () => setIsOpenDisableAccount(true)
            },
            {id: 4, label: 'Divider', divider: true},
            {
              id: 5,
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
    </div>
  );
}