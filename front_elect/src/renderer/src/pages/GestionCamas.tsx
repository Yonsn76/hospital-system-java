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
  Badge,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import api, {
  BedRequest,
  BedResponse,
  BedStatus,
  HospitalizationResponse
} from '../services/api'
import { useAppSelector } from '../store'

const { Title, Text } = Typography

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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
`

const AreaCard = styled(Card)`
  margin-bottom: 16px;
`

const LegendContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const LegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$color};
`

const bedStatusColors: Record<BedStatus, string> = {
  AVAILABLE: '#52c41a',
  OCCUPIED: '#ff4d4f',
  MAINTENANCE: '#faad14',
  RESERVED: '#1890ff'
}

const bedStatusLabels: Record<BedStatus, string> = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupada',
  MAINTENANCE: 'Mantenimiento',
  RESERVED: 'Reservada'
}

const bedStatusIcons: Record<BedStatus, React.ReactNode> = {
  AVAILABLE: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  OCCUPIED: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  MAINTENANCE: <ToolOutlined style={{ color: '#faad14' }} />,
  RESERVED: <ClockCircleOutlined style={{ color: '#1890ff' }} />
}

export default function GestionCamas() {
  const [beds, setBeds] = useState<BedResponse[]>([])
  const [activeHospitalizations, setActiveHospitalizations] = useState<HospitalizationResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBed, setSelectedBed] = useState<BedResponse | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [areaFilter, setAreaFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<BedStatus | undefined>(undefined)
  
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  
  const [bedForm] = Form.useForm()
  
  const { user } = useAppSelector((state) => state.auth)
  const canManage = user?.role === 'ADMIN'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadBeds(), loadActiveHospitalizations()])
    } finally {
      setLoading(false)
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
      message.error('Error al cargar hospitalizaciones')
    }
  }

  const handleCreateBed = async (values: BedRequest) => {
    try {
      await api.createBed(values)
      message.success('Cama creada exitosamente')
      await loadBeds()
      setCreateModalOpen(false)
      bedForm.resetFields()
    } catch {
      message.error('Error al crear cama')
    }
  }

  const handleUpdateBed = async (values: BedRequest) => {
    if (!selectedBed) return
    try {
      await api.updateBed(selectedBed.id, values)
      message.success('Cama actualizada exitosamente')
      await loadBeds()
      setEditModalOpen(false)
      bedForm.resetFields()
      setSelectedBed(null)
    } catch {
      message.error('Error al actualizar cama')
    }
  }

  const handleDeleteBed = async (bedId: number) => {
    try {
      await api.deleteBed(bedId)
      message.success('Cama eliminada exitosamente')
      await loadBeds()
    } catch {
      message.error('Error al eliminar cama')
    }
  }

  const handleUpdateBedStatus = async (bedId: number, status: BedStatus) => {
    try {
      await api.updateBedStatus(bedId, status)
      message.success('Estado actualizado')
      await loadBeds()
    } catch {
      message.error('Error al actualizar estado')
    }
  }

  const openEditModal = (bed: BedResponse) => {
    setSelectedBed(bed)
    bedForm.setFieldsValue({ bedNumber: bed.bedNumber, area: bed.area, status: bed.status })
    setEditModalOpen(true)
  }

  const openDetailModal = (bed: BedResponse) => {
    setSelectedBed(bed)
    setDetailModalOpen(true)
  }

  const getHospitalizationForBed = (bedId: number): HospitalizationResponse | undefined => {
    return activeHospitalizations.find(h => h.bedId === bedId)
  }

  const areas = [...new Set(beds.map(b => b.area))].sort()

  const filteredBeds = beds.filter(bed => {
    if (areaFilter && bed.area !== areaFilter) return false
    if (statusFilter && bed.status !== statusFilter) return false
    return true
  })

  const bedsByArea = filteredBeds.reduce((acc, bed) => {
    if (!acc[bed.area]) acc[bed.area] = []
    acc[bed.area].push(bed)
    return acc
  }, {} as Record<string, BedResponse[]>)

  const totalBeds = beds.length
  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length
  const maintenanceBeds = beds.filter(b => b.status === 'MAINTENANCE').length
  const reservedBeds = beds.filter(b => b.status === 'RESERVED').length
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0


  const tableColumns = [
    {
      title: 'Número',
      dataIndex: 'bedNumber',
      key: 'bedNumber',
      width: 120,
      sorter: (a: BedResponse, b: BedResponse) => a.bedNumber.localeCompare(b.bedNumber)
    },
    {
      title: 'Área',
      dataIndex: 'area',
      key: 'area',
      width: 150,
      filters: areas.map(a => ({ text: a, value: a })),
      onFilter: (value: unknown, record: BedResponse) => record.area === value
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: BedStatus) => (
        <Tag icon={bedStatusIcons[status]} color={status === 'AVAILABLE' ? 'success' : status === 'OCCUPIED' ? 'error' : status === 'MAINTENANCE' ? 'warning' : 'processing'}>
          {bedStatusLabels[status]}
        </Tag>
      )
    },
    {
      title: 'Paciente',
      key: 'patient',
      width: 200,
      render: (_: unknown, record: BedResponse) => {
        const hosp = getHospitalizationForBed(record.id)
        return hosp ? <Text>{hosp.patientName}</Text> : <Text type="secondary">-</Text>
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: BedResponse) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button icon={<HomeOutlined />} size="small" onClick={() => openDetailModal(record)} />
          </Tooltip>
          {canManage && (
            <>
              <Tooltip title="Editar">
                <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)} />
              </Tooltip>
              {record.status !== 'OCCUPIED' && (
                <Popconfirm title="¿Eliminar esta cama?" onConfirm={() => handleDeleteBed(record.id)} okText="Sí" cancelText="No">
                  <Tooltip title="Eliminar">
                    <Button icon={<DeleteOutlined />} size="small" danger />
                  </Tooltip>
                </Popconfirm>
              )}
              {record.status === 'AVAILABLE' && (
                <Tooltip title="Poner en mantenimiento">
                  <Button icon={<ToolOutlined />} size="small" onClick={() => handleUpdateBedStatus(record.id, 'MAINTENANCE')} />
                </Tooltip>
              )}
              {record.status === 'MAINTENANCE' && (
                <Tooltip title="Marcar disponible">
                  <Button icon={<CheckCircleOutlined />} size="small" type="primary" onClick={() => handleUpdateBedStatus(record.id, 'AVAILABLE')} />
                </Tooltip>
              )}
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <PageContainer>
      <HeaderSection>
        <Title level={3}>
          <HomeOutlined style={{ marginRight: 8 }} />
          Gestión de Camas
        </Title>
        <Space>
          <Select placeholder="Filtrar por área" style={{ width: 150 }} allowClear value={areaFilter} onChange={setAreaFilter} options={areas.map(a => ({ value: a, label: a }))} />
          <Select placeholder="Filtrar por estado" style={{ width: 150 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(bedStatusLabels).map(([value, label]) => ({ value, label }))} />
          <Button icon={<ReloadOutlined />} onClick={loadData}>Actualizar</Button>
          <Select value={viewMode} onChange={setViewMode} style={{ width: 120 }} options={[{ value: 'grid', label: 'Cuadrícula' }, { value: 'table', label: 'Tabla' }]} />
          {canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { bedForm.resetFields(); setCreateModalOpen(true) }}>Nueva Cama</Button>
          )}
        </Space>
      </HeaderSection>

      <StatsCard>
        <Row gutter={16}>
          <Col span={4}><Statistic title="Total Camas" value={totalBeds} prefix={<HomeOutlined />} /></Col>
          <Col span={4}><Statistic title="Disponibles" value={availableBeds} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Col>
          <Col span={4}><Statistic title="Ocupadas" value={occupiedBeds} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Col>
          <Col span={4}><Statistic title="Mantenimiento" value={maintenanceBeds} valueStyle={{ color: '#faad14' }} prefix={<ToolOutlined />} /></Col>
          <Col span={4}><Statistic title="Reservadas" value={reservedBeds} valueStyle={{ color: '#1890ff' }} prefix={<ClockCircleOutlined />} /></Col>
          <Col span={4}><Statistic title="Tasa Ocupación" value={occupancyRate} suffix="%" prefix={<ExclamationCircleOutlined />} /></Col>
        </Row>
      </StatsCard>

      <LegendContainer>
        {Object.entries(bedStatusLabels).map(([status, label]) => (
          <LegendItem key={status}>
            <LegendDot $color={bedStatusColors[status as BedStatus]} />
            <Text>{label}</Text>
          </LegendItem>
        ))}
      </LegendContainer>

      {loading ? (
        <Card><div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div></Card>
      ) : viewMode === 'grid' ? (
        <>
          {Object.entries(bedsByArea).map(([area, areaBeds]) => (
            <AreaCard key={area} title={`Área: ${area}`} extra={<Badge count={areaBeds.length} style={{ backgroundColor: '#1890ff' }} />}>
              <BedGrid>
                {areaBeds.map(bed => {
                  const hosp = getHospitalizationForBed(bed.id)
                  return (
                    <Tooltip key={bed.id} title={hosp ? `Paciente: ${hosp.patientName}` : bedStatusLabels[bed.status]}>
                      <BedCard $status={bed.status} size="small" onClick={() => openDetailModal(bed)}>
                        <div style={{ textAlign: 'center' }}>
                          <HomeOutlined style={{ fontSize: 24, marginBottom: 8, color: bedStatusColors[bed.status] }} />
                          <div><Text strong>{bed.bedNumber}</Text></div>
                          <Badge status={bed.status === 'AVAILABLE' ? 'success' : bed.status === 'OCCUPIED' ? 'error' : bed.status === 'MAINTENANCE' ? 'warning' : 'processing'} text={<Text style={{ fontSize: 12 }}>{bedStatusLabels[bed.status]}</Text>} />
                        </div>
                      </BedCard>
                    </Tooltip>
                  )
                })}
              </BedGrid>
            </AreaCard>
          ))}
          {Object.keys(bedsByArea).length === 0 && <Card><Empty description="No hay camas que coincidan con los filtros" /></Card>}
        </>
      ) : (
        <Card>
          <Table columns={tableColumns} dataSource={filteredBeds} rowKey="id" pagination={{ pageSize: 15 }} locale={{ emptyText: <Empty description="No hay camas registradas" /> }} />
        </Card>
      )}


      <Modal title="Nueva Cama" open={createModalOpen} onCancel={() => { setCreateModalOpen(false); bedForm.resetFields() }} onOk={() => bedForm.submit()} okText="Crear" cancelText="Cancelar">
        <Form form={bedForm} layout="vertical" onFinish={handleCreateBed}>
          <Form.Item name="bedNumber" label="Número de Cama" rules={[{ required: true, message: 'Ingrese el número de cama' }]}>
            <Input placeholder="Ej: C-101, UCI-01" />
          </Form.Item>
          <Form.Item name="area" label="Área" rules={[{ required: true, message: 'Ingrese el área' }]}>
            <Select showSearch placeholder="Seleccione o escriba el área" allowClear options={areas.map(a => ({ value: a, label: a }))} mode="tags" maxCount={1} />
          </Form.Item>
          <Form.Item name="status" label="Estado Inicial" initialValue="AVAILABLE">
            <Select options={[{ value: 'AVAILABLE', label: 'Disponible' }, { value: 'MAINTENANCE', label: 'Mantenimiento' }, { value: 'RESERVED', label: 'Reservada' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Editar Cama" open={editModalOpen} onCancel={() => { setEditModalOpen(false); bedForm.resetFields(); setSelectedBed(null) }} onOk={() => bedForm.submit()} okText="Guardar" cancelText="Cancelar">
        <Form form={bedForm} layout="vertical" onFinish={handleUpdateBed}>
          <Form.Item name="bedNumber" label="Número de Cama" rules={[{ required: true, message: 'Ingrese el número de cama' }]}>
            <Input placeholder="Ej: C-101, UCI-01" />
          </Form.Item>
          <Form.Item name="area" label="Área" rules={[{ required: true, message: 'Ingrese el área' }]}>
            <Select showSearch placeholder="Seleccione o escriba el área" allowClear options={areas.map(a => ({ value: a, label: a }))} mode="tags" maxCount={1} />
          </Form.Item>
          {selectedBed?.status !== 'OCCUPIED' && (
            <Form.Item name="status" label="Estado">
              <Select options={[{ value: 'AVAILABLE', label: 'Disponible' }, { value: 'MAINTENANCE', label: 'Mantenimiento' }, { value: 'RESERVED', label: 'Reservada' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal title="Detalle de Cama" open={detailModalOpen} onCancel={() => { setDetailModalOpen(false); setSelectedBed(null) }} footer={[
        <Button key="close" onClick={() => setDetailModalOpen(false)}>Cerrar</Button>,
        canManage && selectedBed && selectedBed.status !== 'OCCUPIED' && (
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { setDetailModalOpen(false); openEditModal(selectedBed) }}>Editar</Button>
        )
      ].filter(Boolean)} width={500}>
        {selectedBed && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <HomeOutlined style={{ fontSize: 48, color: bedStatusColors[selectedBed.status] }} />
              <Title level={3} style={{ marginTop: 8, marginBottom: 4 }}>{selectedBed.bedNumber}</Title>
              <Tag icon={bedStatusIcons[selectedBed.status]} color={selectedBed.status === 'AVAILABLE' ? 'success' : selectedBed.status === 'OCCUPIED' ? 'error' : selectedBed.status === 'MAINTENANCE' ? 'warning' : 'processing'} style={{ fontSize: 14 }}>
                {bedStatusLabels[selectedBed.status]}
              </Tag>
            </div>
            <Card size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}><Text type="secondary">Área:</Text><div><Text strong>{selectedBed.area}</Text></div></Col>
                <Col span={12}><Text type="secondary">Estado:</Text><div><Text strong>{bedStatusLabels[selectedBed.status]}</Text></div></Col>
              </Row>
            </Card>
            {selectedBed.status === 'OCCUPIED' && (() => {
              const hosp = getHospitalizationForBed(selectedBed.id)
              if (hosp) {
                return (
                  <Card size="small" style={{ marginTop: 16 }} title="Paciente Actual">
                    <Row gutter={[16, 16]}>
                      <Col span={24}><Text type="secondary">Nombre:</Text><div><Text strong>{hosp.patientName}</Text></div></Col>
                      <Col span={24}><Text type="secondary">Doctor:</Text><div><Text strong>{hosp.admittingDoctorName}</Text></div></Col>
                      <Col span={24}><Text type="secondary">Motivo:</Text><div><Text>{hosp.admissionReason}</Text></div></Col>
                    </Row>
                  </Card>
                )
              }
              return null
            })()}
            {canManage && selectedBed.status !== 'OCCUPIED' && (
              <Card size="small" style={{ marginTop: 16 }} title="Acciones Rápidas">
                <Space>
                  {selectedBed.status === 'AVAILABLE' && (
                    <Button icon={<ToolOutlined />} onClick={() => { handleUpdateBedStatus(selectedBed.id, 'MAINTENANCE'); setDetailModalOpen(false) }}>Mantenimiento</Button>
                  )}
                  {selectedBed.status === 'MAINTENANCE' && (
                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { handleUpdateBedStatus(selectedBed.id, 'AVAILABLE'); setDetailModalOpen(false) }}>Disponible</Button>
                  )}
                  {selectedBed.status === 'RESERVED' && (
                    <Button icon={<CheckCircleOutlined />} onClick={() => { handleUpdateBedStatus(selectedBed.id, 'AVAILABLE'); setDetailModalOpen(false) }}>Liberar</Button>
                  )}
                </Space>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
