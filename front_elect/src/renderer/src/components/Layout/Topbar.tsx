import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Minus, Square, X, Bell, User } from 'lucide-react'
import { Avatar, Tag } from 'antd'
import { useAppSelector } from '../../store'
import dayjs from 'dayjs'

const TopbarContainer = styled.header`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  -webkit-app-region: drag;
  margin-top: 16px;
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const DateDisplay = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  background: var(--color-background-soft);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag;
`

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: none;
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--color-hover);
    color: var(--color-text);
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-background-soft);
  padding: 6px 16px 6px 6px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`

const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
`

const WindowControls = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 16px;
  background: var(--color-background-soft);
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`

const ControlButton = styled.button<{ $isClose?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$isClose ? '#fee2e2' : 'var(--color-hover)')};
    color: ${(props) => (props.$isClose ? '#ef4444' : 'var(--color-text)')};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN: 'Admin',
    DOCTOR: 'Doctor',
    NURSE: 'Enfermero/a',
    RECEPTIONIST: 'Recepción'
  }
  return labels[role] || role
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'red',
    DOCTOR: 'blue',
    NURSE: 'green',
    RECEPTIONIST: 'orange'
  }
  return colors[role] || 'default'
}

export default function Topbar() {
  const [currentTime, setCurrentTime] = useState(dayjs())
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Verificar si window.api está disponible (solo en Electron)
    if (window.api?.window) {
      window.api.window.isMaximized()
      const unsubscribe = window.api.window.onMaximizedChange(() => {})
      return unsubscribe
    }
    return undefined
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TopbarContainer className="titlebar">
      <LeftSection>
        <DateDisplay>
          {currentTime.format('dddd, D [de] MMMM')} • {currentTime.format('HH:mm:ss')}
        </DateDisplay>
      </LeftSection>

      <RightSection>
        <IconButton>
          <Bell />
        </IconButton>

        <UserInfo>
          <Avatar
            size={32}
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
            icon={<User size={16} />}
          />
          <div>
            <UserName>{user?.username}</UserName>
            <Tag color={getRoleColor(user?.role || '')} style={{ marginLeft: 8, fontSize: 11 }}>
              {getRoleLabel(user?.role || '')}
            </Tag>
          </div>
        </UserInfo>

        <WindowControls>
          <ControlButton onClick={() => window.api?.window?.minimize()}>
            <Minus />
          </ControlButton>
          <ControlButton onClick={() => window.api?.window?.maximize()}>
            <Square />
          </ControlButton>
          <ControlButton $isClose onClick={() => window.api?.window?.close()}>
            <X />
          </ControlButton>
        </WindowControls>
      </RightSection>
    </TopbarContainer>
  )
}
