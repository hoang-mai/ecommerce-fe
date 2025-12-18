import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { MessageDTO } from '@/types/interface'

const initialState: ChatState = {
  isOpen: false,
  chatId: null,
  shopId: null,
  shopName: null,
  logoUrl: null,
  ownerId: null,
  newMessage: null,
  shopStatus: null,
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    closeChat: (state) => {
      state.isOpen = false
      state.chatId = null
      state.shopId = null
      state.shopName = null
      state.logoUrl = null
      state.ownerId = null
      state.shopStatus= null
    },
    openChat: (state, action: PayloadAction<ChatState>) => {
      state.isOpen = true
      state.chatId = action.payload.chatId
      state.shopId = action.payload.shopId
      state.shopName = action.payload.shopName
      state.logoUrl = action.payload.logoUrl
      state.ownerId = action.payload.ownerId
      state.shopStatus= action.payload.shopStatus
    },
    receiveMessage: (state, action: PayloadAction<MessageDTO>) => {
      state.newMessage = action.payload
    },
    clearNewMessage: (state) => {
      state.newMessage = null
    },
  },
})

export const { openChat, closeChat, receiveMessage, clearNewMessage } = chatSlice.actions
