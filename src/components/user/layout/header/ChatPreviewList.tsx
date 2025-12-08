'use client';
import React, {useEffect, useState} from 'react';
import {ChatDTO} from '@/types/interface';
import {MessageType} from '@/types/enum';
import Image from 'next/image';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import {getTimeAgo, getCurrentUserId} from "@/util/FnCommon";
import TextField from "@/libs/TextField";
import useSWR, {mutate} from "swr";
import {CHAT, MESSAGE} from "@/services/api";

import {useAxiosContext} from "@/components/provider/AxiosProvider";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import {useDebounce} from "@/hooks/useDebounce";
import {useDispatch} from "react-redux";
import {openChat} from "@/redux/slice/chatSlice";
import useSWRMutation from "swr/mutation";
import {useDropdownContext} from "@/libs/DropdownMenu";


export default function ChatPreviewList() {
  const {get} = useAxiosContext();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");
  const debounce = useDebounce(keyword);
  const urlChats= useBuildUrl({
    baseUrl: CHAT,
    queryParams:{
      page: currentPage,
      pageSize: 10,
      keyword: debounce || undefined,
    }
  })
  const fetcherChats = (url: string) => get<BaseResponse<PageResponse<ChatDTO>>>(url).then(res => res.data);
  const {data: dataChats} = useSWR(urlChats, fetcherChats, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const pageData = dataChats?.data;
  const chats= pageData?.data || [];

  return (
    <div className="w-[350px] max-h-[400px] overflow-y-auto">
      <div className={"p-4"}>
        <TextField
        value={keyword}
        onChange={(e) => setKeyword(e)}
        placeholder="Tìm kiếm tin nhắn, người dùng, shop..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setCurrentPage(0);
          }
        }}
      /></div>
      {(!chats || chats.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="text-grey-c400 mb-2">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p className="text-grey-c600 text-sm">Chưa có tin nhắn nào</p>
          </div>
        ) :
        (chats.map((chat) => (
          <ChatPreviewItem
            key={chat.chatId}
            chat={chat}
          />
        )))}

    </div>
  );
}

interface ChatPreviewItemProps {
  chat: ChatDTO;
}

function ChatPreviewItem({chat}: ChatPreviewItemProps) {
  const {get} = useAxiosContext();
  const dispatch = useDispatch();
  const {closeDropdown} = useDropdownContext();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const fetcherIsRead = (url: string, {arg}:{arg: string}) => get<BaseResponse<never>>(`${url}?chatId=${arg}`).then(res => res.data.data);

  const {trigger} = useSWRMutation(`${MESSAGE}/make-as-read`, fetcherIsRead);
  useEffect(() => {
    const token= localStorage.getItem('accessToken');
    if (token) {
      const userId = getCurrentUserId(token);
      setTimeout(()=>{
        setCurrentUserId(userId);
      },0)
    }
  }, []);

  const isUnread = !chat.lastMessage.readBy.includes(currentUserId);
  const handleChatClick = () => {
    if(isUnread) {
      trigger(chat.chatId).then(() => {
        mutate(`${MESSAGE}/count-unread`);
      });
    }

    const chatState: ChatState = {
      isOpen : true,
      chatId: chat.chatId,
    }
    dispatch(openChat(chatState));
    closeDropdown();
  };
  const getMessagePreview = () => {
    if (!chat.lastMessage) return 'Chưa có tin nhắn';

    const isSentByMe = chat.lastMessage.senderId === currentUserId;
    const prefix = isSentByMe ? 'Bạn: ' : '';

    switch (chat.lastMessage.messageType) {
      case MessageType.TEXT:
        return `${prefix}${chat.lastMessage.messageContent}`;
      case MessageType.IMAGE:
        return (
          <span className="flex items-center gap-1">
            <ImageRoundedIcon className="!text-base"/>
            {prefix}Hình ảnh
          </span>
        );
      case MessageType.GIF:
        return (
          <span className="flex items-center gap-1">
            <ShoppingBagRoundedIcon className="!text-base"/>
            {prefix}Sản phẩm
          </span>
        );
      case MessageType.OTHER:
        return (
          <span className="flex items-center gap-1">
            <InventoryRoundedIcon className="!text-base"/>
            {prefix}Đơn hàng
          </span>
        );
      default:
        return `${prefix}Tin nhắn`;
    }
  };


  return (
    <div
      onClick={handleChatClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-grey-c50 cursor-pointer transition-colors border-b border-grey-c100 last:border-b-0"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 border border-grey-c200 rounded-full">
        {chat?.shopCache.logoUrl ? (
          <Image
            src={chat?.shopCache.logoUrl}
            alt={chat?.shopCache.shopName}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-c100 flex items-center justify-center">
            <span className="text-primary-c700 font-semibold text-lg">
              {chat?.shopCache.shopName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {isUnread && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-support-c900 rounded-full border-2 border-white"/>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={`text-sm truncate ${isUnread ? 'font-semibold text-grey-c900' : 'font-medium text-grey-c800'}`}>
            {chat?.shopCache.shopName}
          </h4>
          {chat.lastMessage?.createdAt && (
            <span className="text-xs text-grey-c500 ml-2 flex-shrink-0">
            {getTimeAgo(chat.lastMessage?.createdAt)}
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

