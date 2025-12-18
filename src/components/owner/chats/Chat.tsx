import Image from "next/image";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import React, {useEffect, useRef, useState} from "react";
import {ChatDTO, MessageDTO, UserCache} from "@/types/interface";
import {AlertType, MessageType, ShopStatus, AccountStatus} from "@/types/enum";
import {getTimeAgo} from "@/util/FnCommon";
import TextField from "@/libs/TextField";

import webSocketService from "@/services/webSocket";
import useSWR from "swr";
import {CHAT, MESSAGE} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {clearNewMessage} from "@/redux/slice/chatSlice";
import SubdirectoryArrowRightRoundedIcon from "@mui/icons-material/SubdirectoryArrowRightRounded";
import useSWRMutation from "swr/mutation";

interface Props {
  selectedChat: ChatDTO;
  currentUserId: string;
}

interface MessageBubbleProps {
  message: MessageDTO;
  isOwner: boolean;
  customer?: UserCache;

}

export default function Chat({
                               selectedChat,
                               currentUserId,
                             }: Props) {
  const {get, post} = useAxiosContext();
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const chatState = useSelector((state: RootState) => state.chat);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const previousScrollHeight = useRef<number>(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetcherIsRead = (url: string, {arg}: {
    arg: string
  }) => get<BaseResponse<never>>(`${url}?chatId=${arg}`).then(res => res.data.data);

  const {trigger} = useSWRMutation(`${MESSAGE}/make-as-read`, fetcherIsRead);

  const fetcherUploadImage = (url: string, {arg}: { arg: FormData }) =>
    post<BaseResponse<ChatDTO>>(url, arg, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);

  const {trigger: triggerUploadImage} = useSWRMutation(CHAT, fetcherUploadImage);

  const customer = selectedChat.userCacheList.find(user => user.userId !== currentUserId);
  const shopStatus = selectedChat.shopCache.shopStatus;
  const customerStatus = customer?.accountStatus;
  const canChat = shopStatus === ShopStatus.ACTIVE && customerStatus === AccountStatus.ACTIVE;

  const messagesFetcher = (url: string) =>
    get<BaseResponse<PageResponse<MessageDTO>>>(url).then((res) => res.data);

  const url = useBuildUrl({
    baseUrl: MESSAGE,
    queryParams: {
      chatId: selectedChat.chatId,
      pageNo: currentPage,
      pageSize: 25,
    },
  })

  const {data, error} = useSWR(url, messagesFetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const pageData = data?.data;

  useEffect(() => {

    if (pageData?.data) {
      setHasNextPage(pageData.hasNextPage || false);

      if (currentPage === 0) {
        // Reverse to show oldest first, newest last
        const sortedMessages = [...pageData.data].reverse();
        setMessages(sortedMessages);
      } else {
        setMessages(prev => {
          // Reverse new messages and prepend them
          const reversedNewMessages = [...pageData.data].reverse();
          const newMessages = [...reversedNewMessages, ...prev];
          return newMessages.filter((msg, index, self) =>
            index === self.findIndex((m) => m.messageId === msg.messageId)
          );
        });

        // Restore scroll position after loading more
        if (messagesContainerRef.current && previousScrollHeight.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight.current;
        }
      }

      setIsLoadingMore(false);
    }
  }, [pageData, currentPage]);

  useEffect(() => {
    if (chatState.newMessage && selectedChat.chatId === chatState.newMessage.chatId) {
      setMessages(prev => {

        const exists = prev.some(m => m.messageId === chatState.newMessage?.messageId);
        if (exists) return prev;

        // Add new message
        return [...prev, chatState.newMessage!];
      });

      // Scroll to bottom when new message arrives
      scrollToBottom(true);
      dispatch(clearNewMessage());
      if (chatState.newMessage.senderId !== currentUserId) trigger(selectedChat.chatId)
    }
  }, [chatState.newMessage, selectedChat.chatId, dispatch, trigger, currentUserId]);

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (smooth) {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
      } else {
        messagesEndRef.current?.scrollIntoView({behavior: 'instant'});
      }
    }, 100);
  };

  // Auto scroll to bottom on initial load
  useEffect(() => {
    if (currentPage === 0 && messages.length > 0) {
      scrollToBottom(false); // Instant scroll on initial load
    }
  }, [currentPage, messages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {

      if (container.scrollTop < 100 && hasNextPage && !isLoadingMore) {

        previousScrollHeight.current = container.scrollHeight;
        setIsLoadingMore(true);
        setCurrentPage(prev => prev + 1);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isLoadingMore]);

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedChat.chatId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const alert: AlertState = {
        isOpen: true,
        message: "Chỉ chấp nhận định dạng ảnh JPEG, PNG, GIF, WEBP",
        type: AlertType.ERROR,
        title: "Lỗi",
      };
      dispatch(openAlert(alert));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const alert: AlertState = {
        isOpen: true,
        message: "Kích thước file không được vượt quá 5MB",
        type: AlertType.ERROR,
        title: "Lỗi",
      };
      dispatch(openAlert(alert));
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input value
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSendImage = async () => {
    if (!selectedImage || isSending || !canChat) return;

    const customer = selectedChat.userCacheList.find(user => user.userId !== currentUserId);
    if (!customer?.userId) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const data = {
        shopId: selectedChat.shopCache.shopId,
        receiverId: customer.userId,
        messageType: MessageType.IMAGE,
        chatId: selectedChat.chatId,
      };

      formData.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}));

      await triggerUploadImage(formData);
      handleRemoveImage();
    } catch (error) {
      console.error('Error sending image:', error);
      const alert: AlertState = {
        isOpen: true,
        message: "Gửi hình ảnh thất bại. Vui lòng thử lại!",
        type: AlertType.ERROR,
        title: "Lỗi",
      };
      dispatch(openAlert(alert));
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = () => {
    if (!customer?.userId || !message.trim() || !canChat) return;

    setIsSending(true);
    const messageContent = message.trim();
    setMessage('');

    try {
      webSocketService.send('/app/private', {
        shopId: "",
        chatId: selectedChat?.chatId,
        messageType: MessageType.TEXT,
        messageContent: messageContent,
        receiverId: customer?.userId
      })
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return <div className="flex-1 flex flex-col h-full overflow-hidden">
    {/* Chat Header */}
    <div className="px-6 py-4 border-b border-grey-c200 flex items-center justify-between bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        {customer?.avatarUrl ? (
          <Image
            src={customer.avatarUrl}
            alt={customer.fullName}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-c100 flex items-center justify-center">
                    <span className="text-primary-c700 font-semibold text-lg">
                      {customer?.fullName.charAt(0).toUpperCase() || '?'}
                    </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-grey-c900">{customer?.fullName || 'Người dùng'}</h3>
          <div className="flex items-center gap-2">
            <SubdirectoryArrowRightRoundedIcon className={"text-grey-c400 !w-4 !h-4"}/>

            {selectedChat.shopCache.logoUrl ? (
              <Image
                src={selectedChat.shopCache.logoUrl}
                alt={selectedChat.shopCache.shopName}
                width={20}
                height={20}
                className="w-5 h-5 rounded object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded bg-grey-c200 flex items-center justify-center">
                        <span className="text-grey-c600 font-semibold text-[10px]">
                          {selectedChat.shopCache.shopName.charAt(0).toUpperCase()}
                        </span>
              </div>
            )}
            <span className="text-sm text-grey-c500">{selectedChat.shopCache.shopName}</span>

          </div>
        </div>
      </div>
      <button className="p-2 hover:bg-grey-c100 rounded-full transition-colors">
        <MoreVertRoundedIcon/>
      </button>
    </div>

    {/* Messages Area */}
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-6 bg-grey-c50 space-y-4 min-h-0"
    >
      {!canChat ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-grey-c400 mb-2">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <p className="text-grey-c600 text-sm text-center font-semibold">
            {!shopStatus || shopStatus !== ShopStatus.ACTIVE ? 'Cửa hàng không khả dụng' : 'Khách hàng không khả dụng'}
          </p>
          <p className="text-grey-c500 text-xs text-center mt-1">
            {shopStatus === ShopStatus.INACTIVE
              ? 'Cửa hàng đang tạm ngưng hoạt động'
              : shopStatus === ShopStatus.SUSPENDED
                ? 'Cửa hàng đã bị tạm khóa'
                : customerStatus === AccountStatus.INACTIVE
                  ? 'Khách hàng đang tạm ngưng hoạt động'
                  : 'Khách hàng đã bị khóa'}
          </p>
        </div>
      ) : (
        <>
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-c700"></div>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-grey-c400 mb-2">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-grey-c600 text-sm">Bắt đầu cuộc trò chuyện với {customer?.fullName || 'khách hàng'}</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.messageId}
                  message={msg}
                  isOwner={msg.senderId === currentUserId}
                  customer={customer}
                />
              ))}
              <div ref={messagesEndRef}/>
            </>
          )}
        </>
      )}
    </div>

    {/* Input Area */}
    <div className="border-t border-grey-c200 p-4 bg-white flex-shrink-0">
      {!canChat ? (
        <div className="text-center py-2">
          <p className="text-grey-c500 text-sm">
            {!shopStatus || shopStatus !== ShopStatus.ACTIVE
              ? 'Không thể gửi tin nhắn khi cửa hàng không khả dụng'
              : 'Không thể gửi tin nhắn cho khách hàng này'}
          </p>
        </div>
      ) : (
        <>
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <div className="relative rounded-lg overflow-hidden border-2 border-primary-c700">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-support-c500 text-white rounded-full hover:bg-support-c700 transition-colors"
                  title="Xóa ảnh"
                >
                  <CloseRoundedIcon fontSize="small"/>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="p-2 text-grey-c600 hover:text-primary-c700 hover:bg-primary-c50 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Gửi hình ảnh"
            >
              <ImageRoundedIcon className="!text-xl"/>
            </button>

            <div className="flex-1 relative">
              <TextField
                value={message}
                onChange={(e) => setMessage(e)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="pr-10"
                disabled={!!selectedImage}
              />
            </div>

            <button
              onClick={selectedImage ? handleSendImage : handleSendMessage}
              disabled={(selectedImage ? false : !message.trim()) || isSending}
              className="p-2 bg-primary-c700 text-white rounded-full hover:bg-primary-c800 disabled:bg-grey-c300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              title={selectedImage ? "Gửi ảnh" : "Gửi tin nhắn"}
            >
              <SendRoundedIcon className="!text-xl"/>
            </button>
          </div>
        </>
      )}
    </div>
  </div>
}

function MessageBubble({message, isOwner, customer}: MessageBubbleProps) {
  const getMessageContent = () => {
    switch (message.messageType) {
      case MessageType.TEXT:
        return <p className="whitespace-pre-wrap break-words">{message.messageContent}</p>;

      case MessageType.IMAGE:
        return (
          <div className="max-w-[300px]">
            <Image
              src={message.messageContent}
              alt="Message image"
              width={300}
              height={300}
              className="rounded-lg object-cover"
            />
          </div>
        );

      case MessageType.GIF:
        return (
          <div className="bg-white p-3 rounded-lg border border-grey-c200">
            <p className="text-sm text-grey-c700">📦 Sản phẩm</p>
            <p className="text-xs text-grey-c500 mt-1">{message.messageContent}</p>
          </div>
        );

      case MessageType.OTHER:
        return (
          <div className="bg-white p-3 rounded-lg border border-grey-c200">
            <p className="text-sm text-grey-c700">🛒 Đơn hàng</p>
            <p className="text-xs text-grey-c500 mt-1">{message.messageContent}</p>
          </div>
        );

      default:
        return <p>{message.messageContent}</p>;
    }
  };

  return (
    <div className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[70%] ${isOwner ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwner && (
          <div className="flex-shrink-0">
            {customer?.avatarUrl ? (
              <Image
                src={customer.avatarUrl}
                alt={customer.fullName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-c100 flex items-center justify-center">
                <span className="text-primary-c700 font-semibold text-xs">
                  {customer?.fullName.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div>
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwner
                ? 'bg-primary-c700 text-white rounded-br-md'
                : 'bg-white text-grey-c900 border border-grey-c200 rounded-bl-md'
            }`}
          >
            {getMessageContent()}
            {message.isEdited && (
              <span className={`text-xs ml-2 ${isOwner ? 'text-primary-c100' : 'text-grey-c500'}`}>
                (đã chỉnh sửa)
              </span>
            )}
          </div>
          <p className={`text-xs text-grey-c500 mt-1 ${isOwner ? 'text-right' : 'text-left'}`}>
            {getTimeAgo(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

