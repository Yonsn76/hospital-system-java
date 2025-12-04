import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Input, Dropdown, message } from 'antd'
import type { MenuProps } from 'antd'
import {
  Search,
  Clock,
  Calendar,
  Users,
  Stethoscope,
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
  Star,
  Pin,
  PinOff,
  Shield
} from 'lucide-react'
import logoIcono from '../assets/logo_icono.png'
import { useAppSelector, useAppDispatch } from '../store'
import { togglePinnedModule, toggleFavorite, addRecentlyUsed } from '../store/modulesSlice'
import { getModulesForUser, CATEGORY_LABELS, type ModuleConfig } from '../config/modules'
import { useTheme } from '../context/ThemeProvider'
import { ThemeMode } from '@shared/types'

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <img src={logoIcono} alt="Dashboard" style={{ width: 28, height: 28, borderRadius: 6 }} />,
  Clock: <Clock size={28} />,
  Calendar: <Calendar size={28} />,
  Users: <Users size={28} />,
  Stethoscope: <Stethoscope size={28} />,
  FileText: <FileText size={28} />,
  ClipboardList: <ClipboardList size={28} />,
  Pill: <Pill size={28} />,
  FlaskConical: <FlaskConical size={28} />,
  FolderOpen: <FolderOpen size={28} />,
  Building2: <Building2 size={28} />,
  BedDouble: <BedDouble size={28} />,
  HeartPulse: <HeartPulse size={28} />,
  Send: <Send size={28} />,
  BarChart3: <BarChart3 size={28} />,
  Shield: <Shield size={28} />
}

export default function Modulos() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { theme } = useTheme()
  const isDark = theme === ThemeMode.dark
  
  const { user } = useAppSelector((state) => state.auth)
  const { pinned, favorites, rolePermissions, userPermissions } = useAppSelector(
    (state) => state.modules
  )
  const [search, setSearch] = useState('')

  const userRole = user?.role || 'RECEPTIONIST'
  const username = user?.username || ''
  // Obtener módulos considerando permisos de rol y de usuario
  const availableModules = getModulesForUser(
    userRole,
    rolePermissions?.[userRole],
    userPermissions?.[username]
  )

  const filteredModules = search
    ? availableModules.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase())
      )
    : availableModules

  const handleModuleClick = (module: ModuleConfig) => {
    dispatch(addRecentlyUsed(module.id))
    navigate(module.path)
  }

  const handleTogglePin = (moduleId: string) => {
    dispatch(togglePinnedModule(moduleId))
    const isPinned = pinned.includes(moduleId)
    message.success(isPinned ? 'Removido del sidebar' : 'Agregado al sidebar')
  }

  const handleToggleFavorite = (moduleId: string) => {
    dispatch(toggleFavorite(moduleId))
  }

  const getContextMenu = (module: ModuleConfig): MenuProps['items'] => {
    const isPinned = pinned.includes(module.id)
    const isFavorite = favorites.includes(module.id)

    return [
      {
        key: 'pin',
        icon: isPinned ? <PinOff size={16} /> : <Pin size={16} />,
        label: isPinned ? 'Quitar del sidebar' : 'Fijar en sidebar',
        onClick: () => handleTogglePin(module.id)
      },
      {
        key: 'favorite',
        icon: <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />,
        label: isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos',
        onClick: () => handleToggleFavorite(module.id)
      }
    ]
  }

  // Agrupar por categoría
  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, ModuleConfig[]>)

  return (
    <Container $isDark={isDark}>
      <Header>
        <Title>Módulos</Title>
        <SearchContainer>
          <Input
            placeholder="Buscar módulos..."
            prefix={<Search size={18} color="var(--color-text-secondary)" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300, borderRadius: 20 }}
            allowClear
          />
        </SearchContainer>
      </Header>

      <Content>
        {Object.entries(groupedModules).map(([category, modules]) => (
          <CategorySection key={category}>
            <CategoryTitle>{CATEGORY_LABELS[category as ModuleConfig['category']]}</CategoryTitle>
            <ModulesGrid>
              {modules.map((module) => {
                const isPinned = pinned.includes(module.id)
                const isFavorite = favorites.includes(module.id)

                return (
                  <Dropdown
                    key={module.id}
                    menu={{ items: getContextMenu(module) }}
                    trigger={['contextMenu']}
                  >
                    <ModuleCard
                      onClick={() => handleModuleClick(module)}
                      $isDark={isDark}
                    >
                      <IconWrapper style={{ background: module.color }}>
                        {ICON_MAP[module.icon]}
                        {isPinned && (
                          <PinnedBadge>
                            <Pin size={10} />
                          </PinnedBadge>
                        )}
                        {isFavorite && (
                          <FavoriteBadge>
                            <Star size={10} fill="currentColor" />
                          </FavoriteBadge>
                        )}
                      </IconWrapper>
                      <ModuleName>{module.name}</ModuleName>
                      <ModuleDescription>{module.description}</ModuleDescription>
                    </ModuleCard>
                  </Dropdown>
                )
              })}
            </ModulesGrid>
          </CategorySection>
        ))}

        {filteredModules.length === 0 && (
          <EmptyState>
            <Search size={48} color="var(--color-text-secondary)" />
            <p>No se encontraron módulos</p>
          </EmptyState>
        )}
      </Content>
    </Container>
  )
}


const Container = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
`

const CategorySection = styled.div`
  margin-bottom: 32px;
`

const CategoryTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
`

const ModuleCard = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: ${(props) => (props.$isDark ? '#1f1f1f' : '#ffffff')};
  border-radius: 20px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    border-color: var(--color-primary);
  }
`

const IconWrapper = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`

const PinnedBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const FavoriteBadge = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const ModuleName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
`

const ModuleDescription = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--color-text-secondary);
  gap: 16px;

  p {
    font-size: 16px;
    margin: 0;
  }
`
