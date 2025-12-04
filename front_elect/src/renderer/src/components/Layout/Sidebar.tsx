import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import {
  Calendar,
  Users,
  Stethoscope,
  Settings,
  Search,
  Clock,
  LogOut,
  FileText,
  ClipboardList,
  Pill,
  FlaskConical,
  FolderOpen,
  BedDouble,
  Building2,
  HeartPulse,
  Send,
  BarChart3,
  LayoutGrid,
  Shield
} from 'lucide-react'
import logoIcono from '../../assets/logo_icono.png'
import { Tooltip } from 'antd'
import { useAppSelector, useAppDispatch } from '../../store'
import { logout } from '../../store/authSlice'
import { addRecentlyUsed } from '../../store/modulesSlice'
import { getModuleById, getModulesForUser } from '../../config/modules'
import type { UserRole } from '../../services/api'

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <img src={logoIcono} alt="Dashboard" style={{ width: 20, height: 20, borderRadius: 4 }} />,
  Clock: <Clock />,
  Calendar: <Calendar />,
  Users: <Users />,
  Stethoscope: <Stethoscope />,
  FileText: <FileText />,
  ClipboardList: <ClipboardList />,
  Pill: <Pill />,
  FlaskConical: <FlaskConical />,
  FolderOpen: <FolderOpen />,
  Building2: <Building2 />,
  BedDouble: <BedDouble />,
  HeartPulse: <HeartPulse />,
  Send: <Send />,
  BarChart3: <BarChart3 />,
  Shield: <Shield />
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
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
    <SidebarContainer>
      <Tooltip title="VitaGuard" placement="right">
        <Logo onClick={() => handleNavigate('/')}>
          <img src={logoIcono} alt="VitaGuard" style={{ width: 28, height: 28 }} />
        </Logo>
      </Tooltip>

      <NavSection>
        {/* Botón de Módulos - siempre visible */}
        <Tooltip title="Todos los Módulos" placement="right">
          <NavButton
            $active={location.pathname === '/modulos'}
            onClick={() => handleNavigate('/modulos')}
            $isModules
          >
            <LayoutGrid />
          </NavButton>
        </Tooltip>

        <Divider />

        {/* Módulos pinneados */}
        {pinnedModules.map((module) => {
          if (!module) return null
          return (
            <Tooltip key={module.id} title={module.name} placement="right">
              <NavButton
                $active={location.pathname === module.path}
                onClick={() => handleNavigate(module.path, module.id)}
              >
                {ICON_MAP[module.icon]}
              </NavButton>
            </Tooltip>
          )
        })}

        {pinnedModules.length === 0 && (
          <EmptyHint>
            <Tooltip title="Agrega módulos desde la página de Módulos" placement="right">
              <span>Sin módulos fijados</span>
            </Tooltip>
          </EmptyHint>
        )}
      </NavSection>

      <BottomSection>
        <Divider />
        <Tooltip title="Buscar" placement="right">
          <ActionButton>
            <Search />
          </ActionButton>
        </Tooltip>
        <Tooltip title="Configuración" placement="right">
          <NavButton
            $active={location.pathname.startsWith('/configuracion')}
            onClick={() => handleNavigate('/configuracion')}
          >
            <Settings />
          </NavButton>
        </Tooltip>
        <Tooltip title="Cerrar Sesión" placement="right">
          <NavButton onClick={handleLogout}>
            <LogOut />
          </NavButton>
        </Tooltip>
      </BottomSection>
    </SidebarContainer>
  )
}


const SidebarContainer = styled.aside`
  width: 80px;
  background: var(--color-background-soft);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  gap: 12px;
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-left: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  height: calc(100vh - 32px);
  transition: all 0.3s ease;
`

const Logo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  img {
    border-radius: 10px;
  }

  &:hover {
    transform: scale(1.05);
  }
`

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  width: 100%;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 0;
  }
`

const NavButton = styled.button<{ $active?: boolean; $isModules?: boolean }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: none;
  background: ${(props) =>
    props.$active
      ? 'var(--color-primary)'
      : props.$isModules
        ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        : 'transparent'};
  color: ${(props) => (props.$active || props.$isModules ? '#fff' : 'var(--color-text-secondary)')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$active
        ? 'var(--color-primary)'
        : props.$isModules
          ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
          : 'var(--color-hover)'};
    color: ${(props) => (props.$active || props.$isModules ? '#fff' : 'var(--color-text)')};
    transform: translateY(-2px);
  }

  svg {
    width: 22px;
    height: 22px;
    stroke-width: 2px;
  }
`

const ActionButton = styled(NavButton)`
  background: var(--color-background-mute);
  color: var(--color-text);

  &:hover {
    background: var(--color-hover);
  }
`

const Divider = styled.div`
  width: 32px;
  height: 1px;
  background: var(--color-border);
  margin: 8px 0;
`

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: center;
`

const EmptyHint = styled.div`
  font-size: 10px;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 8px;
  opacity: 0.6;

  span {
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
`
