import { useEffect, useState } from 'react'
import {
  Typography,
  Card,
  Button,
  Input,
  Form,
  Select,
  Table,
  Space,
  Modal,
  message,
  Empty,
  Spin,
  Tag,
  Tooltip,
  Statistic,
  Row,
  Col,
  Tabs,
  Divider,
  Badge,
  Avatar
} from 'antd'
import {
  PlusOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import api, {
  ReferralRequest,
  ReferralResponse,
  ReferralUrgency,
  ReferralStatus,
  PatientResponse,
  DoctorResponse,
  AppointmentResponse
} from '../services/api'
import { useAppSelector } from '../store'

const { Title, Text } = Typography
const { TextArea } = Input

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
`

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`

const StatsCard = styled(Card)`
  margin-bottom: 16px;
`

// Urgency configuration
const urgencyConfig: Record<ReferralUrgency, { color: string; label: string; bgColor: string }> = {
  ROUTINE: { color: '#52c41a', label: 'Rutina', bgColor: '#f6ffed' },
  PRIORITY: { color: '#faad14', label: 'Prioritario', bgColor: '#fffbe6' },
  URGENT: { color: '#ff4d4f', label: 'Urgente', bgColor: '#fff2f0' }
}

// Status configuration
const statusConfig: Record<ReferralStatus, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: 'Pendiente' },
  ACCEPTED: { color: 'processing', label: 'Aceptada' },
  COMPLETED: { color: 'success', label: 'Completada' },
  CANCELLED: { color: 'default', label: 'Cancelada' }
}

// Common specialties
const specialties = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Medicina Interna',
  'Nefrología',
  'Neumología',
  'Neurología',
  'Oftalmología',
  'Oncología',
  'Otorrinolaringología',
  'Pediatría',
  'Psiquiatría',
  'Reumatología',
  'Traumatología',
  'Urología'
]

export default function Derivaciones() {
  const [referrals, setReferrals] = useState<ReferralResponse[]>([])
  const [pendingReferrals, setPendingReferrals] = useState<ReferralResponse[]>([])
  const [myReferrals, setMyReferrals] = useState<ReferralResponse[]>([])
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<ReferralResponse | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined)
  
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  
  const [createForm] = Form.useForm()
  const [completeForm] = Form.useForm()
  
  const { user } = useAppSelector((state) => state.auth)
  const canManageReferrals = user?.role === 'DOCTOR' || user?.role === 'ADMIN'
  
  // Get current doctor ID if user is a doctor
  // @ts-ignore - user type may not have id property in all cases
  const currentDoctorId = doctors.find(d => d.user.id === (user as any)?.id)?.id

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (currentDoctorId) {
      loadPendingReferrals()
      loadMyReferrals()
    }
  }, [currentDoctorId])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadPatients(), loadDoctors()])
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      const data = await api.getPatients()
      setPatients(data)
    } catch {
      message.error('Error al cargar pacientes')
    }
  }

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors()
      setDoctors(data)
    } catch {
      message.error('Error al cargar doctores')
    }
  }

  const loadPendingReferrals = async () => {
    if (!currentDoctorId) return
    try {
      const data = await api.getPendingReferralsForDoctor(currentDoctorId)
      setPendingReferrals(data)
    } catch {
      message.error('Error al cargar derivaciones pendientes')
    }
  }

  const loadMyReferrals = async () => {
    if (!currentDoctorId) return
    try {
      const data = await api.getReferralsByReferringDoctor(currentDoctorId)
      setMyReferrals(data)
    } catch {
      message.error('Error al cargar mis derivaciones')
    }
  }

  const loadReferralsByPatient = async (patientId: number) => {
    try {
      const data = await api.getReferralsByPatient(patientId)
      setReferrals(data)
    } catch {
      message.error('Error al cargar derivaciones del paciente')
    }
  }

  const loadAppointmentsForPatient = async (patientId: number) => {
    try {
      const data = await api.getAppointmentsByPatient(patientId)
      setAppointments(data.filter(a => a.status === 'COMPLETED'))
    } catch {
      message.error('Error al cargar citas')
    }
  }


  const handleCreateReferral = async (values: ReferralRequest) => {
    try {
      await api.createReferral({
        ...values,
        referringDoctorId: currentDoctorId!
      })
      message.success('Derivación creada exitosamente')
      await loadMyReferrals()
      if (selectedPatientId) {
        await loadReferralsByPatient(selectedPatientId)
      }
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch {
      message.error('Error al crear derivación')
    }
  }

  const handleAcceptReferral = async (referralId: number) => {
    try {
      await api.acceptReferral(referralId)
      message.success('Derivación aceptada')
      await loadPendingReferrals()
      if (selectedPatientId) {
        await loadReferralsByPatient(selectedPatientId)
      }
    } catch {
      message.error('Error al aceptar derivación')
    }
  }

  const handleCancelReferral = async (referralId: number) => {
    Modal.confirm({
      title: '¿Cancelar derivación?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, cancelar',
      cancelText: 'No',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.cancelReferral(referralId)
          message.success('Derivación cancelada')
          await loadMyReferrals()
          await loadPendingReferrals()
          if (selectedPatientId) {
            await loadReferralsByPatient(selectedPatientId)
          }
        } catch {
          message.error('Error al cancelar derivación')
        }
      }
    })
  }

  const handleCompleteReferral = async (values: { appointmentId?: number }) => {
    if (!selectedReferral) return
    try {
      await api.completeReferral(selectedReferral.id, values.appointmentId)
      message.success('Derivación completada')
      await loadPendingReferrals()
      await loadMyReferrals()
      if (selectedPatientId) {
        await loadReferralsByPatient(selectedPatientId)
      }
      setCompleteModalOpen(false)
      completeForm.resetFields()
      setSelectedReferral(null)
    } catch {
      message.error('Error al completar derivación')
    }
  }

  const openDetailModal = (referral: ReferralResponse) => {
    setSelectedReferral(referral)
    setDetailModalOpen(true)
  }

  const openCompleteModal = async (referral: ReferralResponse) => {
    setSelectedReferral(referral)
    await loadAppointmentsForPatient(referral.patientId)
    setCompleteModalOpen(true)
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getDestinationText = (referral: ReferralResponse) => {
    if (referral.destinationDoctorName) {
      return `Dr. ${referral.destinationDoctorName}`
    }
    if (referral.destinationSpecialty) {
      return referral.destinationSpecialty
    }
    if (referral.externalService) {
      return `Externo: ${referral.externalService}`
    }
    return '-'
  }

  // Stats
  const pendingCount = pendingReferrals.length
  const myPendingCount = myReferrals.filter(r => r.status === 'PENDING').length
  const myAcceptedCount = myReferrals.filter(r => r.status === 'ACCEPTED').length
  const myCompletedCount = myReferrals.filter(r => r.status === 'COMPLETED').length

  const tableColumns = [
    {
      title: 'Urgencia',
      key: 'urgency',
      width: 120,
      render: (_: unknown, record: ReferralResponse) => {
        const config = urgencyConfig[record.urgency]
        return (
          <Tag color={config.color} style={{ backgroundColor: config.bgColor }}>
            {config.label}
          </Tag>
        )
      },
      sorter: (a: ReferralResponse, b: ReferralResponse) => {
        const order = { URGENT: 1, PRIORITY: 2, ROUTINE: 3 }
        return order[a.urgency] - order[b.urgency]
      }
    },
    {
      title: 'Paciente',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 180
    },
    {
      title: 'Destino',
      key: 'destination',
      width: 180,
      render: (_: unknown, record: ReferralResponse) => getDestinationText(record)
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (val: string) => formatDateTime(val)
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ReferralStatus) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: ReferralResponse) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button icon={<SearchOutlined />} size="small" onClick={() => openDetailModal(record)} />
          </Tooltip>
          {canManageReferrals && record.status === 'PENDING' && record.destinationDoctorId === currentDoctorId && (
            <Tooltip title="Aceptar">
              <Button icon={<CheckCircleOutlined />} size="small" type="primary" onClick={() => handleAcceptReferral(record.id)} />
            </Tooltip>
          )}
          {canManageReferrals && record.status === 'ACCEPTED' && record.destinationDoctorId === currentDoctorId && (
            <Tooltip title="Completar">
              <Button icon={<LinkOutlined />} size="small" type="primary" onClick={() => openCompleteModal(record)} />
            </Tooltip>
          )}
          {canManageReferrals && record.status === 'PENDING' && record.referringDoctorId === currentDoctorId && (
            <Tooltip title="Cancelar">
              <Button icon={<CloseCircleOutlined />} size="small" danger onClick={() => handleCancelReferral(record.id)} />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]


  return (
    <PageContainer>
      <HeaderSection>
        <Title level={3}>
          <SendOutlined style={{ marginRight: 8 }} />
          Derivaciones
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData}>Actualizar</Button>
          {canManageReferrals && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateModalOpen(true) }}>
              Nueva Derivación
            </Button>
          )}
        </Space>
      </HeaderSection>

      {canManageReferrals && currentDoctorId && (
        <StatsCard>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic 
                title="Recibidas Pendientes" 
                value={pendingCount} 
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Mis Pendientes" 
                value={myPendingCount} 
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Mis Aceptadas" 
                value={myAcceptedCount} 
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Mis Completadas" 
                value={myCompletedCount} 
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Col>
          </Row>
        </StatsCard>
      )}

      <Tabs defaultActiveKey="pending" items={[
        {
          key: 'pending',
          label: <Badge count={pendingCount} offset={[10, 0]}>Derivaciones Recibidas</Badge>,
          children: loading ? (
            <Card><div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div></Card>
          ) : (
            <Card title="Derivaciones Pendientes para Mí" extra={<Text type="secondary">Derivaciones donde soy el destino</Text>}>
              <Table 
                columns={tableColumns} 
                dataSource={pendingReferrals} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: <Empty description="No hay derivaciones pendientes" /> }}
              />
            </Card>
          )
        },
        {
          key: 'created',
          label: <Badge count={myPendingCount} offset={[10, 0]}>Mis Derivaciones</Badge>,
          children: (
            <Card title="Derivaciones Creadas por Mí" extra={<Text type="secondary">Derivaciones que he realizado</Text>}>
              <Table 
                columns={tableColumns} 
                dataSource={myReferrals} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: <Empty description="No has creado derivaciones" /> }}
              />
            </Card>
          )
        },
        {
          key: 'patient',
          label: 'Por Paciente',
          children: (
            <Card>
              <Space style={{ marginBottom: 16 }}>
                <Select 
                  showSearch
                  placeholder="Seleccionar paciente..." 
                  style={{ width: 300 }} 
                  value={selectedPatientId}
                  onChange={(val) => {
                    setSelectedPatientId(val)
                    if (val) loadReferralsByPatient(val)
                    else setReferrals([])
                  }}
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={patients.map(p => ({ 
                    value: p.id, 
                    label: `${p.firstName} ${p.lastName}` 
                  }))}
                  allowClear
                />
              </Space>
              <Table 
                columns={tableColumns} 
                dataSource={referrals} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: <Empty description={selectedPatientId ? "No hay derivaciones para este paciente" : "Seleccione un paciente"} /> }}
              />
            </Card>
          )
        }
      ]} />


      {/* Create Referral Modal */}
      <Modal 
        title="Nueva Derivación" 
        open={createModalOpen} 
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }} 
        onOk={() => createForm.submit()} 
        okText="Crear" 
        cancelText="Cancelar"
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateReferral}>
          <Form.Item 
            name="patientId" 
            label="Paciente" 
            rules={[{ required: true, message: 'Seleccione un paciente' }]}
          >
            <Select 
              showSearch 
              placeholder="Buscar paciente..." 
              optionFilterProp="children"
              filterOption={(input, option) => 
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={patients.map(p => ({ 
                value: p.id, 
                label: `${p.firstName} ${p.lastName}` 
              }))}
            />
          </Form.Item>
          
          <Form.Item 
            name="urgency" 
            label="Urgencia" 
            rules={[{ required: true, message: 'Seleccione la urgencia' }]}
          >
            <Select placeholder="Seleccionar urgencia...">
              {Object.entries(urgencyConfig).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={config.color}>{config.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Destino de la Derivación</Divider>
          
          <Form.Item 
            name="destinationDoctorId" 
            label="Doctor Destino"
            tooltip="Seleccione un doctor específico o deje vacío para derivar a especialidad"
          >
            <Select 
              showSearch 
              placeholder="Seleccionar doctor (opcional)..." 
              optionFilterProp="children"
              filterOption={(input, option) => 
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={doctors.filter(d => d.id !== currentDoctorId).map(d => ({ 
                value: d.id, 
                label: `Dr. ${d.user.firstName} ${d.user.lastName} - ${d.specialization}` 
              }))}
              allowClear
            />
          </Form.Item>
          
          <Form.Item 
            name="destinationSpecialty" 
            label="Especialidad Destino"
            tooltip="Seleccione una especialidad si no especifica un doctor"
          >
            <Select 
              showSearch 
              placeholder="Seleccionar especialidad (opcional)..." 
              options={specialties.map(s => ({ value: s, label: s }))}
              allowClear
            />
          </Form.Item>
          
          <Form.Item 
            name="externalService" 
            label="Servicio Externo"
            tooltip="Para derivaciones a servicios fuera del hospital"
          >
            <Input placeholder="Nombre del servicio externo (opcional)..." />
          </Form.Item>
          
          <Divider />
          
          <Form.Item 
            name="reason" 
            label="Motivo de la Derivación" 
            rules={[{ required: true, message: 'Ingrese el motivo de la derivación' }]}
          >
            <TextArea rows={4} placeholder="Describa el motivo de la derivación, antecedentes relevantes y expectativas..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Complete Referral Modal */}
      <Modal 
        title="Completar Derivación" 
        open={completeModalOpen} 
        onCancel={() => { setCompleteModalOpen(false); completeForm.resetFields(); setSelectedReferral(null) }} 
        onOk={() => completeForm.submit()} 
        okText="Completar" 
        cancelText="Cancelar"
        width={500}
      >
        {selectedReferral && (
          <>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Paciente:</Text>
                  <div><Text strong>{selectedReferral.patientName}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Derivado por:</Text>
                  <div><Text>{selectedReferral.referringDoctorName}</Text></div>
                </Col>
              </Row>
            </Card>
            
            <Form form={completeForm} layout="vertical" onFinish={handleCompleteReferral}>
              <Form.Item 
                name="appointmentId" 
                label="Vincular con Cita (opcional)"
                tooltip="Seleccione la cita resultante de esta derivación"
              >
                <Select 
                  placeholder="Seleccionar cita completada..." 
                  allowClear
                  options={appointments.map(a => ({ 
                    value: a.id, 
                    label: `${formatDateTime(a.appointmentTime)} - ${a.reason}` 
                  }))}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>


      {/* Detail Modal */}
      <Modal 
        title="Detalle de Derivación" 
        open={detailModalOpen} 
        onCancel={() => { setDetailModalOpen(false); setSelectedReferral(null) }} 
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>Cerrar</Button>,
          canManageReferrals && selectedReferral?.status === 'PENDING' && selectedReferral?.destinationDoctorId === currentDoctorId && (
            <Button key="accept" type="primary" icon={<CheckCircleOutlined />} onClick={() => { setDetailModalOpen(false); handleAcceptReferral(selectedReferral!.id) }}>
              Aceptar
            </Button>
          ),
          canManageReferrals && selectedReferral?.status === 'ACCEPTED' && selectedReferral?.destinationDoctorId === currentDoctorId && (
            <Button key="complete" type="primary" icon={<LinkOutlined />} onClick={() => { setDetailModalOpen(false); openCompleteModal(selectedReferral!) }}>
              Completar
            </Button>
          )
        ].filter(Boolean)}
        width={600}
      >
        {selectedReferral && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>{selectedReferral.patientName}</Title>
              <Space>
                <Tag color={urgencyConfig[selectedReferral.urgency].color}>
                  {urgencyConfig[selectedReferral.urgency].label}
                </Tag>
                <Tag color={statusConfig[selectedReferral.status].color}>
                  {statusConfig[selectedReferral.status].label}
                </Tag>
              </Space>
            </div>
            
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Derivado por:</Text>
                  <div><Text strong>Dr. {selectedReferral.referringDoctorName}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Destino:</Text>
                  <div><Text strong>{getDestinationText(selectedReferral)}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Fecha de Creación:</Text>
                  <div><Text strong>{formatDateTime(selectedReferral.createdAt)}</Text></div>
                </Col>
                {selectedReferral.completedAt && (
                  <Col span={12}>
                    <Text type="secondary">Fecha de Completado:</Text>
                    <div><Text strong>{formatDateTime(selectedReferral.completedAt)}</Text></div>
                  </Col>
                )}
                {selectedReferral.resultingAppointmentId && (
                  <Col span={24}>
                    <Text type="secondary">Cita Vinculada:</Text>
                    <div><Text strong>ID: {selectedReferral.resultingAppointmentId}</Text></div>
                  </Col>
                )}
              </Row>
            </Card>
            
            <Card size="small" title="Motivo de la Derivación">
              <Text>{selectedReferral.reason}</Text>
            </Card>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
