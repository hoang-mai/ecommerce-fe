"use client";
import React, { useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";

import { AlertType } from "@/types/enum";
import Button from "@/libs/Button";
import { ColorButton } from "@/types/enum";
import { formatPrice } from "@/util/FnCommon";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineRounded';
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import { useAxiosContext } from "@/components/provider/AxiosProvider";
import useSWR from "swr";
import {PAYMENT} from "@/services/api";
import { useSearchParams } from "next/navigation";



const VNPAY_RESPONSE_CODES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
  "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
  "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
  "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
  "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
  "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
  "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
  "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)"
};

function MainContent() {
  const searchParams = useSearchParams();

  const params = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);

  const {get} = useAxiosContext();
  const router = useRouter();
  const dispatch = useDispatch();
  const isSuccess = params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00";
  const fetcher = (url: string) => get<never>(url).then(res => res.data);


  const queryString = new URLSearchParams(Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>)).toString();

  useSWR(`${PAYMENT}/IPN?${queryString}`, fetcher,{
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (!(params.vnp_ResponseCode && params.vnp_TransactionStatus)) {
      dispatch(openAlert({
        isOpen: true,
        message: "Không tìm thấy thông tin giao dịch",
        type: AlertType.ERROR,
        title: "Lỗi"
      }));

    }
  }, [params, dispatch]);

  const formatVNPayDate = (dateString?: string): string => {
    if (!dateString || dateString.length !== 14) return "N/A";

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);

    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
  };

  const getActualAmount = (amountString: string): number => {
    return parseInt(amountString) / 100;
  };


  if (!(params.vnp_ResponseCode && params.vnp_TransactionStatus)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <ErrorOutlineIcon className="text-support-c500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy thông tin giao dịch
          </h2>
          <Button
            color={ColorButton.PRIMARY}
            onClick={() => router.push("/")}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const responseMessage = params.vnp_ResponseCode ? VNPAY_RESPONSE_CODES[params.vnp_ResponseCode] : "Không xác định";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className={`bg-white rounded-lg shadow-md p-8 mb-6 text-center ${
          isSuccess ? 'border-t-4 border-success-c500' : 'border-t-4 border-support-c500'
        }`}>
          {isSuccess ? (
            <CheckCircleOutlineIcon className="text-success-c500 text-7xl mx-auto mb-4" />
          ) : (
            <ErrorOutlineIcon className="text-support-c500 text-7xl mx-auto mb-4" />
          )}

          <h1 className={`text-3xl font-bold mb-2 ${
            isSuccess ? 'text-success-c600' : 'text-support-c600'
          }`}>
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán không thành công"}
          </h1>

          <p className="text-gray-600 text-lg mb-4">
            {responseMessage}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-500 mb-1">Số tiền thanh toán</p>
            <p className="text-3xl font-bold text-gray-800">
              {params.vnp_Amount ? formatPrice(getActualAmount(params.vnp_Amount)) : "N/A"}
            </p>
          </div>
        </div>

        {/* Thông tin giao dịch */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            Thông tin giao dịch
          </h2>

          <div className="space-y-3">
            <InfoRow label="Mã đơn hàng" value={params.vnp_TxnRef} />
            <InfoRow label="Mã giao dịch VNPAY" value={params.vnp_TransactionNo} />

            {params.vnp_BankTranNo && (
              <InfoRow label="Mã giao dịch ngân hàng" value={params.vnp_BankTranNo} />
            )}

            <InfoRow label="Ngân hàng" value={params.vnp_BankCode} />

            {params.vnp_CardType && (
              <InfoRow
                label="Loại thanh toán"
                value={params.vnp_CardType === "ATM" ? "Thẻ ATM" : "QR Code"}
              />
            )}

            {params.vnp_PayDate && (
              <InfoRow
                label="Thời gian thanh toán"
                value={formatVNPayDate(params.vnp_PayDate)}
              />
            )}

            <InfoRow label="Nội dung thanh toán" value={params.vnp_OrderInfo} />

            <InfoRow
              label="Trạng thái"
              value={
                <span className={`font-semibold ${
                  isSuccess ? 'text-success-c600' : 'text-support-c600'
                }`}>
                  {isSuccess ? "Thành công" : "Không thành công"}
                </span>
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {isSuccess ? (
            <>
              <Button
                color={ColorButton.PRIMARY}
                onClick={() => router.push("/orders")}
              >
                Xem đơn hàng
              </Button>
              <Button
                color={ColorButton.SECONDARY}
                onClick={() => router.push("/")}
              >
                Tiếp tục mua sắm
              </Button>
            </>
          ) : (
            <>
              <Button
                color={ColorButton.SECONDARY}
                onClick={() => router.push("/")}
              >
                Về trang chủ
              </Button>
            </>
          )}
        </div>

        {/* Note */}
        <div className="mt-8 bg-primary-c50 border border-primary-c200 rounded-lg p-4">
          <p className="text-sm text-primary-c800">
            <strong>Lưu ý:</strong> Vui lòng lưu lại thông tin giao dịch để tra cứu khi cần thiết.
            {isSuccess && " Bạn có thể kiểm tra chi tiết đơn hàng trong mục 'Đơn mua'."}
          </p>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị thông tin theo dạng hàng
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}

export default function Main() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-c500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin giao dịch...</p>
        </div>
      </div>
    }>
      <MainContent />
    </Suspense>
  );
}

