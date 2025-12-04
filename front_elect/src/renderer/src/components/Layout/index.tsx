import type { ReactNode } from 'react'
import styled from 'styled-components'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import Topbar from './Topbar'
import { useTheme } from '../../context/ThemeProvider'
import { useAppSelector } from '../../store'
import { ThemeMode } from '@shared/types'

const Container = styled.div<{ $isDark: boolean; $isTopNav: boolean }>`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: ${(props) => (props.$isTopNav ? 'column' : 'row')};
  gap: 0;
  background: ${(props) => (props.$isDark ? '#181818' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)')};
  transition: background 0.3s ease;
`

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Content = styled.main<{ $isDark: boolean; $isTopNav: boolean }>`
  flex: 1;
  overflow: auto;
  padding: ${(props) => (props.$isTopNav ? '0 32px 32px 32px' : '0 32px 32px 32px')};
  background: transparent;
`

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme()
  const isDark = theme === ThemeMode.dark
  const navbarPosition = useAppSelector((state) => state.settings.navbarPosition) || 'left'
  const isTopNav = navbarPosition === 'top'

  return (
    <Container $isDark={isDark} $isTopNav={isTopNav}>
      {isTopNav ? (
        <>
          <TopNavbar />
          <Content $isDark={isDark} $isTopNav={isTopNav}>
            {children}
          </Content>
        </>
      ) : (
        <>
          <Sidebar />
          <MainArea>
            <Topbar />
            <Content $isDark={isDark} $isTopNav={isTopNav}>
              {children}
            </Content>
          </MainArea>
        </>
      )}
    </Container>
  )
}
