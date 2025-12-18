'use client';
import React, {useState, useRef, useEffect} from 'react';
import {ChatDTO, MessageDTO} from '@/types/interface';
import {AlertType, MessageType, ShopStatus} from '@/types/enum';
import Image from 'next/image';
import {formatDistanceToNow} from 'date-fns';
import {vi} from 'date-fns/locale';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import useSWR from "swr";
import {CHAT, MESSAGE} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {closeChat, clearNewMessage} from "@/redux/slice/chatSlice";
import StoreRoundedIcon from "@mui/icons-material/Storefront";
import TextField from "@/libs/TextField";
import webSocketService from "@/services/webSocket";
import {getCurrentUserId} from "@/util/FnCommon";
import {openAlert} from "@/redux/slice/alertSlice";
import useSWRMutation from "swr/mutation";

export default function Chat() {
  const chatData = useSelector((state: RootState) => state.chat);
  const {get,post} = useAxiosContext();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string >('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const previousScrollHeight = useRef<number>(0);
  const [chatId, setChatId] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetcherCreateChatOrUploadFile = (url: string, { arg }: { arg: FormData }) => post<BaseResponse<ChatDTO>>(url, arg,{
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data);

  const {trigger: triggerCreateChatOrUploadFile} = useSWRMutation(CHAT, fetcherCreateChatOrUploadFile);

  const fetcherIsRead = (url: string, {arg}:{arg: string}) => get<BaseResponse<never>>(`${url}?chatId=${arg}`).then(res => res.data.data);

  const {trigger} = useSWRMutation(`${MESSAGE}/make-as-read`, fetcherIsRead);

  const url = useBuildUrl({
    baseUrl: `${CHAT}/chat`,
    queryParams: chatData.shopId
      ? {shopId: chatData.shopId}
      : {chatId: chatData.chatId},
  });

  const fetcher = (url: string) => get<BaseResponse<ChatDTO>>(url).then(res => res.data);
  const {data, error} = useSWR((chatData.shopId || chatData.chatId) ? url : null, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });



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

  const chat = data?.data;

  useEffect(() => {
      setChatId(chat?.chatId || '');
  }, [chat?.chatId]);
  const urlMessages = useBuildUrl({
    baseUrl: MESSAGE,
    queryParams: {
      chatId: chatId,
      pageNo: currentPage,
      pageSize: 25,
    }
  });
  const fetcherMessages = (url: string) => get<BaseResponse<PageResponse<MessageDTO>>>(url).then(res => res.data);
  const {data: dataMessages} = useSWR(chatId ? urlMessages : null, fetcherMessages, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const pageData = dataMessages?.data;

  useEffect(() => {
    if (pageData?.data) {
      setHasNextPage(pageData.hasNextPage || false);

      if (currentPage === 0) {
        const sortedMessages = [...pageData.data].reverse();
        setMessages(sortedMessages);
      } else {
        setMessages(prev => {
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
    }else {
      setMessages([])
    }
  }, [pageData, currentPage]);

  useEffect(() => {
    if (chatData.newMessage && chatId && chatId === chatData.newMessage.chatId) {
      setMessages(prev => {
        const exists = prev.some(m => m.messageId === chatData.newMessage?.messageId);
        if (exists) return prev;


        return [...prev, chatData.newMessage!];
      });


      scrollToBottom(true);
      dispatch(clearNewMessage());
      trigger(chatId)
    }
  }, [chatData.newMessage, chatId, dispatch, trigger]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userId = getCurrentUserId(token);
      setTimeout(()=>{
        setCurrentUserId(userId);
      },0)
    }
  }, []);


  const getSenderInfo = (senderId: string) => {
    if (!chat) return { avatarUrl: '', name: '' };

    if (senderId === chat.shopCache.ownerId) {

      return {
        avatarUrl: chat.shopCache.logoUrl || '',
        name: chat.shopCache.shopName
      };
    }

    // Otherwise find from userCacheList
    const user = chat.userCacheList.find(u => u.userId === senderId);
    if (user) {
      return {
        avatarUrl: user.avatarUrl || '',
        name: user.fullName
      };
    }

    return { avatarUrl: '', name: 'Người dùng' };
  };
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (smooth) {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
      } else {
        messagesEndRef.current?.scrollIntoView({behavior: 'instant'});
      }
    }, 100);
  };

  // Auto scroll to bottom on initial load and when chat opens/minimizes
  useEffect(() => {
    if (currentPage === 0 && messages.length > 0 && chatData.isOpen && !isMinimized) {
      // Use a slight delay to ensure DOM is ready
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentPage, messages.length, chatData.isOpen, isMinimized]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // When scrolled near top, load more messages
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
    setCurrentPage(0);
  }, [chatData.chatId, chatData.shopId]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const alert: AlertState = {
          isOpen: true,
          message: "Vui lòng chọn file hình ảnh",
          type: AlertType.ERROR,
          title: "Lỗi",
        };
        dispatch(openAlert(alert));
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
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
    }

    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSendImage = async () => {
    if (!selectedImage || isSending || !shopId || !ownerId || shopStatus !== ShopStatus.ACTIVE) return;

    setIsSending(true);

    try {
      let currentChatId: string;
      const formData = new FormData();

     formData.append('file', selectedImage);


      if(!chatId){
        const data = {
          shopId: shopId,
          receiverId: ownerId,
          messageType: MessageType.IMAGE,
        };

        formData.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}));

        const res = await triggerCreateChatOrUploadFile(formData);

        if (res.data?.chatId) {
          currentChatId = res.data.chatId;
          setChatId(currentChatId);
          setMessages([res.data.lastMessage])
        } else {
          throw new Error('Failed to create chat');
        }
      } else {
        const data = {
          shopId: shopId,
          receiverId: ownerId,
          messageType: MessageType.IMAGE,
          chatId: chatId,
        };
        formData.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}));

        await triggerCreateChatOrUploadFile(formData);
      }

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

  if (!chatData.isOpen || (!chatData.chatId && !chatData.shopId)) return null;
  const logoUrl = chat?.shopCache?.logoUrl || chatData.logoUrl;
  const shopName = chat?.shopCache?.shopName || chatData.shopName;
  const shopId = chat?.shopCache?.shopId || chatData.shopId;
  const ownerId = chat?.shopCache?.ownerId || chatData.ownerId;
  const shopStatus = chat?.shopCache?.shopStatus || chatData.shopStatus;
  const handleSendMessage = async () => {
    if (!message.trim() || isSending || !shopId || !ownerId || shopStatus !== ShopStatus.ACTIVE) return;
    const messageContent = message.trim();
    setIsSending(true);
    setMessage('');
    try {
      let currentChatId: string;

      if(!chatId){
        const data = {
          shopId: shopId,
          receiverId: ownerId,
          messageContent: messageContent,
          messageType: MessageType.TEXT,
        }
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(data)], {type: 'application/json'}));
        const res = await triggerCreateChatOrUploadFile(formData);

        if (res.data?.chatId && res.data.lastMessage)  {
          currentChatId = res.data.chatId;
          setChatId(currentChatId);
          setMessages([res.data.lastMessage])
        } else {
          throw new Error('Failed to create chat');
        }
      } else {
        currentChatId = chatId;
        console.log('Sending message:', messageContent);
        webSocketService.send('/app/private',{
          chatId: currentChatId,
          messageType: MessageType.TEXT,
          messageContent: messageContent,
          shopId: shopId,
          receiverId: ownerId,
        });
      }


    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 right-6 z-50 w-[380px] bg-white shadow-2xl rounded-t-2xl border-2 border-grey-c200 flex flex-col transition-all duration-300"
      style={{
        height: isMinimized ? 'auto' : '500px',
        maxHeight: '80vh'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-c700 text-white rounded-t-xl">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={chat?.shopCache.shopName ?? 'Shop Logo'}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center border rounded-full ">
              <StoreRoundedIcon className={"!text-3xl"}/>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{shopName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            title={isMinimized ? "Mở rộng" : "Thu gọn"}
          >
            <RemoveRoundedIcon className="!text-xl"/>
          </button>
          <button
            onClick={() => {
              setMessages([])
              dispatch(closeChat())}}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            title="Đóng"
          >
            <CloseRoundedIcon className="!text-xl"/>
          </button>
        </div>
      </div>

      {/* Body - Hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-grey-c50"
          >
            {shopStatus !== ShopStatus.ACTIVE ? (
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
                <p className="text-grey-c600 text-sm text-center font-semibold">Cửa hàng không khả dụng</p>
                <p className="text-grey-c500 text-xs text-center mt-1">
                  {shopStatus === ShopStatus.INACTIVE ? 'Cửa hàng đang tạm ngưng hoạt động' : 'Cửa hàng đã bị tạm khóa'}
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
                    <p className="text-grey-c600 text-sm text-center">Bắt đầu cuộc trò chuyện
                      với {shopName}</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.messageId}
                        message={msg}
                        isCurrentUser={msg.senderId === currentUserId}
                        senderInfo={getSenderInfo(msg.senderId)}
                      />
                    ))}
                    <div ref={messagesEndRef}/>
                  </>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-grey-c200 p-3 bg-white rounded-b-xl">
            {shopStatus !== ShopStatus.ACTIVE ? (
              <div className="text-center py-2">
                <p className="text-grey-c500 text-sm">Không thể gửi tin nhắn cho cửa hàng này</p>
              </div>
            ) : (
              <>
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={120}
                        height={120}
                        className="rounded-lg object-cover border-2 border-grey-c200"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Xóa ảnh"
                      >
                        <CloseRoundedIcon className="!text-base"/>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
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
                      placeholder="Nhập tin nhắn..."
                      onKeyDown={handleKeyPress}
                      className="pr-10"
                      disabled={!!selectedImage}
                    />
                  </div>

                  <button
                    onClick={selectedImage ? handleSendImage : handleSendMessage}
                    disabled={(selectedImage ? false : !message.trim()) || isSending}
                    className="p-2 bg-primary-c700 text-white rounded-full hover:bg-primary-c800 disabled:bg-grey-c300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    title="Gửi"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <SendRoundedIcon className="!text-xl"/>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: MessageDTO;
  isCurrentUser: boolean;
  senderInfo: { avatarUrl: string; name: string };
}

function MessageBubble({message, isCurrentUser, senderInfo}: MessageBubbleProps) {
  const getMessageContent = () => {
    switch (message.messageType) {
      case MessageType.TEXT:
        return <p className="whitespace-pre-wrap break-words">{message.messageContent}</p>;

      case MessageType.IMAGE:
        return (
          <div className="max-w-[240px]">
            <Image
              src={message.messageContent}
              alt="Message image"
              width={240}
              height={240}
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

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(message.createdAt), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[85%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isCurrentUser && (
          <div className="flex-shrink-0">
            {senderInfo.avatarUrl ? (
              <Image
                src={senderInfo.avatarUrl}
                alt={senderInfo.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-c100 flex items-center justify-center">
                <span className="text-primary-c700 font-semibold text-xs">
                  {senderInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div>
          <div
            className={`px-3 py-2 rounded-2xl text-sm ${
              isCurrentUser
                ? 'bg-primary-c700 text-white rounded-br-none'
                : 'bg-white text-grey-c900 border border-grey-c200 rounded-bl-none'
            }`}
          >
            {getMessageContent()}
            {message.isEdited && (
              <span className={`text-xs ml-2 ${isCurrentUser ? 'text-primary-c100' : 'text-grey-c500'}`}>
                (đã chỉnh sửa)
              </span>
            )}
          </div>
          <p
            className={`text-xs text-grey-c500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}
          >
            {getTimeAgo()}
          </p>
        </div>
      </div>
    </div>
  );
}
