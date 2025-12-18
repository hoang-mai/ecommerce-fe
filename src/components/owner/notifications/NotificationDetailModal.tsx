import {NotificationView} from "@/types/interface";
import Modal from "@/libs/Modal";
import {formatDateTime} from "@/util/FnCommon";
import InfoRow from "@/libs/InfoRow";
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationView
};

export default function NotificationDetailModal({isOpen, onClose, notification}: Props) {
  return <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết`} showSaveButton={false}>
    <div className="p-2">
      <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
        Thông tin thông báo
      </h3>
      <div className="bg-grey-c50 rounded-lg p-4">
        <InfoRow
          icon={<TitleRoundedIcon />}
          label="Tiêu đề"
          value={notification.title}
        />
        <InfoRow
          icon={<MessageRoundedIcon />}
          label="Nội dung"
          value={<span className="whitespace-pre-line">{notification.message}</span>}
        />
        <div className={"grid grid-cols-2"}>
          <InfoRow
          icon={<CalendarTodayRoundedIcon/>}
          label="Ngày tạo"
          value={formatDateTime(notification.createdAt)}
        />
          <InfoRow
            icon={<CalendarTodayRoundedIcon/>}
            label="Ngày cập nhật"
            value={formatDateTime(notification.updatedAt)}
          />
        </div>
      </div>
    </div>
  </Modal>
}