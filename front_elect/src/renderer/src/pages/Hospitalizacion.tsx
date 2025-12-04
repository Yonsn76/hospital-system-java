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
  Descriptions,
  Tooltip,
  Divider,
  Tabs,
  Timeline,
  Badge,
  Statistic,
  Row,
  Col
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
  SwapOutlined,
  LogoutOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import api, {
  PatientResponse,
  DoctorResponse,
  HospitalizationRequest,
  HospitalizationResponse,
  BedResponse,
  BedTransferResponse,
  BedAssignmentRequest,
  BedTransferRequest,
  DischargeRequest,
  HospitalizationStatus,
  DischargeType,
  BedStatus
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

const PatientInfoCard = styled(Card)`
  margin-bottom: 16px;
`

const StatsCard = styled(Card)`
  margin-bottom: 16px;
`

const BedCard = styled(Card)<{ $status: BedStatus }>`
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'AVAILABLE': return '#52c41a';
      case 'OCCUPIED': return '#ff4d4f';
      case 'MAINTENANCE': return '#faad14';
      case 'RESERVED': return '#1890ff';
      default: return '#d9d9d9';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const BedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 16px;
`

const statusColors: Record<HospitalizationStatus, string> = {
  ACTIVE: 'green',
  DISCHARGED: 'default',
  TRANSFERRED: 'blue'
}

const statusLabels: Record<HospitalizationStatus, string> = {
  ACTIVE: 'Activo',
  DISCHARGED: 'Alta',
  TRANSFERRED: 'Transferido'
}

const dischargeTypeLabels: Record<DischargeType, string> = {
  MEDICAL: 'Alta Médica',
  VOLUNTARY: 'Alta Voluntaria',
  TRANSFER: 'Transferencia',
  DECEASED: 'Fallecimiento'
}

const bedStatusColors: Record<BedStatus, string> = {
  AVAILABLE: 'success',
  OCCUPIED: 'error',
  MAINTENANCE: 'warning',
  RESERVED: 'processing'
}

const bedStatusLabels: Record<BedStatus, string> = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupada',
  MAINTENANCE: 'Mantenimiento',
  RESERVED: 'Reservada'
}

export default function Hospitalizacion() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [beds, setBeds] = useState<BedResponse[]>([])
  const [activeHospitalizations, setActiveHospitalizations] = useState<HospitalizationResponse[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null)
  const [patientHospitalizations, setPatientHospitalizations] = useState<HospitalizationResponse[]>([])
  const [selectedHospitalization, setSelectedHospitalization] = useState<HospitalizationResponse | null>(null)
  const [transferHistory, setTransferHistory] = useState<BedTransferResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  
  // Modal states
  const [admitModalOpen, setAdmitModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [assignBedModalOpen, setAssignBedModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false)
  
  const [admitForm] = Form.useForm()
  const [assignBedForm] = Form.useForm()
  const [transferForm] = Form.useForm()
  const [dischargeForm] = Form.useForm()
  
  const { user } = useAppSelector((state) => state.auth)
  const canAdmit = user?.role === 'ADMIN' || user?.role === 'DOCTOR'
  const canManage = user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE'

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPatients(),
        loadDoctors(),
        loadBeds(),
        loadActiveHospitalizations()
      ])
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

  const loadBeds = async () => {
    try {
      const data = await api.getAllBeds()
      setBeds(data)
    } catch {
      message.error('Error al cargar camas')
    }
  }

  const loadActiveHospitalizations = async () => {
    try {
      const data = await api.getActiveHospitalizations()
      setActiveHospitalizations(data)
    } catch {
      message.error('Error al cargar hospitalizaciones activas')
    }
  }

  const loadPatientHospitalizations = async (patientId: number) => {
    setLoading(true)
    try {
      const data = await api.getPatientHospitalizations(patientId)
      const sorted = data.sort((a, b) => 
        new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime()
      )
      setPatientHospitalizations(sorted)
    } catch {
      setPatientHospitalizations([])
      message.error('Error al cargar historial de hospitalizaciones')
    } finally {
      setLoading(false)
    }
  }

  const loadTransferHistory = async (hospitalizationId: number) => {
    try {
      const data = await api.getTransferHistory(hospitalizationId)
      setTransferHistory(data)
    } catch {
      setTransferHistory([])
    }
  }

  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    setSelectedHospitalization(null)
    if (patient) {
      loadPatientHospitalizations(patient.id)
    }
  }


  const handleAdmitPatient = async (values: {
    patientId: number
    admittingDoctorId: number
    admissionReason: string
    bedId?: number
  }) => {
    try {
      const admitData: HospitalizationRequest = {
        patientId: values.patientId,
        admittingDoctorId: values.admittingDoctorId,
        admissionReason: values.admissionReason,
        bedId: values.bedId
      }
      
      await api.admitPatient(admitData)
      message.success('Paciente ingresado exitosamente')
      await loadActiveHospitalizations()
      await loadBeds()
      if (selectedPatient && selectedPatient.id === values.patientId) {
        await loadPatientHospitalizations(selectedPatient.id)
      }
      setAdmitModalOpen(false)
      admitForm.resetFields()
    } catch {
      message.error('Error al ingresar paciente')
    }
  }

  const handleAssignBed = async (values: { bedId: number }) => {
    if (!selectedHospitalization) return
    
    try {
      const assignData: BedAssignmentRequest = { bedId: values.bedId }
      await api.assignBed(selectedHospitalization.id, assignData)
      message.success('Cama asignada exitosamente')
      await loadActiveHospitalizations()
      await loadBeds()
      if (selectedPatient) {
        await loadPatientHospitalizations(selectedPatient.id)
      }
      setAssignBedModalOpen(false)
      assignBedForm.resetFields()
      setSelectedHospitalization(null)
    } catch {
      message.error('Error al asignar cama')
    }
  }

  const handleTransfer = async (values: { toBedId: number; reason: string }) => {
    if (!selectedHospitalization) return
    
    try {
      const transferData: BedTransferRequest = {
        toBedId: values.toBedId,
        reason: values.reason
      }
      await api.transferPatient(selectedHospitalization.id, transferData)
      message.success('Paciente transferido exitosamente')
      await loadActiveHospitalizations()
      await loadBeds()
      if (selectedPatient) {
        await loadPatientHospitalizations(selectedPatient.id)
      }
      setTransferModalOpen(false)
      transferForm.resetFields()
      setSelectedHospitalization(null)
    } catch {
      message.error('Error al transferir paciente')
    }
  }

  const handleDischarge = async (values: { dischargeType: DischargeType; dischargeNotes?: string }) => {
    if (!selectedHospitalization) return
    
    try {
      const dischargeData: DischargeRequest = {
        dischargeType: values.dischargeType,
        dischargeNotes: values.dischargeNotes
      }
      await api.dischargePatient(selectedHospitalization.id, dischargeData)
      message.success('Paciente dado de alta exitosamente')
      await loadActiveHospitalizations()
      await loadBeds()
      if (selectedPatient) {
        await loadPatientHospitalizations(selectedPatient.id)
      }
      setDischargeModalOpen(false)
      dischargeForm.resetFields()
      setSelectedHospitalization(null)
    } catch {
      message.error('Error al dar de alta al paciente')
    }
  }

  const handleViewHospitalization = async (hospitalization: HospitalizationResponse) => {
    setSelectedHospitalization(hospitalization)
    await loadTransferHistory(hospitalization.id)
    setViewModalOpen(true)
  }

  const openAssignBedModal = (hospitalization: HospitalizationResponse) => {
    setSelectedHospitalization(hospitalization)
    assignBedForm.resetFields()
    setAssignBedModalOpen(true)
  }

  const openTransferModal = (hospitalization: HospitalizationResponse) => {
    setSelectedHospitalization(hospitalization)
    transferForm.resetFields()
    setTransferModalOpen(true)
  }

  const openDischargeModal = (hospitalization: HospitalizationResponse) => {
    setSelectedHospitalization(hospitalization)
    dischargeForm.resetFields()
    setDischargeModalOpen(true)
  }

  const openAdmitModal = () => {
    admitForm.resetFields()
    if (selectedPatient) {
      admitForm.setFieldValue('patientId', selectedPatient.id)
    }
    setAdmitModalOpen(true)
  }

  const availableBeds = beds.filter(b => b.status === 'AVAILABLE')
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED')
  
  // Group beds by area
  const bedsByArea = beds.reduce((acc, bed) => {
    if (!acc[bed.area]) {
      acc[bed.area] = []
    }
    acc[bed.area].push(bed)
    return acc
  }, {} as Record<string, BedResponse[]>)

  const hospitalizationsColumns = [
    {
      title: 'Fecha Ingreso',
      dataIndex: 'admissionDate',
      key: 'admissionDate',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Paciente',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 180
    },
    {
      title: 'Doctor',
      dataIndex: 'admittingDoctorName',
      key: 'admittingDoctorName',
      width: 180
    },
    {
      title: 'Cama',
      key: 'bed',
      width: 120,
      render: (_: unknown, record: HospitalizationResponse) => 
        record.bedNumber ? (
          <Tag color="blue">{record.bedNumber} - {record.bedArea}</Tag>
        ) : (
          <Tag color="orange">Sin asignar</Tag>
        )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: HospitalizationStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      )
    },
    {
      title: 'Fecha Alta',
      dataIndex: 'dischargeDate',
      key: 'dischargeDate',
      width: 150,
      render: (date: string | null) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: HospitalizationResponse) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewHospitalization(record)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && canManage && (
            <>
              {!record.bedId && (
                <Tooltip title="Asignar cama">
                  <Button
                    icon={<HomeOutlined />}
                    size="small"
                    type="primary"
                    onClick={() => openAssignBedModal(record)}
                  />
                </Tooltip>
              )}
              {record.bedId && (
                <Tooltip title="Transferir">
                  <Button
                    icon={<SwapOutlined />}
                    size="small"
                    onClick={() => openTransferModal(record)}
                  />
                </Tooltip>
              )}
              <Tooltip title="Dar de alta">
                <Button
                  icon={<LogoutOutlined />}
                  size="small"
                  danger
                  onClick={() => openDischargeModal(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]


  const tabItems = [
    {
      key: 'active',
      label: (
        <span>
          <MedicineBoxOutlined />
          Hospitalizaciones Activas
          <Badge count={activeHospitalizations.length} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Table
            columns={hospitalizationsColumns}
            dataSource={activeHospitalizations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="No hay hospitalizaciones activas" /> }}
          />
        </Card>
      )
    },
    {
      key: 'patient',
      label: (
        <span>
          <HistoryOutlined />
          Historial por Paciente
        </span>
      ),
      children: (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Select
              showSearch
              placeholder="Seleccionar paciente"
              style={{ width: 300 }}
              optionFilterProp="children"
              onChange={handlePatientSelect}
              value={selectedPatient?.id}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={patients.map(p => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName}`
              }))}
            />
          </Space>

          {!selectedPatient ? (
            <Card>
              <Empty description="Seleccione un paciente para ver su historial de hospitalizaciones" />
            </Card>
          ) : loading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            </Card>
          ) : (
            <>
              <PatientInfoCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Title level={4} style={{ marginBottom: 4 }}>
                      <UserOutlined style={{ marginRight: 8 }} />
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </Title>
                    <Space split={<span style={{ color: '#ccc' }}>|</span>}>
                      <Text type="secondary">
                        Fecha Nac: {dayjs(selectedPatient.dateOfBirth).format('DD/MM/YYYY')}
                      </Text>
                      <Text type="secondary">Género: {selectedPatient.gender}</Text>
                      <Text type="secondary">Tel: {selectedPatient.contactNumber}</Text>
                    </Space>
                  </div>
                  <Tag color="blue" style={{ fontSize: 14 }}>
                    {patientHospitalizations.length} hospitalización{patientHospitalizations.length !== 1 ? 'es' : ''}
                  </Tag>
                </div>
              </PatientInfoCard>

              <Card title="Historial de Hospitalizaciones">
                <Table
                  columns={hospitalizationsColumns}
                  dataSource={patientHospitalizations}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: <Empty description="No hay hospitalizaciones registradas" /> }}
                />
              </Card>
            </>
          )}
        </>
      )
    },
    {
      key: 'beds',
      label: (
        <span>
          <HomeOutlined />
          Gestión de Camas
        </span>
      ),
      children: (
        <>
          <StatsCard>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Camas"
                  value={beds.length}
                  prefix={<HomeOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Disponibles"
                  value={availableBeds.length}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Ocupadas"
                  value={occupiedBeds.length}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tasa Ocupación"
                  value={beds.length > 0 ? Math.round((occupiedBeds.length / beds.length) * 100) : 0}
                  suffix="%"
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
          </StatsCard>

          {Object.entries(bedsByArea).map(([area, areaBeds]) => (
            <Card key={area} title={`Área: ${area}`} style={{ marginBottom: 16 }}>
              <BedGrid>
                {areaBeds.map(bed => (
                  <BedCard
                    key={bed.id}
                    $status={bed.status}
                    size="small"
                    onClick={() => {
                      if (bed.currentHospitalizationId) {
                        const hosp = activeHospitalizations.find(h => h.id === bed.currentHospitalizationId)
                        if (hosp) handleViewHospitalization(hosp)
                      }
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <HomeOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      <div><Text strong>{bed.bedNumber}</Text></div>
                      <Badge status={bedStatusColors[bed.status] as 'success' | 'error' | 'warning' | 'processing'} text={bedStatusLabels[bed.status]} />
                    </div>
                  </BedCard>
                ))}
              </BedGrid>
            </Card>
          ))}

          {Object.keys(bedsByArea).length === 0 && (
            <Card>
              <Empty description="No hay camas registradas en el sistema" />
            </Card>
          )}
        </>
      )
    }
  ]


  return (
    <PageContainer>
      <HeaderSection>
        <Title level={3}>
          <MedicineBoxOutlined style={{ marginRight: 8 }} />
          Hospitalización
        </Title>
        {canAdmit && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdmitModal}
          >
            Ingresar Paciente
          </Button>
        )}
      </HeaderSection>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Admit Patient Modal */}
      <Modal
        title="Ingresar Paciente"
        open={admitModalOpen}
        onCancel={() => {
          setAdmitModalOpen(false)
          admitForm.resetFields()
        }}
        onOk={() => admitForm.submit()}
        width={600}
        okText="Ingresar"
        cancelText="Cancelar"
      >
        <Form
          form={admitForm}
          layout="vertical"
          onFinish={handleAdmitPatient}
        >
          <Form.Item
            name="patientId"
            label="Paciente"
            rules={[{ required: true, message: 'Seleccione el paciente' }]}
          >
            <Select
              showSearch
              placeholder="Seleccione paciente"
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
            name="admittingDoctorId"
            label="Doctor Responsable"
            rules={[{ required: true, message: 'Seleccione el doctor' }]}
          >
            <Select
              showSearch
              placeholder="Seleccione doctor"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={doctors.map(d => ({
                value: d.id,
                label: `Dr. ${d.user.firstName} ${d.user.lastName} - ${d.specialization}`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="admissionReason"
            label="Motivo de Ingreso"
            rules={[{ required: true, message: 'Ingrese el motivo' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describa el motivo de hospitalización..."
            />
          </Form.Item>

          <Form.Item
            name="bedId"
            label="Cama (Opcional)"
          >
            <Select
              allowClear
              placeholder="Seleccione una cama (opcional)"
              options={availableBeds.map(b => ({
                value: b.id,
                label: `${b.bedNumber} - ${b.area}`
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Hospitalization Modal */}
      <Modal
        title="Detalle de Hospitalización"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false)
          setSelectedHospitalization(null)
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Cerrar
          </Button>,
          selectedHospitalization?.status === 'ACTIVE' && canManage && !selectedHospitalization?.bedId && (
            <Button
              key="assign"
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => {
                setViewModalOpen(false)
                openAssignBedModal(selectedHospitalization!)
              }}
            >
              Asignar Cama
            </Button>
          ),
          selectedHospitalization?.status === 'ACTIVE' && canManage && selectedHospitalization?.bedId && (
            <Button
              key="transfer"
              icon={<SwapOutlined />}
              onClick={() => {
                setViewModalOpen(false)
                openTransferModal(selectedHospitalization!)
              }}
            >
              Transferir
            </Button>
          ),
          selectedHospitalization?.status === 'ACTIVE' && canManage && (
            <Button
              key="discharge"
              danger
              icon={<LogoutOutlined />}
              onClick={() => {
                setViewModalOpen(false)
                openDischargeModal(selectedHospitalization!)
              }}
            >
              Dar de Alta
            </Button>
          )
        ].filter(Boolean)}
        width={800}
      >
        {selectedHospitalization && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Paciente">
                {selectedHospitalization.patientName}
              </Descriptions.Item>
              <Descriptions.Item label="Doctor Responsable">
                {selectedHospitalization.admittingDoctorName}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha Ingreso">
                {dayjs(selectedHospitalization.admissionDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={statusColors[selectedHospitalization.status]}>
                  {statusLabels[selectedHospitalization.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cama Actual">
                {selectedHospitalization.bedNumber ? (
                  <Tag color="blue">{selectedHospitalization.bedNumber} - {selectedHospitalization.bedArea}</Tag>
                ) : (
                  <Tag color="orange">Sin asignar</Tag>
                )}
              </Descriptions.Item>
              {selectedHospitalization.dischargeDate && (
                <Descriptions.Item label="Fecha Alta">
                  {dayjs(selectedHospitalization.dischargeDate).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              )}
              {selectedHospitalization.dischargeType && (
                <Descriptions.Item label="Tipo de Alta">
                  {dischargeTypeLabels[selectedHospitalization.dischargeType]}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Motivo de Ingreso" span={2}>
                {selectedHospitalization.admissionReason}
              </Descriptions.Item>
            </Descriptions>

            {transferHistory.length > 0 && (
              <>
                <Divider>Historial de Transferencias</Divider>
                <Timeline
                  items={transferHistory.map(transfer => ({
                    color: 'blue',
                    children: (
                      <div>
                        <Text strong>
                          {transfer.fromBedNumber} → {transfer.toBedNumber}
                        </Text>
                        <br />
                        <Text type="secondary">
                          {dayjs(transfer.transferredAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <br />
                        <Text italic>{transfer.reason}</Text>
                      </div>
                    )
                  }))}
                />
              </>
            )}
          </>
        )}
      </Modal>


      {/* Assign Bed Modal */}
      <Modal
        title="Asignar Cama"
        open={assignBedModalOpen}
        onCancel={() => {
          setAssignBedModalOpen(false)
          assignBedForm.resetFields()
          setSelectedHospitalization(null)
        }}
        onOk={() => assignBedForm.submit()}
        okText="Asignar"
        cancelText="Cancelar"
      >
        <Form
          form={assignBedForm}
          layout="vertical"
          onFinish={handleAssignBed}
        >
          <Form.Item
            name="bedId"
            label="Cama"
            rules={[{ required: true, message: 'Seleccione una cama' }]}
          >
            <Select
              placeholder="Seleccione una cama disponible"
              options={availableBeds.map(b => ({
                value: b.id,
                label: `${b.bedNumber} - ${b.area}`
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        title="Transferir Paciente"
        open={transferModalOpen}
        onCancel={() => {
          setTransferModalOpen(false)
          transferForm.resetFields()
          setSelectedHospitalization(null)
        }}
        onOk={() => transferForm.submit()}
        okText="Transferir"
        cancelText="Cancelar"
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransfer}
        >
          {selectedHospitalization?.bedNumber && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Cama actual: </Text>
              <Tag color="blue">{selectedHospitalization.bedNumber} - {selectedHospitalization.bedArea}</Tag>
            </div>
          )}
          
          <Form.Item
            name="toBedId"
            label="Nueva Cama"
            rules={[{ required: true, message: 'Seleccione la nueva cama' }]}
          >
            <Select
              placeholder="Seleccione la cama destino"
              options={availableBeds.map(b => ({
                value: b.id,
                label: `${b.bedNumber} - ${b.area}`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Motivo de Transferencia"
            rules={[{ required: true, message: 'Ingrese el motivo' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describa el motivo de la transferencia..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Discharge Modal */}
      <Modal
        title="Dar de Alta"
        open={dischargeModalOpen}
        onCancel={() => {
          setDischargeModalOpen(false)
          dischargeForm.resetFields()
          setSelectedHospitalization(null)
        }}
        onOk={() => dischargeForm.submit()}
        okText="Confirmar Alta"
        cancelText="Cancelar"
      >
        <Form
          form={dischargeForm}
          layout="vertical"
          onFinish={handleDischarge}
        >
          <Form.Item
            name="dischargeType"
            label="Tipo de Alta"
            rules={[{ required: true, message: 'Seleccione el tipo de alta' }]}
          >
            <Select
              placeholder="Seleccione el tipo de alta"
              options={[
                { value: 'MEDICAL', label: 'Alta Médica' },
                { value: 'VOLUNTARY', label: 'Alta Voluntaria' },
                { value: 'TRANSFER', label: 'Transferencia a otro centro' },
                { value: 'DECEASED', label: 'Fallecimiento' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="dischargeNotes"
            label="Notas de Alta"
          >
            <TextArea
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
