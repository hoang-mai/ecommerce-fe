import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AlertType } from '@/type/enum'

const initialState: AlertState = {
  isOpen: false,
  title: 'Error',
  message: 'This is an error',
  type: AlertType.ERROR
}

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    closeAlert: (state) => {
      state.isOpen = false
      state.type = AlertType.ERROR
      state.title = 'Error'
      state.message = 'This is an error'
    },
    openAlert: (state, action: PayloadAction<AlertState>) => {
      state.isOpen = true
      state.title = action.payload.title
      state.message = action.payload.message
      state.type = action.payload.type
    },
  },
})

export const { openAlert, closeAlert } = alertSlice.actions
