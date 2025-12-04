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
  List,
  Avatar
} from 'antd'
import {
  PlusOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  MedicineBoxOutlined,
  PlayCircleOutlined,
  LogoutOutlined,
  SearchOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import api, {
  TriageRequest,
  TriageResponse,
  TriagePriority,
  TriageStatus,
  TriagePriorityRequest,
  PatientResponse
} from '../services/api'
import { useAppSelector } from '../store'
import PriorityIndicator, { priorityConfig } from '../components/PriorityIndicator'

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

const WaitingListCard = styled(Card)`
  .ant-card-body {
    padding: 0;
  }
`

const WaitingItem = styled.div<{ $priority: TriagePriority | null }>`
  padding: 16px;
  border-left: 4px solid ${props => props.$priority ? priorityConfig[props.$priority].bgColor : '#d9d9d9'};
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:last-child {
    border-bottom: none;
  }
`

const PrioritySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`

const PriorityButton = styled(Button)<{ $bgColor: string; $color: string; $selected: boolean }>`
  height: auto;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 2px solid ${props => props.$selected ? props.$bgColor : '#d9d9d9'};
  background-color: ${props => props.$selected ? props.$bgColor : 'transparent'};
  color: ${props => props.$selected ? props.$color : 'inherit'};
  
  &:hover {
    border-color: ${props => props.$bgColor} !important;
    background-color: ${props => props.$bgColor}20 !important;
  }
`

const triageStatusLabels: Record<TriageStatus, string> = {
  WAITING: 'En Espera',
  IN_PROGRESS: 'En Atención',
  ATTENDED: 'Atendido',
  LEFT: 'Se Retiró'
}

const triageStatusColors: Record<TriageStatus, string> = {
  WAITING: 'orange',
  IN_PROGRESS: 'processing',
  ATTENDED: 'success',
  LEFT: 'default'
}

export default function Triaje() {
  const [triageList, setTriageList] = useState<TriageResponse[]>([])
  const [waitingList, setWaitingList] = useState<TriageResponse[]>([])
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTriage, setSelectedTriage] = useState<TriageResponse | null>(null)
  const [statusFilter, setStatusFilter] = useState<TriageStatus | undefined>(undefined)
  
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  
  const [triageForm] = Form.useForm()
  const [priorityForm] = Form.useForm()
  const [selectedPriority, setSelectedPriority] = useState<TriagePriority | null>(null)
  
  const { user } = useAppSelector((state) => state.auth)
  const canTriage = user?.role === 'NURSE' || user?.role === 'ADMIN' || user?.role === 'DOCTOR'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadWaitingList(), loadPatients()])
    } finally {
      setLoading(false)
    }
  }

  const loadWaitingList = async () => {
    try {
      const data = await api.getTriageWaitingList()
      setWaitingList(data)
    } catch {
      message.error('Error al cargar lista de espera')
    }
  }

  const loadTriageByStatus = async (status: TriageStatus) => {
    try {
      const data = await api.getTriageByStatus(status)
      setTriageList(data)
    } catch {
      message.error('Error al cargar triajes')
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

  const handleCreateTriage = async (values: TriageRequest) => {
    try {
      await api.createTriage(values)
      message.success('Triaje creado exitosamente')
      await loadWaitingList()
      setCreateModalOpen(false)
      triageForm.resetFields()
    } catch {
      message.error('Error al crear triaje')
    }
  }

  const handleAssignPriority = async (values: TriagePriorityRequest) => {
    if (!selectedTriage) return
    try {
      await api.assignTriagePriority(selectedTriage.id, {
        priorityLevel: selectedPriority!,
        recommendedDestination: values.recommendedDestination
      })
      message.success('Prioridad asignada exitosamente')
      await loadWaitingList()
      setPriorityModalOpen(false)
      priorityForm.resetFields()
      setSelectedPriority(null)
      setSelectedTriage(null)
    } catch {
      message.error('Error al asignar prioridad')
    }
  }

  const handleMarkInProgress = async (triageId: number) => {
    try {
      await api.markTriageAsInProgress(triageId)
      message.success('Paciente en atención')
      await loadWaitingList()
    } catch {
      message.error('Error al actualizar estado')
    }
  }

  const handleMarkAttended = async (triageId: number) => {
    try {
      await api.markTriageAsAttended(triageId)
      message.success('Paciente atendido')
      await loadWaitingList()
    } catch {
      message.error('Error al actualizar estado')
    }
  }

  const handleMarkLeft = async (triageId: number) => {
    try {
      await api.markTriageAsLeft(triageId)
      message.success('Paciente marcado como retirado')
      await loadWaitingList()
    } catch {
      message.error('Error al actualizar estado')
    }
  }

  const openPriorityModal = (triage: TriageResponse) => {
    setSelectedTriage(triage)
    setSelectedPriority(triage.priorityLevel)
    priorityForm.setFieldsValue({ recommendedDestination: triage.recommendedDestination })
    setPriorityModalOpen(true)
  }

  const openDetailModal = (triage: TriageResponse) => {
    setSelectedTriage(triage)
    setDetailModalOpen(true)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
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

  const getWaitTime = (arrivedAt: string) => {
    const arrived = new Date(arrivedAt)
    const now = new Date()
    const diffMs = now.getTime() - arrived.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins} min`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  // Stats
  const totalWaiting = waitingList.filter(t => t.status === 'WAITING').length
  const inProgress = waitingList.filter(t => t.status === 'IN_PROGRESS').length
  const criticalCount = waitingList.filter(t => t.priorityLevel === 'RESUSCITATION' || t.priorityLevel === 'EMERGENT').length
  const unclassified = waitingList.filter(t => !t.priorityLevel).length

  const tableColumns = [
    {
      title: 'Prioridad',
      key: 'priority',
      width: 150,
      render: (_: unknown, record: TriageResponse) => (
        <PriorityIndicator priority={record.priorityLevel} size="small" />
      ),
      sorter: (a: TriageResponse, b: TriageResponse) => {
        const aLevel = a.priorityLevel ? priorityConfig[a.priorityLevel].level : 99
        const bLevel = b.priorityLevel ? priorityConfig[b.priorityLevel].level : 99
        return aLevel - bLevel
      }
    },
    {
      title: 'Paciente',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 200
    },
    {
      title: 'Motivo de Consulta',
      dataIndex: 'chiefComplaint',
      key: 'chiefComplaint',
      ellipsis: true
    },
    {
      title: 'Llegada',
      dataIndex: 'arrivedAt',
      key: 'arrivedAt',
      width: 100,
      render: (val: string) => formatTime(val)
    },
    {
      title: 'Espera',
      key: 'waitTime',
      width: 100,
      render: (_: unknown, record: TriageResponse) => (
        <Text type={record.status === 'WAITING' ? 'warning' : 'secondary'}>
          {getWaitTime(record.arrivedAt)}
        </Text>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TriageStatus) => (
        <Tag color={triageStatusColors[status]}>{triageStatusLabels[status]}</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: TriageResponse) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button icon={<SearchOutlined />} size="small" onClick={() => openDetailModal(record)} />
          </Tooltip>
          {canTriage && record.status === 'WAITING' && (
            <>
              <Tooltip title="Asignar prioridad">
                <Button icon={<ExclamationCircleOutlined />} size="small" type="primary" onClick={() => openPriorityModal(record)} />
              </Tooltip>
              <Tooltip title="Iniciar atención">
                <Button icon={<PlayCircleOutlined />} size="small" onClick={() => handleMarkInProgress(record.id)} />
              </Tooltip>
            </>
          )}
          {canTriage && record.status === 'IN_PROGRESS' && (
            <Tooltip title="Marcar atendido">
              <Button icon={<CheckCircleOutlined />} size="small" type="primary" onClick={() => handleMarkAttended(record.id)} />
            </Tooltip>
          )}
          {canTriage && (record.status === 'WAITING' || record.status === 'IN_PROGRESS') && (
            <Tooltip title="Se retiró">
              <Button icon={<LogoutOutlined />} size="small" danger onClick={() => handleMarkLeft(record.id)} />
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
          <MedicineBoxOutlined style={{ marginRight: 8 }} />
          Triaje
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData}>Actualizar</Button>
          {canTriage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { triageForm.resetFields(); setCreateModalOpen(true) }}>
              Nuevo Triaje
            </Button>
          )}
        </Space>
      </HeaderSection>

      <StatsCard>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic 
              title="En Espera" 
              value={totalWaiting} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="En Atención" 
              value={inProgress} 
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Críticos" 
              value={criticalCount} 
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Sin Clasificar" 
              value={unclassified} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Col>
        </Row>
      </StatsCard>

      <Tabs defaultActiveKey="waiting" items={[
        {
          key: 'waiting',
          label: <Badge count={totalWaiting} offset={[10, 0]}>Lista de Espera</Badge>,
          children: loading ? (
            <Card><div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div></Card>
          ) : (
            <Row gutter={16}>
              <Col span={16}>
                <Card title="Cola de Atención" extra={<Text type="secondary">Ordenado por prioridad y hora de llegada</Text>}>
                  <Table 
                    columns={tableColumns} 
                    dataSource={waitingList.filter(t => t.status === 'WAITING' || t.status === 'IN_PROGRESS')} 
                    rowKey="id" 
                    pagination={false}
                    locale={{ emptyText: <Empty description="No hay pacientes en espera" /> }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <WaitingListCard title="Vista Rápida">
                  {waitingList.filter(t => t.status === 'WAITING').length === 0 ? (
                    <Empty description="No hay pacientes esperando" style={{ padding: 24 }} />
                  ) : (
                    <List
                      dataSource={waitingList.filter(t => t.status === 'WAITING')}
                      renderItem={(item) => (
                        <WaitingItem $priority={item.priorityLevel} onClick={() => openDetailModal(item)} style={{ cursor: 'pointer' }}>
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text strong>{item.patientName}</Text>
                              <PriorityIndicator priority={item.priorityLevel} showLabel={false} size="small" />
                            </Space>
                            <Text type="secondary" ellipsis style={{ maxWidth: '100%' }}>{item.chiefComplaint}</Text>
                            <Space>
                              <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                              <Text type="secondary">{getWaitTime(item.arrivedAt)}</Text>
                            </Space>
                          </Space>
                        </WaitingItem>
                      )}
                    />
                  )}
                </WaitingListCard>
              </Col>
            </Row>
          )
        },
        {
          key: 'history',
          label: 'Historial',
          children: (
            <Card>
              <Space style={{ marginBottom: 16 }}>
                <Select 
                  placeholder="Filtrar por estado" 
                  style={{ width: 200 }} 
                  allowClear
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val)
                    if (val) loadTriageByStatus(val)
                  }}
                  options={Object.entries(triageStatusLabels).map(([value, label]) => ({ value, label }))}
                />
              </Space>
              <Table 
                columns={tableColumns} 
                dataSource={triageList} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: <Empty description="Seleccione un estado para ver el historial" /> }}
              />
            </Card>
          )
        }
      ]} />

      {/* Create Triage Modal */}
      <Modal 
        title="Nuevo Triaje" 
        open={createModalOpen} 
        onCancel={() => { setCreateModalOpen(false); triageForm.resetFields() }} 
        onOk={() => triageForm.submit()} 
        okText="Crear" 
        cancelText="Cancelar"
        width={600}
      >
        <Form form={triageForm} layout="vertical" onFinish={handleCreateTriage}>
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
            name="chiefComplaint" 
            label="Motivo de Consulta" 
            rules={[{ required: true, message: 'Ingrese el motivo de consulta' }]}
          >
            <TextArea rows={3} placeholder="Describa el motivo principal de la visita..." />
          </Form.Item>
          <Form.Item 
            name="initialAssessment" 
            label="Evaluación Inicial"
          >
            <TextArea rows={3} placeholder="Observaciones iniciales del personal de triaje..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Priority Modal */}
      <Modal 
        title="Asignar Prioridad" 
        open={priorityModalOpen} 
        onCancel={() => { setPriorityModalOpen(false); priorityForm.resetFields(); setSelectedPriority(null); setSelectedTriage(null) }} 
        onOk={() => {
          if (!selectedPriority) {
            message.warning('Seleccione un nivel de prioridad')
            return
          }
          priorityForm.submit()
        }} 
        okText="Asignar" 
        cancelText="Cancelar"
        width={700}
      >
        {selectedTriage && (
          <>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Paciente:</Text>
                  <div><Text strong>{selectedTriage.patientName}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Motivo:</Text>
                  <div><Text>{selectedTriage.chiefComplaint}</Text></div>
                </Col>
              </Row>
            </Card>
            
            <Divider>Seleccione Nivel de Prioridad</Divider>
            
            <PrioritySelector>
              {(Object.keys(priorityConfig) as TriagePriority[]).map((priority) => {
                const config = priorityConfig[priority]
                return (
                  <PriorityButton
                    key={priority}
                    $bgColor={config.bgColor}
                    $color={config.color}
                    $selected={selectedPriority === priority}
                    onClick={() => setSelectedPriority(priority)}
                  >
                    <span style={{ fontSize: 24, fontWeight: 700 }}>{config.level}</span>
                    <span style={{ fontSize: 12 }}>{config.labelEs}</span>
                  </PriorityButton>
                )
              })}
            </PrioritySelector>
            
            <Form form={priorityForm} layout="vertical" onFinish={handleAssignPriority}>
              <Form.Item name="recommendedDestination" label="Destino Recomendado">
                <Select 
                  placeholder="Seleccione destino..." 
                  allowClear
                  options={[
                    { value: 'Emergencias', label: 'Emergencias' },
                    { value: 'Consulta Externa', label: 'Consulta Externa' },
                    { value: 'UCI', label: 'UCI' },
                    { value: 'Observación', label: 'Observación' },
                    { value: 'Cirugía', label: 'Cirugía' },
                    { value: 'Pediatría', label: 'Pediatría' },
                    { value: 'Ginecología', label: 'Ginecología' }
                  ]}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal 
        title="Detalle de Triaje" 
        open={detailModalOpen} 
        onCancel={() => { setDetailModalOpen(false); setSelectedTriage(null) }} 
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>Cerrar</Button>,
          canTriage && selectedTriage?.status === 'WAITING' && (
            <Button key="priority" type="primary" icon={<ExclamationCircleOutlined />} onClick={() => { setDetailModalOpen(false); openPriorityModal(selectedTriage!) }}>
              Asignar Prioridad
            </Button>
          )
        ].filter(Boolean)}
        width={600}
      >
        {selectedTriage && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>{selectedTriage.patientName}</Title>
              <PriorityIndicator priority={selectedTriage.priorityLevel} />
            </div>
            
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Estado:</Text>
                  <div><Tag color={triageStatusColors[selectedTriage.status]}>{triageStatusLabels[selectedTriage.status]}</Tag></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Hora de Llegada:</Text>
                  <div><Text strong>{formatDateTime(selectedTriage.arrivedAt)}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Tiempo de Espera:</Text>
                  <div><Text strong>{getWaitTime(selectedTriage.arrivedAt)}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Triaje Realizado:</Text>
                  <div><Text strong>{formatDateTime(selectedTriage.triagedAt)}</Text></div>
                </Col>
                {selectedTriage.attendedAt && (
                  <Col span={12}>
                    <Text type="secondary">Hora de Atención:</Text>
                    <div><Text strong>{formatDateTime(selectedTriage.attendedAt)}</Text></div>
                  </Col>
                )}
                {selectedTriage.recommendedDestination && (
                  <Col span={12}>
                    <Text type="secondary">Destino Recomendado:</Text>
                    <div><Text strong>{selectedTriage.recommendedDestination}</Text></div>
                  </Col>
                )}
              </Row>
            </Card>
            
            <Card size="small" title="Motivo de Consulta" style={{ marginBottom: 16 }}>
              <Text>{selectedTriage.chiefComplaint}</Text>
            </Card>
            
            {selectedTriage.initialAssessment && (
              <Card size="small" title="Evaluación Inicial">
                <Text>{selectedTriage.initialAssessment}</Text>
              </Card>
            )}
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Enfermero/a:</Text>
                <div><Text>{selectedTriage.nurseName}</Text></div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
