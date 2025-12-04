import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import {
  setTheme as setThemeAction,
  setWindowStyle as setWindowStyleAction,
  setTopicPosition as setTopicPositionAction,
  setNavbarPosition as setNavbarPositionAction,
  setCustomCss as setCustomCssAction,
  setSidebarIcons as setSidebarIconsAction,
  setAssistantIconType as setAssistantIconTypeAction,
  setUserTheme as setUserThemeAction,
  setLanguage as setLanguageAction,
  type WindowStyle,
  type TopicPosition,
  type NavbarPosition,
  type AssistantIconType,
  type UserTheme,
  type SidebarIcons
} from '../store/settingsSlice'
import { ThemeMode } from '@shared/types'

export function useSettings() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      dispatch(setThemeAction(theme))
    },
    [dispatch]
  )

  const setWindowStyle = useCallback(
    (style: WindowStyle) => {
      dispatch(setWindowStyleAction(style))
    },
    [dispatch]
  )

  const setTopicPosition = useCallback(
    (position: TopicPosition) => {
      dispatch(setTopicPositionAction(position))
    },
    [dispatch]
  )

  const setNavbarPosition = useCallback(
    (position: NavbarPosition) => {
      dispatch(setNavbarPositionAction(position))
    },
    [dispatch]
  )

  const setUserTheme = useCallback(
    (theme: UserTheme) => {
      dispatch(setUserThemeAction(theme))
    },
    [dispatch]
  )

  const setCustomCss = useCallback(
    (css: string) => {
      dispatch(setCustomCssAction(css))
    },
    [dispatch]
  )

  const setSidebarIcons = useCallback(
    (icons: SidebarIcons) => {
      dispatch(setSidebarIconsAction(icons))
    },
    [dispatch]
  )

  const setAssistantIconType = useCallback(
    (type: AssistantIconType) => {
      dispatch(setAssistantIconTypeAction(type))
    },
    [dispatch]
  )

  const setLanguage = useCallback(
    (lang: string) => {
      dispatch(setLanguageAction(lang))
    },
    [dispatch]
  )

  return {
    // State
    theme: settings.theme,
    windowStyle: settings.windowStyle,
    topicPosition: settings.topicPosition,
    navbarPosition: settings.navbarPosition,
    clickAssistantToShowTopic: settings.clickAssistantToShowTopic,
    showTopicTime: settings.showTopicTime,
    pinTopicsToTop: settings.pinTopicsToTop,
    customCss: settings.customCss,
    sidebarIcons: settings.sidebarIcons,
    assistantIconType: settings.assistantIconType,
    userTheme: settings.userTheme,
    language: settings.language,
    sidebarCollapsed: settings.sidebarCollapsed,
    // Actions
    setTheme,
    setWindowStyle,
    setTopicPosition,
    setNavbarPosition,
    setUserTheme,
    setCustomCss,
    setSidebarIcons,
    setAssistantIconType,
    setLanguage,
    dispatch
  }
}

export function useNavbarPosition() {
  const dispatch = useAppDispatch()
  const navbarPosition = useAppSelector((state) => state.settings.navbarPosition)

  const setNavbarPosition = useCallback(
    (position: NavbarPosition) => {
      dispatch(setNavbarPositionAction(position))
    },
    [dispatch]
  )

  return { navbarPosition, setNavbarPosition }
}

const DEFAULT_USER_THEME: UserTheme = {
  colorPrimary: '#00b96b',
  userFontFamily: '',
  userCodeFontFamily: ''
}

export function useUserTheme() {
  const dispatch = useAppDispatch()
  const storedUserTheme = useAppSelector((state) => state.settings?.userTheme)
  
  // Ensure userTheme always has default values
  const userTheme: UserTheme = {
    ...DEFAULT_USER_THEME,
    ...storedUserTheme
  }

  const setUserTheme = useCallback(
    (theme: UserTheme) => {
      dispatch(setUserThemeAction(theme))
      // Apply CSS variables
      if (theme.colorPrimary) {
        document.documentElement.style.setProperty('--color-primary', theme.colorPrimary)
        document.documentElement.style.setProperty('--color-primary-soft', `${theme.colorPrimary}99`)
        document.documentElement.style.setProperty('--color-primary-mute', `${theme.colorPrimary}33`)
      }
      if (theme.userFontFamily) {
        document.documentElement.style.setProperty('--user-font-family', theme.userFontFamily)
      }
      if (theme.userCodeFontFamily) {
        document.documentElement.style.setProperty('--user-code-font-family', theme.userCodeFontFamily)
      }
    },
    [dispatch]
  )

  const initUserTheme = useCallback(() => {
    if (userTheme?.colorPrimary) {
      document.documentElement.style.setProperty('--color-primary', userTheme.colorPrimary)
      document.documentElement.style.setProperty('--color-primary-soft', `${userTheme.colorPrimary}99`)
      document.documentElement.style.setProperty('--color-primary-mute', `${userTheme.colorPrimary}33`)
    }
    if (userTheme?.userFontFamily) {
      document.documentElement.style.setProperty('--user-font-family', userTheme.userFontFamily)
    }
    if (userTheme?.userCodeFontFamily) {
      document.documentElement.style.setProperty('--user-code-font-family', userTheme.userCodeFontFamily)
    }
  }, [userTheme])

  return { userTheme, setUserTheme, initUserTheme }
}
