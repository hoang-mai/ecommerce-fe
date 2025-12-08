/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {ChatDTO} from '@/types/interface';
import {MessageType, AlertType} from '@/types/enum';
import Image from 'next/image';
import useSWR, {mutate} from 'swr';
import {CHAT, MESSAGE} from '@/services/api';
import TextField from "@/libs/TextField";
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {getTimeAgo, getCurrentUserId} from '@/util/FnCommon';
import Empty from '@/libs/Empty';
import SubdirectoryArrowRightRoundedIcon from '@mui/icons-material/SubdirectoryArrowRightRounded';
import Chat from "./Chat";
import {useDebounce} from "@/hooks/useDebounce";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch, useSelector} from "react-redux";
import useSWRMutation from "swr/mutation";
import {RootState} from "@/redux/store";
import {clearNewMessage} from "@/redux/slice/chatSlice";

export default function Main() {
  const {get} = useAxiosContext();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debounce = useDebounce(searchQuery);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [allChats, setAllChats] = useState<ChatDTO[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatState = useSelector((state: RootState) => state.chat);
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userId = getCurrentUserId(token);
      setTimeout(() => {
        setCurrentUserId(userId);
      }, 0)
    }
  }, []);


  const url = useBuildUrl({
    baseUrl: CHAT,
    queryParams: {
      keyword: debounce,
      pageNo: currentPage,
      pageSize: 8
    }
  })


  const chatsFetcher = (url: string) =>
    get<BaseResponse<PageResponse<ChatDTO>>>(url).then((res) => res.data);
  const dispatch = useDispatch();
  const {data, error, isValidating} = useSWR(url, chatsFetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const pageData = data?.data;

  // Update allChats when new data arrives
  useEffect(() => {
    if (pageData?.data) {
      setAllChats(prev => {
        if (currentPage === 0) {
          // Reset for first page or new search
          return pageData.data;
        } else {
          // Append for subsequent pages
          const existingIds = new Set(prev.map(chat => chat.chatId));
          const newChats = pageData.data.filter(chat => !existingIds.has(chat.chatId));
          return [...prev, ...newChats];
        }
      });

      // Check if there are more pages
      const isLastPage = pageData.pageNo >= pageData.totalPages - 1;
      setHasMore(!isLastPage);
      setIsLoadingMore(false);
    }
  }, [pageData, currentPage]);


  useEffect(() => {
    setCurrentPage(0);
    setAllChats([]);
    setHasMore(true);
  }, [debounce]);

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
      setIsLoadingMore(false);
    }
  }, [dispatch, error]);

  const selectedChat = allChats.find((chat) => chat.chatId === selectedChatId);

  const handleChatClick = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  // Handle scroll to load more
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !hasMore || isValidating) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when scrolled 80% down
    if (scrollPercentage > 0.8) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasMore, isValidating]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  useEffect(() => {
    const newMessage = chatState.newMessage;
    if (!newMessage) return;

    const existingChat = allChats.find(chat => chat.chatId === newMessage.chatId);

    if (existingChat) {

      existingChat.lastMessage = newMessage;
      if(selectedChatId === newMessage.chatId) {
        const updatedMessage = {
          ...newMessage,
          readBy: [...(newMessage.readBy || []), currentUserId],
        };
        existingChat.lastMessage= updatedMessage;
      }

      setAllChats(prev => {

        const filtered = prev.filter(chat => chat.chatId !== newMessage.chatId);
        return [existingChat, ...filtered];
      });
    } else {
      get<BaseResponse<ChatDTO>>(`${CHAT}/chat?chatId=${newMessage.chatId}`)
        .then(res => {
          const newChat = res.data.data;
          if (newChat) {
            setAllChats(prev => [newChat, ...prev]);
          }
        });
    }
    dispatch(clearNewMessage());
  }, [chatState.newMessage, get,selectedChatId,currentUserId, dispatch]);

  return (
    <div className="h-full flex flex-col min-h-0">

      <div className="flex-1 flex bg-white rounded-lg shadow-md overflow-hidden min-h-0">
        <div className="w-96 border-r border-grey-c200 flex flex-col min-h-0">
          <div className="p-4 border-b border-grey-c200 flex-shrink-0">
            <div className="relative">

              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e)}
                placeholder="Tìm kiếm cuộc trò chuyện..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(0);
                  }
                }}
              />
            </div>
          </div>

          {/* Chat List Items */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto min-h-0"
          >
            {allChats.length === 0 && !isValidating ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <Empty/>
                <p className="text-grey-c500 text-sm mt-2">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              <>
                {allChats.map((chat) => (
                  <ChatListItem
                    key={chat.chatId}
                    chat={chat}
                    isSelected={selectedChatId === chat.chatId}
                    onClick={() => handleChatClick(chat.chatId)}
                    currentUserId={currentUserId}
                  />
                ))}
                {isLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-c700"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Detail */}
        {selectedChat ? (
          <Chat
            selectedChat={selectedChat}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-grey-c50">
            <div className="text-center">
              <div className="text-grey-c300 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-grey-c700 mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-grey-c500">Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatListItemProps {
  chat: ChatDTO;
  isSelected: boolean;
  onClick: () => void;
  currentUserId: string;
}

function ChatListItem({chat, isSelected, onClick, currentUserId}: ChatListItemProps) {
  const {get} = useAxiosContext();
  const [isUnread, setIsUnread] = useState(false);
  const fetcherIsRead = (url: string, {arg}: {
    arg: string
  }) => get<BaseResponse<never>>(`${url}?chatId=${arg}`).then(res => res.data.data);

  const {trigger} = useSWRMutation(`${MESSAGE}/make-as-read`, fetcherIsRead);

  const customer = chat.userCacheList.find(user => user.userId !== currentUserId);
  const getMessagePreview = () => {
    if (!chat.lastMessage) return 'Chưa có tin nhắn';

    switch (chat.lastMessage.messageType) {
      case MessageType.TEXT:
        return chat.lastMessage.messageContent;
      case MessageType.IMAGE:
        return '📷 Hình ảnh';
      case MessageType.GIF:
        return '📦 Sản phẩm';
      case MessageType.OTHER:
        return '🛒 Đơn hàng';
      default:
        return 'Tin nhắn';
    }
  };
  useEffect(() => {
    setTimeout(()=>{
      setIsUnread(!chat.lastMessage.readBy.includes(currentUserId));
    })
  }, [chat.lastMessage.readBy, currentUserId]);
  return (
    <div
      onClick={() => {
        onClick();
        if (isUnread) {
          trigger(chat.chatId).then(() => {
            mutate(`${MESSAGE}/count-unread`);
            setIsUnread(false);
          });
        }
      }
      }
      className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-all border-b border-grey-c100 ${
        isSelected
          ? 'bg-primary-c50 border-l-4 border-l-primary-c700'
          : 'hover:bg-grey-c50 border-l-4 border-l-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {customer?.avatarUrl ? (
          <Image
            src={customer.avatarUrl}
            alt={customer.fullName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-c100 flex items-center justify-center">
            <span className="text-primary-c700 font-semibold text-xl">
              {customer?.fullName.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        )}
        {isUnread && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-support-c900 rounded-full border-2 border-white"/>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h4
              className={`text-base truncate ${isUnread ? 'font-bold text-grey-c900' : 'font-semibold text-grey-c800'}`}>
              {customer?.fullName || 'Người dùng'}
            </h4>
            {/* Shop Info */}
            <div className="flex items-center gap-1 mt-0.5">
              <SubdirectoryArrowRightRoundedIcon className={"text-grey-c400 !w-4 !h-4"}/>
              {chat.shopCache.logoUrl ? (
                <Image
                  src={chat.shopCache.logoUrl}
                  alt={chat.shopCache.shopName}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-grey-c200 flex items-center justify-center">
                  <span className="text-grey-c600 font-semibold text-[8px]">
                    {chat.shopCache.shopName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xs text-grey-c500 truncate">
                {chat.shopCache.shopName}
              </span>
            </div>
          </div>
          {chat.lastMessage?.createdAt && (
            <span className="text-xs text-grey-c500 ml-2 flex-shrink-0">
              {getTimeAgo(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className={`text-sm truncate ${isUnread ? 'font-medium text-grey-c800' : 'text-grey-c600'}`}>
          {getMessagePreview()}
        </p>
      </div>
    </div>
  );
}

