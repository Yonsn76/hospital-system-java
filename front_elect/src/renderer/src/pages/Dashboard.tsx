import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Tag, Avatar, message } from 'antd'
import { Calendar, Users, Stethoscope, Clock, ArrowRight, Bot, Layers, MessageSquare, CheckCircle2 } from 'lucide-react'
import api, { AppointmentResponse, AppointmentStatus } from '../services/api'
import { useAppSelector } from '../store'
import { useTheme } from '../context/ThemeProvider'
import { ThemeMode } from '@shared/types'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 16px;
`

const WelcomeSection = styled.div``

const Greeting = styled.h1`
  font-size: 42px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
  letter-spacing: -1px;

  span {
    color: var(--color-text-secondary);
  }
`

const Subtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--color-text-secondary);
  font-weight: 500;
`

const AssistantBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-background-soft);
  padding: 8px 8px 8px 20px;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
`

const BubbleText = styled.div`
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
  line-height: 1.4;
`

const AssistantAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: var(--color-gray-3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`

const FeatureCard = styled.div`
  background: var(--color-background-soft);
  border-radius: 24px;
  padding: 32px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`

const CardIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  background: ${(props) => props.$color};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--color-text);

  svg {
    width: 28px;
    height: 28px;
  }
`

const CardContent = styled.div``

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12px;
  line-height: 1.3;
`

const CardLabel = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
`

const StatCard = styled.div`
  background: var(--color-background-soft);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
`

const StatIcon = styled.div<{ $bg: string; $color: string }>`
  width: 56px;
  height: 56px;
  background: var(--color-background-mute);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color};

  svg {
    width: 24px;
    height: 24px;
  }
`

const StatInfo = styled.div``

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ViewAll = styled.button`
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-hover);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const CitasList = styled.div`
  background: var(--color-background-soft);
  border-radius: 24px;
  padding: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
`

const CitaItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--color-border-soft);
  transition: all 0.2s ease;
  border-radius: 16px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-hover);
  }
`

const CitaTime = styled.div`
  width: 80px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
    color: var(--color-text-secondary);
  }
`

const CitaInfo = styled.div`
  flex: 1;
  padding: 0 20px;
`

const CitaPatient = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
`

const CitaDoctor = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 14px;
    height: 14px;
  }
`

const getEstadoColor = (estado: AppointmentStatus) => {
  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: 'blue',
    CONFIRMED: 'green',
    IN_PROGRESS: 'orange',
    COMPLETED: 'default',
    CANCELLED: 'red',
    NO_SHOW: 'volcano'
  }
  return colors[estado] || 'default'
}

const getEstadoLabel = (estado: AppointmentStatus) => {
  const labels: Record<AppointmentStatus, string> = {
    SCHEDULED: 'Programada',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No asistió'
  }
  return labels[estado] || estado
}

export default function Dashboard() {
  const [stats, setStats] = useState({ pacientes: 0, doctores: 0, citasHoy: 0, citasPendientes: 0 })
  const [citasHoy, setCitasHoy] = useState<AppointmentResponse[]>([])
  const [, setLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)
  const { theme } = useTheme()
  const isDark = theme === ThemeMode.dark

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const userRole = user?.role

      // Fetch data based on role
      let appointments: AppointmentResponse[] = []
      let patientsCount = 0
      let doctorsCount = 0

      if (userRole === 'DOCTOR') {
        appointments = await api.getMyAppointments()
      } else if (['ADMIN', 'NURSE', 'RECEPTIONIST'].includes(userRole || '')) {
        const [allAppointments, patients, doctors] = await Promise.all([
          api.getAppointments(),
          api.getPatients(),
          api.getDoctors()
        ])
        appointments = allAppointments
        patientsCount = patients.length
        doctorsCount = doctors.length
      }

      const hoy = dayjs().format('YYYY-MM-DD')
      const citasDeHoy = appointments.filter((c) => dayjs(c.appointmentTime).format('YYYY-MM-DD') === hoy)
      const pendientes = appointments.filter((c) => c.status === 'SCHEDULED' || c.status === 'CONFIRMED')

      setStats({
        pacientes: patientsCount,
        doctores: doctorsCount,
        citasHoy: citasDeHoy.length,
        citasPendientes: pendientes.length
      })

      setCitasHoy(citasDeHoy.sort((a, b) => dayjs(a.appointmentTime).valueOf() - dayjs(b.appointmentTime).valueOf()))
    } catch (error) {
      message.error('Error al cargar datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      DOCTOR: 'Doctor',
      NURSE: 'Enfermero/a',
      RECEPTIONIST: 'Recepcionista'
    }
    return labels[user?.role || ''] || 'Usuario'
  }

  return (
    <Container>
      <Header>
        <WelcomeSection>
          <Greeting>
            Hola, {getRoleLabel()} <span>👋</span>
          </Greeting>
          <Subtitle>
            <CheckCircle2 size={18} />
            {user?.username ? `Sesión: ${user.username}` : 'Todo listo para tu jornada de hoy'}
          </Subtitle>
        </WelcomeSection>

        <AssistantBubble>
          <BubbleText>
            Tienes <strong>{stats.citasHoy} citas</strong> programadas
            <br />
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>¿Necesitas ayuda?</span>
          </BubbleText>
          <AssistantAvatar>
            <Bot size={24} />
          </AssistantAvatar>
        </AssistantBubble>
      </Header>

      <CardsGrid>
        <FeatureCard>
          <CardIcon $color={isDark ? 'rgba(255, 247, 237, 0.1)' : '#fff7ed'}>
            <Layers />
          </CardIcon>
          <CardContent>
            <CardTitle>Gestionar Citas y Horarios</CardTitle>
            <CardLabel>Agenda Médica</CardLabel>
          </CardContent>
        </FeatureCard>

        <FeatureCard>
          <CardIcon $color={isDark ? 'rgba(239, 246, 255, 0.1)' : '#eff6ff'}>
            <MessageSquare />
          </CardIcon>
          <CardContent>
            <CardTitle>Comunicación con Pacientes</CardTitle>
            <CardLabel>Mensajería</CardLabel>
          </CardContent>
        </FeatureCard>

        <FeatureCard>
          <CardIcon $color={isDark ? 'rgba(240, 253, 244, 0.1)' : '#f0fdf4'}>
            <Clock />
          </CardIcon>
          <CardContent>
            <CardTitle>Planificación Semanal</CardTitle>
            <CardLabel>Productividad</CardLabel>
          </CardContent>
        </FeatureCard>
      </CardsGrid>

      <StatsRow>
        <StatCard>
          <StatIcon $bg="#f1f5f9" $color="#1a1a2e">
            <Users />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.pacientes}</StatValue>
            <StatLabel>Pacientes</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $bg="#f1f5f9" $color="#1a1a2e">
            <Stethoscope />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.doctores}</StatValue>
            <StatLabel>Doctores</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $bg="#fff7ed" $color="#ea580c">
            <Calendar />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.citasHoy}</StatValue>
            <StatLabel>Citas Hoy</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $bg="#eff6ff" $color="#2563eb">
            <Clock />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.citasPendientes}</StatValue>
            <StatLabel>Pendientes</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsRow>

      <div>
        <SectionTitle>
          Citas de Hoy
          <ViewAll>
            Ver todas <ArrowRight />
          </ViewAll>
        </SectionTitle>

        <CitasList>
          {citasHoy.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Calendar size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>No hay citas programadas para hoy</p>
            </div>
          ) : (
            citasHoy.map((cita) => (
              <CitaItem key={cita.id}>
                <CitaTime>
                  <Clock />
                  {dayjs(cita.appointmentTime).format('HH:mm')}
                </CitaTime>
                <Avatar
                  size={40}
                  style={{
                    marginRight: 16,
                    background: 'var(--color-gray-3)',
                    color: 'white',
                    fontSize: 16
                  }}
                >
                  {cita.patientName?.[0] || '?'}
                </Avatar>
                <CitaInfo>
                  <CitaPatient>{cita.patientName}</CitaPatient>
                  <CitaDoctor>
                    <Stethoscope />
                    {cita.doctorName} - {cita.reason}
                  </CitaDoctor>
                </CitaInfo>
                <Tag color={getEstadoColor(cita.status)} style={{ borderRadius: 12, padding: '4px 12px' }}>
                  {getEstadoLabel(cita.status)}
                </Tag>
              </CitaItem>
            ))
          )}
        </CitasList>
      </div>
    </Container>
  )
}
