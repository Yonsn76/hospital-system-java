import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ThemeMode } from '@shared/types'

export type WindowStyle = 'transparent' | 'opaque'
export type TopicPosition = 'left' | 'right'
export type NavbarPosition = 'left' | 'top'
export type AssistantIconType = 'model' | 'emoji' | 'none'

export interface UserTheme {
  colorPrimary: string
  userFontFamily: string
  userCodeFontFamily: string
}

export interface SidebarIcons {
  visible: string[]
  disabled: string[]
}

export interface SettingsState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  // Display Settings
  windowStyle: WindowStyle
  topicPosition: TopicPosition
  navbarPosition: NavbarPosition
  clickAssistantToShowTopic: boolean
  showTopicTime: boolean
  pinTopicsToTop: boolean
  customCss: string
  sidebarIcons: SidebarIcons
  assistantIconType: AssistantIconType
  userTheme: UserTheme
  language: string
}

export const DEFAULT_SIDEBAR_ICONS = ['dashboard', 'pacientes', 'doctores', 'citas', 'calendario', 'configuracion']

const initialState: SettingsState = {
  theme: ThemeMode.system,
  sidebarCollapsed: false,
  // Display Settings
  windowStyle: 'opaque',
  topicPosition: 'right',
  navbarPosition: 'left',
  clickAssistantToShowTopic: false,
  showTopicTime: true,
  pinTopicsToTop: false,
  customCss: '',
  sidebarIcons: {
    visible: DEFAULT_SIDEBAR_ICONS,
    disabled: []
  },
  assistantIconType: 'model',
  userTheme: {
    colorPrimary: '#00b96b',
    userFontFamily: '',
    userCodeFontFamily: ''
  },
  language: 'es'
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setWindowStyle: (state, action: PayloadAction<WindowStyle>) => {
      state.windowStyle = action.payload
    },
    setTopicPosition: (state, action: PayloadAction<TopicPosition>) => {
      state.topicPosition = action.payload
    },
    setNavbarPosition: (state, action: PayloadAction<NavbarPosition>) => {
      state.navbarPosition = action.payload
    },
    setClickAssistantToShowTopic: (state, action: PayloadAction<boolean>) => {
      state.clickAssistantToShowTopic = action.payload
    },
    setShowTopicTime: (state, action: PayloadAction<boolean>) => {
      state.showTopicTime = action.payload
    },
    setPinTopicsToTop: (state, action: PayloadAction<boolean>) => {
      state.pinTopicsToTop = action.payload
    },
    setCustomCss: (state, action: PayloadAction<string>) => {
      state.customCss = action.payload
    },
    setSidebarIcons: (state, action: PayloadAction<SidebarIcons>) => {
      state.sidebarIcons = action.payload
    },
    setAssistantIconType: (state, action: PayloadAction<AssistantIconType>) => {
      state.assistantIconType = action.payload
    },
    setUserTheme: (state, action: PayloadAction<UserTheme>) => {
      state.userTheme = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    }
  }
})

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setWindowStyle,
  setTopicPosition,
  setNavbarPosition,
  setClickAssistantToShowTopic,
  setShowTopicTime,
  setPinTopicsToTop,
  setCustomCss,
  setSidebarIcons,
  setAssistantIconType,
  setUserTheme,
  setLanguage
} = settingsSlice.actions

export default settingsSlice.reducer
