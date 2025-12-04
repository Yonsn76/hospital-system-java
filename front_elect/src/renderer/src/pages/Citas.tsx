import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  TimePicker,
  message,
  Tag,
  Typography,
  Popconfirm
} from 'antd'
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import api, {
  AppointmentResponse,
  AppointmentStatus,
  PatientResponse,
  DoctorResponse,
  AppointmentRequest
} from '../services/api'
import { useAppSelector } from '../store'
import dayjs from 'dayjs'

const { Title } = Typography

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
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

export default function Citas() {
  const [citas, setCitas] = useState<AppointmentResponse[]>([])
  const [pacientes, setPacientes] = useState<PatientResponse[]>([])
  const [doctores, setDoctores] = useState<DoctorResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const { user } = useAppSelector((state) => state.auth)

  const canManage = ['ADMIN', 'RECEPTIONIST'].includes(user?.role || '')
  const canUpdateStatus = ['ADMIN', 'DOCTOR', 'RECEPTIONIST'].includes(user?.role || '')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const userRole = user?.role

      let appointments: AppointmentResponse[] = []
      if (userRole === 'DOCTOR') {
        appointments = await api.getMyAppointments()
      } else {
        appointments = await api.getAppointments()
      }

      if (canManage) {
        const [p, d] = await Promise.all([api.getPatients(), api.getDoctors()])
        setPacientes(p)
        setDoctores(d)
      }

      setCitas(appointments.sort((a, b) => dayjs(b.appointmentTime).valueOf() - dayjs(a.appointmentTime).valueOf()))
    } catch (error) {
      message.error('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      const appointmentTime = values.fecha
        .hour(values.hora.hour())
        .minute(values.hora.minute())
        .format('YYYY-MM-DDTHH:mm:ss')

      const dto: AppointmentRequest = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        appointmentTime,
        reason: values.reason
      }
      await api.createAppointment(dto)
      message.success('Cita creada')
      setModalOpen(false)
      form.resetFields()
      loadData()
    } catch {
      message.error('Error al crear cita')
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await api.updateAppointmentStatus(id, 'COMPLETED')
      message.success('Cita completada')
      loadData()
    } catch {
      message.error('Error al completar cita')
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await api.updateAppointmentStatus(id, 'CANCELLED')
      message.success('Cita cancelada')
      loadData()
    } catch {
      message.error('Error al cancelar cita')
    }
  }

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'appointmentTime',
      key: 'fecha',
      render: (t: string) => dayjs(t).format('DD/MM/YYYY')
    },
    {
      title: 'Hora',
      dataIndex: 'appointmentTime',
      key: 'hora',
      render: (t: string) => dayjs(t).format('HH:mm')
    },
    { title: 'Paciente', dataIndex: 'patientName', key: 'paciente' },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctor' },
    { title: 'Motivo', dataIndex: 'reason', key: 'motivo', ellipsis: true },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'estado',
      render: (e: AppointmentStatus) => <Tag color={getEstadoColor(e)}>{getEstadoLabel(e)}</Tag>
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: AppointmentResponse) => (
        <Space>
          {canUpdateStatus && record.status === 'SCHEDULED' && (
            <>
              <Popconfirm title="¿Completar cita?" onConfirm={() => handleComplete(record.id)}>
                <Button icon={<CheckOutlined />} type="primary" size="small" />
              </Popconfirm>
              <Popconfirm title="¿Cancelar cita?" onConfirm={() => handleCancel(record.id)}>
                <Button icon={<CloseOutlined />} danger size="small" />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={3}>Citas</Title>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Nueva Cita
          </Button>
        )}
      </div>

      <Table columns={columns} dataSource={citas} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} />

      <Modal
        title="Nueva Cita"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="patientId" label="Paciente" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={pacientes.map((p) => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName}`
              }))}
            />
          </Form.Item>
          <Form.Item name="doctorId" label="Doctor" rules={[{ required: true }]}>
            <Select
              options={doctores.map((d) => ({
                value: d.id,
                label: `Dr. ${d.user.firstName} ${d.user.lastName} - ${d.specialization}`
              }))}
            />
          </Form.Item>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
          </Form.Item>
          <Form.Item name="hora" label="Hora" rules={[{ required: true }]}>
            <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} />
          </Form.Item>
          <Form.Item name="reason" label="Motivo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
