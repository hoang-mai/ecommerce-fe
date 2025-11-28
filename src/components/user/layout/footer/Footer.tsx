"use client";
import React from 'react';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Link from 'next/link';
import Image from "next/image";

export default function Footer() {
  return (
    <div className="w-full bg-gray-50">
      {/* Features Section */}
      <div className="border-t border-primary-c200">
        <div className="max-w-7xl mx-auto py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 hover:shadow-lg p-4 rounded transition cursor-pointer duration-300 border-2 border-grey-c200 hover:border-primary-c300">
              <LocalShippingRoundedIcon className={"text-primary-c700"}/>
              <div>
                <h4 className="font-semibold text-sm text-grey-c900">Miễn phí vận chuyển</h4>
                <p className="text-xs text-grey-c600 ">Đơn hàng từ 500k</p>
              </div>
            </div>
            <div className="flex items-center gap-3 hover:shadow-lg p-4 rounded transition cursor-pointer duration-300 border-2 border-grey-c200 hover:border-primary-c300">
              <VerifiedUserRoundedIcon className={"text-primary-c700"}/>
              <div>
                <h4 className="font-semibold text-sm text-grey-c900">Thanh toán an toàn</h4>
                <p className="text-xs text-grey-c600">100% bảo mật</p>
              </div>
            </div>
            <div className="flex items-center gap-3 hover:shadow-lg p-4 rounded transition cursor-pointer duration-300 border-2 border-grey-c200 hover:border-primary-c300">
              <SupportAgentRoundedIcon className={"text-primary-c700"}/>
              <div>
                <h4 className="font-semibold text-sm text-grey-c900">Hỗ trợ 24/7</h4>
                <p className="text-xs text-grey-c600">Tư vấn miễn phí</p>
              </div>
            </div>
            <div className="flex items-center gap-3 hover:shadow-lg p-4 rounded transition cursor-pointer duration-300 border-2 border-grey-c200 hover:border-primary-c300">
              <PaymentsRoundedIcon className={"text-primary-c700"}/>
              <div>
                <h4 className="font-semibold text-sm text-grey-c900">Hoàn tiền dễ dàng</h4>
                <p className="text-xs text-grey-c600">Trong vòng 30 ngày</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-grey-c900 text-grey-c300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Evoway</h2>
              <p className="text-sm mb-4 leading-relaxed">
                Nền tảng thương mại điện tử hàng đầu Việt Nam, mang đến trải nghiệm mua sắm trực tuyến tuyệt vời với
                hàng triệu sản phẩm chất lượng.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <LocationOnRoundedIcon/>
                  <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà nội</span>
                </div>
                <div className="flex items-center gap-2">
                  <LocalPhoneRoundedIcon/>
                  <span>1900-xxxx (8:00 - 21:00)</span>
                </div>
                <div className="flex items-center gap-2">
                  <EmailRoundedIcon/>
                  <span>support@evoway.vn</span>
                </div>
              </div>

              <div className="flex gap-2 mt-6 item-center">
                <Link href="https://www.facebook.com/mai.anh.hoang.434872">
                  <div className={"flex items-center justify-center h-full"}>
                    <Image src={"/facebook.svg"} alt={"Facebook"} width={30} height={30} className={"w-fit h-fit"}/>
                  </div>
                </Link>
                <Link href={"https://www.instagram.com/maianhhoang3107"}>
                  <Image src={"/instagram.svg"} alt={"Instagram"} width={30} height={30} className={"w-fit h-fit"}/>
                </Link>
                <Link href={"https://www.linkedin.com/in/anh-ho%C3%A0ng-mai-49b172305/"}>
                  <Image src={"/linkedIn.svg"} alt={"LinkedIn"} width={30} height={30} className={"w-fit h-fit"}/>
                </Link>

                <Link href={"https://github.com/hoang-mai"}>
                  <div className={"flex items-center justify-center h-full"}>
                    <Image src={"/github.svg"} alt={"Github"} width={30} height={30}
                           className={"w-fit h-fit bg-white rounded-full"}/>
                  </div>
                </Link>

              </div>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-white font-semibold mb-4">Chăm sóc khách hàng</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Trung tâm trợ giúp
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Hướng dẫn mua hàng
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Vận chuyển & giao nhận
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Đổi trả & hoàn tiền
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Chính sách bảo hành
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Thanh toán
                </a></li>
              </ul>
            </div>

            {/* About Evoway */}
            <div>
              <h3 className="text-white font-semibold mb-4">Về Evoway</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Giới thiệu
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Tuyển dụng
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Điều khoản sử dụng
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Chính sách bảo mật
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Chính sách cookie
                </a></li>
                <li><a href="#" className="hover:text-white transition flex items-center gap-1">
                  <ChevronRightRoundedIcon/>Liên hệ với chúng tôi
                </a></li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                  <CreditCardRoundedIcon/>
                  Phương thức thanh toán
                </h4>
                <div className="flex flex-wrap gap-2">

                  <Image src={"/vnpay.svg"} alt={"VNPay"} width={70} height={70}/>
                </div>


              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p className="flex items-center justify-center gap-1">
              <span className="material-icons text-sm">copyright</span>
              2025 Evoway. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Địa chỉ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà nội, Việt Nam | GPĐKKD số 0123456789 do Sở KH & ĐT Hà Nội cấp
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
    ;
}