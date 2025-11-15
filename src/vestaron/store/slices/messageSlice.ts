import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MessageState {
  value: string
}

const initialState: MessageState = {
  value: '',
}

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    },
    clearMessage: (state) => {
      state.value = ''
    },
  },
})

export const { setMessage, clearMessage } = messageSlice.actions
export default messageSlice.reducer

