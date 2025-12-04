import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import {
  Calendar,
  Users,
  Stethoscope,
  Settings,
  Clock,
  LogOut,
  Bell,
  User,
  Minus,
  Square,
  X,
  FileText,
  ClipboardList,
  Pill,
  FlaskConical,
  FolderOpen,
  Building2,
  BedDouble,
  HeartPulse,
  Send,
  BarChart3,
  LayoutGrid,
  Shield
} from 'lucide-react'
import logoIcono from '../../assets/logo_icono.png'
import { Avatar, Tag, Tooltip } from 'antd'
import { useAppSelector, useAppDispatch } from '../../store'
import { logout } from '../../store/authSlice'
import { addRecentlyUsed } from '../../store/modulesSlice'
import { getModuleById, getModulesForUser } from '../../config/modules'
import type { UserRole } from '../../services/api'
import dayjs from 'dayjs'

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <img src={logoIcono} alt="Dashboard" style={{ width: 18, height: 18, borderRadius: 4 }} />,
  Clock: <Clock size={18} />,
  Calendar: <Calendar size={18} />,
  Users: <Users size={18} />,
  Stethoscope: <Stethoscope size={18} />,
  FileText: <FileText size={18} />,
  ClipboardList: <ClipboardList size={18} />,
  Pill: <Pill size={18} />,
  FlaskConical: <FlaskConical size={18} />,
  FolderOpen: <FolderOpen size={18} />,
  Building2: <Building2 size={18} />,
  BedDouble: <BedDouble size={18} />,
  HeartPulse: <HeartPulse size={18} />,
  Send: <Send size={18} />,
  BarChart3: <BarChart3 size={18} />,
  Shield: <Shield size={18} />
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

export default function TopNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [currentTime, setCurrentTime] = useState(dayjs())
  const { user } = useAppSelector((state) => state.auth)
  const { pinned, rolePermissions, userPermissions } = useAppSelector(
    (state) => state.modules
  )

  const userRole = (user?.role || 'RECEPTIONIST') as UserRole
  const username = user?.username || ''

  // Obtener módulos disponibles para el usuario (considerando permisos de rol y usuario)
  const availableModules = getModulesForUser(
    userRole,
    rolePermissions?.[userRole],
    userPermissions?.[username]
  )
  const availableModuleIds = availableModules.map((m) => m.id)

  // Obtener módulos pinneados que el usuario puede ver
  const pinnedModules = pinned
    .map((id) => getModuleById(id))
    .filter((m) => m && availableModuleIds.includes(m.id))
    .slice(0, 6) // Limitar a 6 en top navbar

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleNavigate = (path: string, moduleId?: string) => {
    if (moduleId) {
      dispatch(addRecentlyUsed(moduleId))
    }
    navigate(path)
  }

  return (
    <NavbarContainer>
      <LeftSection>
        <Tooltip title="VitaGuard">
          <Logo onClick={() => handleNavigate('/')}>
            <img src={logoIcono} alt="VitaGuard" style={{ width: 24, height: 24 }} />
          </Logo>
        </Tooltip>

        <NavItems>
          {/* Botón de Módulos */}
          <Tooltip title="Todos los Módulos">
            <ModulesButton
              $active={location.pathname === '/modulos'}
              onClick={() => handleNavigate('/modulos')}
            >
              <LayoutGrid size={18} />
              Módulos
            </ModulesButton>
          </Tooltip>

          {/* Módulos pinneados */}
          {pinnedModules.map((module) => {
            if (!module) return null
            return (
              <NavButton
                key={module.id}
                $active={location.pathname === module.path}
                onClick={() => handleNavigate(module.path, module.id)}
              >
                {ICON_MAP[module.icon]}
                {module.name}
              </NavButton>
            )
          })}
        </NavItems>
      </LeftSection>

      <CenterSection>
        <DateDisplay>
          {currentTime.format('dddd, D [de] MMMM')} • {currentTime.format('HH:mm:ss')}
        </DateDisplay>
      </CenterSection>

      <RightSection>
        <IconButton>
          <Bell />
        </IconButton>

        <Tooltip title="Configuración">
          <IconButton onClick={() => handleNavigate('/configuracion')}>
            <Settings />
          </IconButton>
        </Tooltip>

        <UserInfo>
          <Avatar
            size={28}
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
            icon={<User size={14} />}
          />
          <UserName>{user?.username}</UserName>
          <Tag color={getRoleColor(user?.role || '')} style={{ margin: 0, fontSize: 10 }}>
            {user?.role}
          </Tag>
        </UserInfo>

        <Tooltip title="Cerrar Sesión">
          <IconButton onClick={handleLogout}>
            <LogOut />
          </IconButton>
        </Tooltip>

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
    </NavbarContainer>
  )
}


const NavbarContainer = styled.header`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--color-background-soft);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  -webkit-app-region: drag;
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  -webkit-app-region: no-drag;
`

const Logo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  img {
    border-radius: 8px;
  }

  &:hover {
    transform: scale(1.05);
  }
`

const NavItems = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
`

const NavButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: ${(props) => (props.$active ? 'var(--color-primary)' : 'transparent')};
  color: ${(props) => (props.$active ? '#fff' : 'var(--color-text-secondary)')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: ${(props) => (props.$active ? 'var(--color-primary)' : 'var(--color-hover)')};
    color: ${(props) => (props.$active ? '#fff' : 'var(--color-text)')};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const ModulesButton = styled(NavButton)`
  background: ${(props) =>
    props.$active ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
  color: white;

  &:hover {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: white;
  }
`

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const DateDisplay = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag;
`

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background: var(--color-background-mute);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-hover);
    color: var(--color-text);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 10px;
  background: var(--color-background-mute);
`

const UserName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
`

const WindowControls = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 8px;
`

const ControlButton = styled.button<{ $isClose?: boolean }>`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$isClose ? '#fee2e2' : 'var(--color-hover)')};
    color: ${(props) => (props.$isClose ? '#ef4444' : 'var(--color-text)')};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`
