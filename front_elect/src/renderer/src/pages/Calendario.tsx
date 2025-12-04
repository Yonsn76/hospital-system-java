import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Stethoscope } from 'lucide-react'
import { message } from 'antd'
import api, { AppointmentResponse, AppointmentStatus } from '../services/api'
import { useAppSelector } from '../store'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekday)
dayjs.extend(weekOfYear)
dayjs.locale('es')

const Container = styled.div`
  display: flex;
  gap: 24px;
  height: calc(100vh - 120px);
  width: 100%;
  overflow: hidden;
`

const CalendarSection = styled.div`
  flex: 1;
  min-width: 0;
  background: var(--color-background-soft);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
`

const MonthTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 12px;
`

const NavButtons = styled.div`
  display: flex;
  gap: 8px;
`

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-hover);
    color: var(--color-text);
  }
`

const TodayButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-hover);
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  border-top: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  overflow: hidden;
`

const WeekDay = styled.div`
  padding: 8px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  background: var(--color-background-mute);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 1px;
`

const DayCell = styled.div<{ $isToday?: boolean; $isSelected?: boolean; $isOtherMonth?: boolean }>`
  min-height: 0;
  padding: 4px;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  background: ${(props) => (props.$isSelected ? 'var(--color-primary-mute)' : props.$isOtherMonth ? 'var(--color-background-mute)' : 'var(--color-background-soft)')};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--color-hover);
  }

  ${(props) =>
    props.$isToday &&
    `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--color-primary);
    }
  `}
`

const DayNumber = styled.div<{ $isToday?: boolean; $isOtherMonth?: boolean }>`
  font-size: 12px;
  font-weight: ${(props) => (props.$isToday ? '700' : '500')};
  color: ${(props) => (props.$isToday ? 'var(--color-primary)' : props.$isOtherMonth ? 'var(--color-text-3)' : 'var(--color-text)')};
  margin-bottom: 4px;
`

const CitaDot = styled.div<{ $color: string }>`
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background: ${(props) => props.$color}20;
  color: ${(props) => props.$color};
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 2px solid ${(props) => props.$color};
`

const SidePanel = styled.div`
  width: 300px;
  flex-shrink: 0;
  background: var(--color-background-soft);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const SideHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
`

const SelectedDateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
  text-transform: capitalize;
`

const SelectedDateSubtitle = styled.p`
  color: var(--color-text-secondary);
  font-size: 13px;
`

const CitasList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CitaCard = styled.div`
  padding: 12px;
  border-radius: 12px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-hover);
  }
`

const CitaTime = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 6px;
`

const CitaPatient = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
`

const CitaDoctor = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
`

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  gap: 12px;
  text-align: center;
  font-size: 13px;
`

const getEstadoColor = (estado: AppointmentStatus) => {
  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: '#3b82f6',
    CONFIRMED: '#22c55e',
    IN_PROGRESS: '#f59e0b',
    COMPLETED: '#64748b',
    CANCELLED: '#ef4444',
    NO_SHOW: '#f97316'
  }
  return colors[estado] || '#64748b'
}

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [citas, setCitas] = useState<AppointmentResponse[]>([])
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userRole = user?.role
      let appointments: AppointmentResponse[] = []

      if (userRole === 'DOCTOR') {
        appointments = await api.getMyAppointments()
      } else {
        appointments = await api.getAppointments()
      }

      setCitas(appointments)
    } catch {
      message.error('Error al cargar citas')
    }
  }

  const getDaysInMonth = (): dayjs.Dayjs[] => {
    const startOfMonth = currentDate.startOf('month')
    const endOfMonth = currentDate.endOf('month')
    const startDate = startOfMonth.startOf('week')
    const endDate = endOfMonth.endOf('week')

    const days: dayjs.Dayjs[] = []
    let day = startDate

    while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
      days.push(day)
      day = day.add(1, 'day')
    }

    return days
  }

  const getCitasForDate = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    return citas
      .filter((c) => dayjs(c.appointmentTime).format('YYYY-MM-DD') === dateStr && c.status !== 'CANCELLED')
      .sort((a, b) => dayjs(a.appointmentTime).valueOf() - dayjs(b.appointmentTime).valueOf())
  }

  const selectedCitas = getCitasForDate(selectedDate)

  return (
    <Container>
      <CalendarSection>
        <Header>
          <MonthTitle>
            <CalendarIcon size={24} />
            {currentDate.format('MMMM YYYY')}
          </MonthTitle>
          <NavButtons>
            <TodayButton onClick={() => setCurrentDate(dayjs())}>Hoy</TodayButton>
            <NavButton onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}>
              <ChevronLeft size={20} />
            </NavButton>
            <NavButton onClick={() => setCurrentDate(currentDate.add(1, 'month'))}>
              <ChevronRight size={20} />
            </NavButton>
          </NavButtons>
        </Header>

        <Grid>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <WeekDay key={day}>{day}</WeekDay>
          ))}
          {getDaysInMonth().map((date, index) => {
            const dayCitas = getCitasForDate(date)
            const isToday = date.isSame(dayjs(), 'day')
            const isSelected = date.isSame(selectedDate, 'day')
            const isOtherMonth = !date.isSame(currentDate, 'month')

            return (
              <DayCell
                key={index}
                $isToday={isToday}
                $isSelected={isSelected}
                $isOtherMonth={isOtherMonth}
                onClick={() => setSelectedDate(date)}
              >
                <DayNumber $isToday={isToday} $isOtherMonth={isOtherMonth}>
                  {date.format('D')}
                </DayNumber>
                {dayCitas.slice(0, 3).map((cita) => (
                  <CitaDot key={cita.id} $color={getEstadoColor(cita.status)}>
                    {dayjs(cita.appointmentTime).format('HH:mm')} {cita.patientName?.split(' ')[1] || cita.patientName}
                  </CitaDot>
                ))}
                {dayCitas.length > 3 && (
                  <div style={{ fontSize: 11, color: '#94a3b8', paddingLeft: 4 }}>+{dayCitas.length - 3} más</div>
                )}
              </DayCell>
            )
          })}
        </Grid>
      </CalendarSection>

      <SidePanel>
        <SideHeader>
          <SelectedDateTitle>{selectedDate.format('dddd D')}</SelectedDateTitle>
          <SelectedDateSubtitle>{selectedDate.format('MMMM YYYY')}</SelectedDateSubtitle>
        </SideHeader>

        {selectedCitas.length === 0 ? (
          <EmptyState>
            <CalendarIcon size={48} style={{ opacity: 0.2 }} />
            <p>No hay citas programadas para este día</p>
          </EmptyState>
        ) : (
          <CitasList>
            {selectedCitas.map((cita) => (
              <CitaCard key={cita.id}>
                <CitaTime>
                  <Clock size={14} />
                  {dayjs(cita.appointmentTime).format('HH:mm')}
                </CitaTime>
                <CitaPatient>{cita.patientName}</CitaPatient>
                <CitaDoctor>
                  <Stethoscope size={14} />
                  {cita.doctorName}
                </CitaDoctor>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{cita.reason}</div>
              </CitaCard>
            ))}
          </CitasList>
        )}
      </SidePanel>
    </Container>
  )
}
