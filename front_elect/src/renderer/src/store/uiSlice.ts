import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UiState {
  loading: boolean
  selectedDate: string | null
}

const initialState: UiState = {
  loading: false,
  selectedDate: null
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload
    }
  }
})

export const { setLoading, setSelectedDate } = uiSlice.actions
export default uiSlice.reducer
