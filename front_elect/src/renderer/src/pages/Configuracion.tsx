import { Card, Typography, Button, Tag, Avatar, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { User, Sun, Moon, Monitor, LogOut, Info, Palette, Settings, ChevronRight, Shield } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store'
import { logout } from '../store/authSlice'
import { ThemeMode } from '@shared/types'
import { useTheme } from '../context/ThemeProvider'
import { useUserTheme } from '../hooks/useSettings'

const { Title, Text } = Typography

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const SectionCard = styled(Card)`
  margin-bottom: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 16px 24px;
  }

  .ant-card-head-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  }

  .ant-card-body {
    padding: 24px;
  }
`

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 197, 94, 0.1));
  border-radius: 12px;
  margin-bottom: 20px;
`

const UserInfo = styled.div`
  flex: 1;
`

const ThemeOption = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${(props) => (props.$active ? '#22c55e' : 'transparent')};
  background: ${(props) => (props.$active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0, 0, 0, 0.02)')};

  &:hover {
    background: rgba(34, 197, 94, 0.08);
  }

  svg {
    color: ${(props) => (props.$active ? '#22c55e' : 'inherit')};
  }
`

const ThemeLabel = styled.span<{ $active?: boolean }>`
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? 600 : 400)};
  color: ${(props) => (props.$active ? '#22c55e' : 'inherit')};
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);

  &:last-child {
    border-bottom: none;
  }
`

const SettingLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.02);

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`

const SettingLinkContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    DOCTOR: 'Doctor',
    NURSE: 'Enfermero/a',
    RECEPTIONIST: 'Recepcionista'
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

export default function Configuracion() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { settedTheme, setTheme } = useTheme()
  const { user } = useAppSelector((state) => state.auth)
  const { userTheme } = useUserTheme()

  const handleThemeChange = (value: ThemeMode) => {
    setTheme(value)
  }

  const goToDisplaySettings = () => {
    navigate('/configuracion/display')
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <PageContainer>
      <Title level={3} style={{ marginBottom: 24 }}>
        Configuración
      </Title>

      <SectionCard
        title={
          <>
            <User size={18} /> Perfil de Usuario
          </>
        }
      >
        <UserCard>
          <Avatar size={64} style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <UserInfo>
            <Text strong style={{ fontSize: 18, display: 'block' }}>
              {user?.username}
            </Text>
            <Tag color={getRoleColor(user?.role || '')} style={{ marginTop: 4 }}>
              {getRoleLabel(user?.role || '')}
            </Tag>
          </UserInfo>
        </UserCard>
        <Button
          danger
          icon={<LogOut size={16} />}
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          Cerrar Sesión
        </Button>
      </SectionCard>

      <SectionCard
        title={
          <>
            <Palette size={18} /> Apariencia
          </>
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Selecciona el tema de la aplicación
        </Text>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <ThemeOption $active={settedTheme === ThemeMode.light} onClick={() => handleThemeChange(ThemeMode.light)}>
              <Sun size={28} />
              <ThemeLabel $active={settedTheme === ThemeMode.light}>Claro</ThemeLabel>
            </ThemeOption>
          </Col>
          <Col span={8}>
            <ThemeOption $active={settedTheme === ThemeMode.dark} onClick={() => handleThemeChange(ThemeMode.dark)}>
              <Moon size={28} />
              <ThemeLabel $active={settedTheme === ThemeMode.dark}>Oscuro</ThemeLabel>
            </ThemeOption>
          </Col>
          <Col span={8}>
            <ThemeOption $active={settedTheme === ThemeMode.system} onClick={() => handleThemeChange(ThemeMode.system)}>
              <Monitor size={28} />
              <ThemeLabel $active={settedTheme === ThemeMode.system}>Sistema</ThemeLabel>
            </ThemeOption>
          </Col>
        </Row>

        <SettingLink onClick={goToDisplaySettings}>
          <SettingLinkContent>
            <Settings size={20} style={{ color: userTheme.colorPrimary }} />
            <div>
              <Text strong style={{ display: 'block' }}>Configuración de Pantalla</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>Color, fuentes, zoom y más opciones</Text>
            </div>
          </SettingLinkContent>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </SettingLink>

        {user?.role === 'ADMIN' && (
          <SettingLink onClick={() => navigate('/configuracion/accesos')} style={{ marginTop: 12 }}>
            <SettingLinkContent>
              <Shield size={20} style={{ color: '#ef4444' }} />
              <div>
                <Text strong style={{ display: 'block' }}>Gestión de Accesos</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Configura qué módulos puede ver cada rol</Text>
              </div>
            </SettingLinkContent>
            <ChevronRight size={20} style={{ opacity: 0.5 }} />
          </SettingLink>
        )}
      </SectionCard>

      <SectionCard
        title={
          <>
            <Info size={18} /> Acerca de
          </>
        }
      >
        <InfoRow>
          <Text type="secondary">Versión</Text>
          <Text strong>1.0.0</Text>
        </InfoRow>
        <InfoRow>
          <Text type="secondary">Aplicación</Text>
          <Text strong>Sistema Hospitalario</Text>
        </InfoRow>
        <InfoRow>
          <Text type="secondary">API Backend</Text>
          <Text code>http://localhost:2026</Text>
        </InfoRow>
        <InfoRow>
          <Text type="secondary">Descripción</Text>
          <Text>VitaGuard - Sistema de Gestión Médica</Text>
        </InfoRow>
      </SectionCard>
    </PageContainer>
  )
}
