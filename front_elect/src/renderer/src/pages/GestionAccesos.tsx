import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Card, Switch, Button, Tabs, message, Tag, Select, Input, Empty, Spin } from 'antd'
import {
  ArrowLeft,
  Shield,
  Users,
  Stethoscope,
  UserCog,
  RotateCcw,
  Clock,
  Calendar,
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
  User,
  Search,
  RefreshCw
} from 'lucide-react'
import logoIcono from '../assets/logo_icono.png'
import { useAppSelector, useAppDispatch } from '../store'
import {
  addModuleToRole,
  removeModuleFromRole,
  resetRolePermissions,
  resetAllPermissions,
  addModuleToUser,
  removeModuleFromUser,
  resetUserPermissions,
  fetchAllPermissions,
  savePermissionToBackend
} from '../store/modulesSlice'
import { ALL_MODULES, CATEGORY_LABELS, type ModuleConfig } from '../config/modules'
import type { UserRole, UserResponse } from '../services/api'
import api from '../services/api'
import { useTheme } from '../context/ThemeProvider'
import { ThemeMode } from '@shared/types'

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <img src={logoIcono} alt="Dashboard" style={{ width: 20, height: 20, borderRadius: 4 }} />,
  Clock: <Clock size={20} />,
  Calendar: <Calendar size={20} />,
  Users: <Users size={20} />,
  Stethoscope: <Stethoscope size={20} />,
  FileText: <FileText size={20} />,
  ClipboardList: <ClipboardList size={20} />,
  Pill: <Pill size={20} />,
  FlaskConical: <FlaskConical size={20} />,
  FolderOpen: <FolderOpen size={20} />,
  Building2: <Building2 size={20} />,
  BedDouble: <BedDouble size={20} />,
  HeartPulse: <HeartPulse size={20} />,
  Send: <Send size={20} />,
  BarChart3: <BarChart3 size={20} />,
  Shield: <Shield size={20} />
}

const ROLE_INFO: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  ADMIN: { label: 'Administrador', icon: <Shield size={20} />, color: '#ef4444' },
  DOCTOR: { label: 'Doctor', icon: <Stethoscope size={20} />, color: '#3b82f6' },
  NURSE: { label: 'Enfermera', icon: <UserCog size={20} />, color: '#22c55e' },
  RECEPTIONIST: { label: 'Recepcionista', icon: <Users size={20} />, color: '#f59e0b' }
}

export default function GestionAccesos() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { theme } = useTheme()
  const isDark = theme === ThemeMode.dark

  const { user } = useAppSelector((state) => state.auth)
  const { rolePermissions, userPermissions, loading } = useAppSelector((state) => state.modules)
  const [activeTab, setActiveTab] = useState<string>('roles')
  const [activeRole, setActiveRole] = useState<UserRole>('DOCTOR')
  const [allUsers, setAllUsers] = useState<UserResponse[]>([])
  const [selectedUsername, setSelectedUsername] = useState<string>('')
  const [searchUser, setSearchUser] = useState('')

  // Cargar permisos del backend al montar el componente
  const loadPermissions = useCallback(async () => {
    try {
      await dispatch(fetchAllPermissions()).unwrap()
    } catch (error) {
      console.error('Error loading permissions:', error)
      message.error('Error al cargar permisos del servidor')
    }
  }, [dispatch])

  // Cargar usuarios y permisos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getUsers()
        // Filtrar para no mostrar ADMIN en la lista
        setAllUsers(data.filter((u) => u.role !== 'ADMIN'))
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }
    loadData()
    loadPermissions()
  }, [loadPermissions])

  // Solo ADMIN puede acceder
  if (user?.role !== 'ADMIN') {
    return (
      <Container $isDark={isDark}>
        <AccessDenied>
          <Shield size={64} color="var(--color-text-secondary)" />
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden gestionar los accesos.</p>
          <Button type="primary" onClick={() => navigate('/')}>
            Volver al Dashboard
          </Button>
        </AccessDenied>
      </Container>
    )
  }

  // Funciones para permisos por ROL
  const isModuleEnabledForRole = (moduleId: string, role: UserRole): boolean => {
    const module = ALL_MODULES.find((m) => m.id === moduleId)
    if (!module) return false
    const permissions = rolePermissions?.[role]
    const isDefault = module.roles.includes(role)
    if (permissions?.removedModules?.includes(moduleId)) return false
    if (permissions?.additionalModules?.includes(moduleId)) return true
    return isDefault
  }

  const isDefaultForRole = (moduleId: string, role: UserRole): boolean => {
    const module = ALL_MODULES.find((m) => m.id === moduleId)
    return module?.roles.includes(role) ?? false
  }

  const handleToggleModuleRole = async (moduleId: string, role: UserRole, enabled: boolean) => {
    try {
      // Actualizar estado local
      if (enabled) {
        dispatch(addModuleToRole({ role, moduleId }))
      } else {
        dispatch(removeModuleFromRole({ role, moduleId }))
      }
      // Sincronizar con backend
      await dispatch(
        savePermissionToBackend({
          role,
          moduleId,
          permissionType: enabled ? 'ADDED' : 'REMOVED'
        })
      ).unwrap()
      message.success(enabled ? 'Acceso agregado al rol' : 'Acceso removido del rol')
    } catch (error) {
      message.error('Error al guardar permiso')
      // Recargar permisos para sincronizar
      loadPermissions()
    }
  }

  const handleResetRole = async (role: UserRole) => {
    try {
      // Eliminar todos los permisos del rol en el backend
      const permissions = await api.getPermissionsByRole(role)
      for (const perm of permissions) {
        await api.deletePermission(perm.id)
      }
      dispatch(resetRolePermissions(role))
      message.success(`Permisos de ${ROLE_INFO[role].label} restaurados`)
    } catch (error) {
      message.error('Error al restaurar permisos')
      loadPermissions()
    }
  }

  // Funciones para permisos por USUARIO
  const getSelectedUserRole = (): UserRole => {
    const selectedUser = allUsers.find((u) => u.username === selectedUsername)
    return (selectedUser?.role as UserRole) || 'DOCTOR'
  }

  const isModuleEnabledForUser = (moduleId: string): boolean => {
    if (!selectedUsername) return false
    const userRole = getSelectedUserRole()
    const userPerms = userPermissions?.[selectedUsername]

    // Primero verificar permisos de usuario
    if (userPerms) {
      if (userPerms.removedModules?.includes(moduleId)) return false
      if (userPerms.additionalModules?.includes(moduleId)) return true
    }

    // Si no hay permisos de usuario, usar los del rol
    return isModuleEnabledForRole(moduleId, userRole)
  }

  const isModuleModifiedForUser = (moduleId: string): 'added' | 'removed' | null => {
    if (!selectedUsername) return null
    const userPerms = userPermissions?.[selectedUsername]
    if (!userPerms) return null
    if (userPerms.additionalModules?.includes(moduleId)) return 'added'
    if (userPerms.removedModules?.includes(moduleId)) return 'removed'
    return null
  }

  const handleToggleModuleUser = async (moduleId: string, enabled: boolean) => {
    if (!selectedUsername) return
    const userRole = getSelectedUserRole()
    try {
      // Actualizar estado local
      if (enabled) {
        dispatch(addModuleToUser({ username: selectedUsername, moduleId }))
      } else {
        dispatch(removeModuleFromUser({ username: selectedUsername, moduleId }))
      }
      // Sincronizar con backend
      await dispatch(
        savePermissionToBackend({
          role: userRole,
          username: selectedUsername,
          moduleId,
          permissionType: enabled ? 'ADDED' : 'REMOVED'
        })
      ).unwrap()
      message.success(enabled ? 'Acceso agregado al usuario' : 'Acceso removido del usuario')
    } catch (error) {
      message.error('Error al guardar permiso')
      loadPermissions()
    }
  }

  const handleResetUser = async () => {
    if (!selectedUsername) return
    try {
      // Eliminar todos los permisos del usuario en el backend
      const permissions = await api.getPermissionsByUsername(selectedUsername)
      for (const perm of permissions) {
        await api.deletePermission(perm.id)
      }
      dispatch(resetUserPermissions(selectedUsername))
      message.success('Permisos del usuario restaurados')
    } catch (error) {
      message.error('Error al restaurar permisos')
      loadPermissions()
    }
  }

  const handleResetAll = async () => {
    try {
      // Eliminar todos los permisos en el backend
      const permissions = await api.getAllPermissions()
      for (const perm of permissions) {
        await api.deletePermission(perm.id)
      }
      dispatch(resetAllPermissions())
      message.success('Todos los permisos restaurados')
    } catch (error) {
      message.error('Error al restaurar permisos')
      loadPermissions()
    }
  }

  // Agrupar módulos por categoría
  const groupedModules = ALL_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = []
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, ModuleConfig[]>)

  // Filtrar usuarios
  const filteredUsers = searchUser
    ? allUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchUser.toLowerCase())
      )
    : allUsers

  // Tabs de roles
  const roleTabItems = (['DOCTOR', 'NURSE', 'RECEPTIONIST'] as UserRole[]).map((role) => ({
    key: role,
    label: (
      <TabLabel>
        {ROLE_INFO[role].icon}
        <span>{ROLE_INFO[role].label}</span>
      </TabLabel>
    ),
    children: (
      <RoleContent>
        <RoleHeader>
          <RoleInfo>
            <RoleIcon style={{ background: ROLE_INFO[role].color }}>
              {ROLE_INFO[role].icon}
            </RoleIcon>
            <div>
              <h3>{ROLE_INFO[role].label}</h3>
              <p>Gestiona los módulos a los que tiene acceso este rol</p>
            </div>
          </RoleInfo>
          <Button icon={<RotateCcw size={16} />} onClick={() => handleResetRole(role)}>
            Restaurar
          </Button>
        </RoleHeader>
        {Object.entries(groupedModules).map(([category, modules]) => (
          <CategorySection key={category}>
            <CategoryTitle>{CATEGORY_LABELS[category as ModuleConfig['category']]}</CategoryTitle>
            <ModulesGrid>
              {modules.map((module) => {
                const isEnabled = isModuleEnabledForRole(module.id, role)
                const isDefault = isDefaultForRole(module.id, role)
                const permissions = rolePermissions?.[role]
                const isModified =
                  permissions?.additionalModules?.includes(module.id) ||
                  permissions?.removedModules?.includes(module.id)
                return (
                  <ModuleCard key={module.id} $isDark={isDark} $enabled={isEnabled}>
                    <ModuleHeader>
                      <ModuleIcon style={{ background: module.color }}>
                        {ICON_MAP[module.icon]}
                      </ModuleIcon>
                      <ModuleInfo>
                        <ModuleName>
                          {module.name}
                          {isDefault && !isModified && (
                            <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>Por defecto</Tag>
                          )}
                          {isModified && (
                            <Tag color={isEnabled ? 'green' : 'red'} style={{ marginLeft: 8, fontSize: 10 }}>
                              {isEnabled ? 'Agregado' : 'Removido'}
                            </Tag>
                          )}
                        </ModuleName>
                        <ModuleDescription>{module.description}</ModuleDescription>
                      </ModuleInfo>
                    </ModuleHeader>
                    <Switch
                      checked={isEnabled}
                      onChange={(checked) => handleToggleModuleRole(module.id, role, checked)}
                    />
                  </ModuleCard>
                )
              })}
            </ModulesGrid>
          </CategorySection>
        ))}
      </RoleContent>
    )
  }))

  // Tab principal
  const mainTabs = [
    {
      key: 'roles',
      label: (
        <TabLabel>
          <Shield size={18} />
          <span>Por Rol</span>
        </TabLabel>
      ),
      children: (
        <Tabs
          activeKey={activeRole}
          onChange={(key) => setActiveRole(key as UserRole)}
          items={roleTabItems}
          tabPosition="left"
        />
      )
    },
    {
      key: 'users',
      label: (
        <TabLabel>
          <User size={18} />
          <span>Por Usuario</span>
        </TabLabel>
      ),
      children: (
        <UserContent>
          <UserSelector>
            <Input
              placeholder="Buscar usuario..."
              prefix={<Search size={16} />}
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Seleccionar usuario"
              value={selectedUsername || undefined}
              onChange={setSelectedUsername}
              style={{ width: 300 }}
              showSearch
              optionFilterProp="children"
            >
              {filteredUsers.map((u) => (
                <Select.Option key={u.username} value={u.username}>
                  {u.firstName} {u.lastName} ({u.username})
                  <Tag color={ROLE_INFO[u.role as UserRole]?.color} style={{ marginLeft: 8 }}>
                    {ROLE_INFO[u.role as UserRole]?.label || u.role}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
            {selectedUsername && (
              <Button icon={<RotateCcw size={16} />} onClick={handleResetUser}>
                Restaurar usuario
              </Button>
            )}
          </UserSelector>

          {selectedUsername ? (
            <RoleContent>
              <RoleHeader>
                <RoleInfo>
                  <RoleIcon style={{ background: ROLE_INFO[getSelectedUserRole()]?.color || '#64748b' }}>
                    <User size={20} />
                  </RoleIcon>
                  <div>
                    <h3>{selectedUsername}</h3>
                    <p>
                      Permisos personalizados para este usuario (sobrescriben los del rol{' '}
                      <Tag color={ROLE_INFO[getSelectedUserRole()]?.color}>
                        {ROLE_INFO[getSelectedUserRole()]?.label}
                      </Tag>
                      )
                    </p>
                  </div>
                </RoleInfo>
              </RoleHeader>
              {Object.entries(groupedModules).map(([category, modules]) => (
                <CategorySection key={category}>
                  <CategoryTitle>{CATEGORY_LABELS[category as ModuleConfig['category']]}</CategoryTitle>
                  <ModulesGrid>
                    {modules.map((module) => {
                      const isEnabled = isModuleEnabledForUser(module.id)
                      const modification = isModuleModifiedForUser(module.id)
                      return (
                        <ModuleCard key={module.id} $isDark={isDark} $enabled={isEnabled}>
                          <ModuleHeader>
                            <ModuleIcon style={{ background: module.color }}>
                              {ICON_MAP[module.icon]}
                            </ModuleIcon>
                            <ModuleInfo>
                              <ModuleName>
                                {module.name}
                                {modification === 'added' && (
                                  <Tag color="green" style={{ marginLeft: 8, fontSize: 10 }}>
                                    Agregado (usuario)
                                  </Tag>
                                )}
                                {modification === 'removed' && (
                                  <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>
                                    Removido (usuario)
                                  </Tag>
                                )}
                                {!modification && (
                                  <Tag color="default" style={{ marginLeft: 8, fontSize: 10 }}>
                                    Heredado del rol
                                  </Tag>
                                )}
                              </ModuleName>
                              <ModuleDescription>{module.description}</ModuleDescription>
                            </ModuleInfo>
                          </ModuleHeader>
                          <Switch
                            checked={isEnabled}
                            onChange={(checked) => handleToggleModuleUser(module.id, checked)}
                          />
                        </ModuleCard>
                      )
                    })}
                  </ModulesGrid>
                </CategorySection>
              ))}
            </RoleContent>
          ) : (
            <Empty description="Selecciona un usuario para gestionar sus permisos" />
          )}
        </UserContent>
      )
    }
  ]

  return (
    <Container $isDark={isDark}>
      <Header>
        <BackButton onClick={() => navigate('/configuracion')}>
          <ArrowLeft size={20} />
        </BackButton>
        <HeaderInfo>
          <Title>Gestión de Accesos</Title>
          <Subtitle>Configura permisos por rol o por usuario individual</Subtitle>
        </HeaderInfo>
        <Button icon={<RefreshCw size={16} />} onClick={loadPermissions} loading={loading}>
          Sincronizar
        </Button>
        <Button danger icon={<RotateCcw size={16} />} onClick={handleResetAll}>
          Restaurar todo
        </Button>
      </Header>
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Cargando permisos..." />
        </div>
      )}
      <Content>
        <StyledCard $isDark={isDark}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={mainTabs} size="large" />
        </StyledCard>
      </Content>
    </Container>
  )
}


const Container = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  &:hover {
    background: var(--color-hover);
  }
`

const HeaderInfo = styled.div`
  flex: 1;
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 4px 0 0 0;
`

const Content = styled.div`
  flex: 1;
  overflow: hidden;
`

const StyledCard = styled(Card)<{ $isDark: boolean }>`
  height: 100%;
  border-radius: 16px;
  background: ${(props) => (props.$isDark ? '#1f1f1f' : '#ffffff')};
  .ant-card-body {
    height: 100%;
    padding: 0;
  }
  .ant-tabs {
    height: 100%;
  }
  .ant-tabs-content {
    height: calc(100% - 46px);
  }
  .ant-tabs-tabpane {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
  }
`

const TabLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const RoleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const RoleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
`

const RoleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
  }
  p {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
`

const RoleIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const CategorySection = styled.div`
  margin-bottom: 12px;
`

const CategoryTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ModulesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const ModuleCard = styled.div<{ $isDark: boolean; $enabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: ${(props) =>
    props.$enabled
      ? props.$isDark
        ? 'rgba(34, 197, 94, 0.1)'
        : 'rgba(34, 197, 94, 0.05)'
      : props.$isDark
        ? '#2a2a2a'
        : '#f8fafc'};
  border-radius: 10px;
  border: 1px solid ${(props) => (props.$enabled ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-border)')};
  opacity: ${(props) => (props.$enabled ? 1 : 0.7)};
  &:hover {
    border-color: var(--color-primary);
  }
`

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ModuleIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const ModuleInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const ModuleName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
`

const ModuleDescription = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
`

const AccessDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  text-align: center;
  h2 {
    margin: 0;
    font-size: 24px;
    color: var(--color-text);
  }
  p {
    margin: 0;
    color: var(--color-text-secondary);
  }
`

const UserContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const UserSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
`
