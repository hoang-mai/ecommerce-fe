import {useAddressMapping} from "@/hooks/useAddressMapping";
import {ShopView} from "@/types/interface";
import InfoRow from "@/libs/InfoRow";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ProductTable from "@/components/owner/shops/[id]/general/ProductTable";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import {formatDateTime} from "@/util/FnCommon";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

interface Props {
  shop : ShopView;
  id: string;
}

export default function General({shop, id}: Props) {
  const {getProvinceName, getWardName} = useAddressMapping();
  return <div className="flex flex-col gap-6 ">
    <div className="flex flex-row justify-between flex-wrap">
      <div className="p-6 flex-1">
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin liên hệ
        </h3>
        <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
          <InfoRow
            icon={<StarRoundedIcon/>}
            label={"Giới thiệu"}
            value={shop.description}/>
          <InfoRow
            icon={<LocationOnRoundedIcon/>}
            label="Địa chỉ"
            value={`${shop.detail}, ${getWardName(shop.ward)}, ${getProvinceName(shop.province)}`}
          />
          <InfoRow
            icon={<PhoneRoundedIcon/>}
            label="Số điện thoại"
            value={shop.phoneNumber}
          />
        </div>
      </div>
      <div className="p-6 w-96">
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Lịch sử
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
            <InfoRow
              icon={<CalendarTodayRoundedIcon/>}
              label="Ngày tạo"
              value={formatDateTime(shop.createdAt)}
            />
            <InfoRow
              icon={<AccessTimeRoundedIcon/>}
              label="Cập nhật gần nhất"
              value={formatDateTime(shop.updatedAt)}
            />
          </div>
      </div>


    </div>


    {/* Product Table */}
    <ProductTable shopId={id}/>
  </div>;
}