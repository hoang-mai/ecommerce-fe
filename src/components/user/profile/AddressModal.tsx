import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import Button from "@/libs/Button";
import {AlertType, ColorButton} from "@/types/enum";
import Modal from "@/libs/Modal";
import useSWR from "swr";
import {ADDRESS} from "@/services/api";
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import CreateAddressModal from "@/components/user/profile/CreateAddressModal";
import UpdateAddressModal from "@/components/user/profile/UpdateAddressModal";
import DeleteAddressModal from "@/components/user/profile/DeleteAddressModal";
import SetDefaultAddressModal from "@/components/user/profile/SetDefaultAddressModal";
import {useAddressMapping} from "@/hooks/useAddressMapping";

export  interface ResInfoAddressDTO {
  addressId: number;
  userId: number;
  receiverName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

type Props = {
  isOpen: boolean;
  setIsOpen: () => void;
  mutateParent?: () => void;
}

export default function AddressModal({isOpen, setIsOpen, mutateParent}: Props) {
  const [isOpenAddress, setIsOpenAddress] = useState<boolean[]>([false, false, false, false]);
  const [selectedAddress, setSelectedAddress] = useState<ResInfoAddressDTO | null>(null);
  const { get } = useAxiosContext();
  const fetcher = (url: string) => get<BaseResponse<ResInfoAddressDTO[]>>(url).then(res => res.data.data);
  const {data, isLoading, error, mutate} = useSWR(`${ADDRESS}`, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const dispatch = useDispatch();
  const {getProvinceName, getWardName} = useAddressMapping();

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        title: "Lỗi tải địa chỉ",
        message: "Đã có lỗi xảy ra khi tải địa chỉ. Vui lòng thử lại sau.",
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);


  return <Modal isOpen={isOpen} onClose={setIsOpen} title={"Địa chỉ nhận hàng"} showSaveButton={false}>
    {isLoading && <Loading/>}
    <div className="space-y-4">
      {data && data.length > 0 ? data.map((address) => (
        <div
          key={address.addressId}
          className={`rounded-lg p-4 transition-all ${
            address.isDefault
              ? 'bg-primary-c50 border-2 border-primary-c500'
              : 'bg-white border border-grey-c300 hover:border-primary-c500'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <LocationOnRoundedIcon className={address.isDefault ? 'text-primary-c700' : 'text-grey-c600'}/>
              <span className="font-semibold text-grey-c800">{address.receiverName}</span>
              {address.isDefault && (
                <span className="bg-primary-c700 text-white text-xs px-2 py-1 rounded">Mặc định</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="cursor-pointer text-primary-c700 hover:text-primary-c900 text-sm font-semibold"
                onClick={() => {
                  setSelectedAddress(address);
                  setIsOpenAddress(prev => {
                    const newState = [...prev];
                    newState[1] = true;
                    return newState;
                  });
                }}
              >
                Sửa
              </button>
              <span className="text-grey-c400">|</span>
              <button
                className="cursor-pointer text-support-c700 hover:text-support-c900 text-sm font-semibold"
                onClick={() => {
                  setSelectedAddress(address);
                  setIsOpenAddress(prev => {
                    const newState = [...prev];
                    newState[2] = true;
                    return newState;
                  });
                }}
              >
                Xóa
              </button>
              {!address.isDefault && (
                <>
                  <span className="text-grey-c400">|</span>
                  <button
                    className="cursor-pointer text-grey-c700 hover:text-grey-c900 text-sm font-semibold"
                    onClick={() => {
                      setSelectedAddress(address);
                      setIsOpenAddress(prev => {
                        const newState = [...prev];
                        newState[3] = true;
                        return newState;
                      });
                    }}
                  >
                    Đặt mặc định
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <PhoneRoundedIcon className="text-grey-c600" style={{fontSize: 18}}/>
              <span className="text-grey-c700">{address.phoneNumber}</span>
            </div>
            <div className="flex items-start gap-2">
              <LocationOnRoundedIcon className="text-grey-c600" style={{fontSize: 18}}/>
              <span className="text-grey-c700">
                    {address.detail}, {getWardName(address.ward)}, {getProvinceName(address.province)}
                  </span>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center text-grey-c600 py-8">
          Chưa có địa chỉ nào
        </div>
      )}

      {/* Nút thêm địa chỉ mới */}
      <Button
        type="button"
        color={ColorButton.PRIMARY}
        fullWidth
        className="!py-3"
        onClick={() => {
          setIsOpenAddress(prevState => {
            const newState = [...prevState];
            newState[0] = true;
            return newState;
          })
        }}
      >
        + Thêm địa chỉ mới
      </Button>
    </div>

    {/* Create Address Modal */}
    {isOpenAddress[0] && <CreateAddressModal
      isOpen={isOpenAddress[0]}
      setIsOpen={() => {
        setIsOpenAddress(prevState => {
          const newState = [...prevState];
          newState[0] = false;
          return newState;
        })
      }}
      mutate={mutate}
      mutateParent={mutateParent}
    />}

    {/* Update Address Modal */}
    {isOpenAddress[1] && selectedAddress && <UpdateAddressModal
      isOpen={isOpenAddress[1]}
      setIsOpen={() => {
        setIsOpenAddress(prevState => {
          const newState = [...prevState];
          newState[1] = false;
          return newState;
        });
        setSelectedAddress(null);
      }}
      mutate={mutate}
      mutateParent={mutateParent}
      addressData={selectedAddress}
    />}

    {/* Delete Address Modal */}
    {isOpenAddress[2] && selectedAddress && <DeleteAddressModal
      isOpen={isOpenAddress[2]}
      setIsOpen={() => {
        setIsOpenAddress(prevState => {
          const newState = [...prevState];
          newState[2] = false;
          return newState;
        });
        setSelectedAddress(null);
      }}
      mutate={mutate}
      addressData={selectedAddress}
    />}

    {/* Set Default Address Modal */}
    {isOpenAddress[3] && selectedAddress && <SetDefaultAddressModal
      isOpen={isOpenAddress[3]}
      setIsOpen={() => {
        setIsOpenAddress(prevState => {
          const newState = [...prevState];
          newState[3] = false;
          return newState;
        });
        setSelectedAddress(null);
      }}
      mutate={mutate}
      mutateParent={mutateParent}
      addressData={selectedAddress}
    />}
  </Modal>;
}