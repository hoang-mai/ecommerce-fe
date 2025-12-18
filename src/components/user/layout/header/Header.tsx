'use client';
import Image from "next/image";
import SearchInput from "@/components/user/layout/header/SearchInput";
import Information from "@/components/user/layout/header/Information";
import Link from "next/link";
import {getRoleFromJwtToken} from "@/util/FnCommon";
import {Role} from "@/types/enum";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";


export default function Header() {
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const handleOnClickSeller = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }
    if (getRoleFromJwtToken(accessToken) === Role.OWNER) {
      router.push('/owner/dashboard');
    }
  }
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }
    if (getRoleFromJwtToken(accessToken) === Role.OWNER) {
      setTimeout(()=>{
        setIsOwner(true);
      },0);
    }
  }, []);
  return (
    <header className="sticky top-0 z-header bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary-c700 to-primary-c600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-9 text-sm">
            <div className="flex items-center gap-4">
              <span className="hidden md:block">📞 Hotline: 0867254603</span>
              <span className="hidden lg:block">|</span>
              <span className="hidden lg:block">📧 support@evoway.com</span>
            </div>
            <div className="flex items-center gap-4">
              {isOwner && (
                <>
                  <button className="hover:text-primary-c100 transition-colors cursor-pointer"
                          onClick={handleOnClickSeller}>
                    Kênh người bán
                  </button>
                  <span className="hidden md:block">|</span></>
              )}
              <Link href="/help" className="hidden md:block hover:text-primary-c100 transition-colors">
                Trợ giúp
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-4 py-4 items-center">
          {/* Logo */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/evoway.svg"
                alt="Evoway Logo"
                width={160}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Search */}
          <div className="col-span-12 md:col-span-6 lg:col-span-7">
            <SearchInput/>
          </div>

          {/* User Info */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3 flex justify-end">
            <Information/>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-t border-grey-c200 bg-grey-c50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-12 overflow-x-auto scrollbar-hide">
            <Link href="/categories/electronics"
                  className="text-grey-c700 hover:text-primary-c700 whitespace-nowrap font-medium transition-colors">
              Điện tử
            </Link>
            <Link href="/categories/fashion"
                  className="text-grey-c700 hover:text-primary-c700 whitespace-nowrap font-medium transition-colors">
              Thời trang
            </Link>
            <Link href="/categories/beauty"
                  className="text-grey-c700 hover:text-primary-c700 whitespace-nowrap font-medium transition-colors">
              Làm đẹp
            </Link>
            <Link href="/categories/home"
                  className="text-grey-c700 hover:text-primary-c700 whitespace-nowrap font-medium transition-colors">
              Nhà cửa
            </Link>
            <Link href="/categories/sports"
                  className="text-grey-c700 hover:text-primary-c700 whitespace-nowrap font-medium transition-colors">
              Thể thao
            </Link>
            <Link href="/deals"
                  className="text-support-c900 hover:text-support-c800 whitespace-nowrap font-semibold transition-colors">
              🔥 Khuyến mãi hot
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}