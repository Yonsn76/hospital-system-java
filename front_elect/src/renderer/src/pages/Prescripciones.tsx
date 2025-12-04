import { useEffect, useState, useRef } from 'react'
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
  Divider
} from 'antd'
import {
  PlusOutlined,
  PrinterOutlined,
  EyeOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { useReactToPrint } from 'react-to-print'
import api, {
  PatientResponse,
  PrescriptionResponse,
  PrescriptionRequest,
  PrescriptionItemRequest,
  PrescriptionPrintResponse,
  PrescriptionStatus,
  DoctorResponse,
  AppointmentResponse
} from '../services/api'
import { useAppSelector } from '../store'
import PrintableDocument from '../components/PrintableDocument'

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

const MedicationCard = styled(Card)`
  margin-bottom: 12px;
  border: 1px solid #d9d9d9;
  
  .ant-card-body {
    padding: 16px;
  }
`

const MedicationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const PrintPreviewContainer = styled.div`
  @media screen {
    max-height: 70vh;
    overflow: auto;
    background: #f0f0f0;
    padding: 20px;
  }
`

const HiddenPrintArea = styled.div`
  display: none;
`

const statusColors: Record<PrescriptionStatus, string> = {
  ACTIVE: 'green',
  COMPLETED: 'blue',
  CANCELLED: 'red'
}

const statusLabels: Record<PrescriptionStatus, string> = {
  ACTIVE: 'Activa',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
}

export default function Prescripciones() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null)
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([])
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionResponse | null>(null)
  const [printData, setPrintData] = useState<PrescriptionPrintResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | undefined>(undefined)
  
  // Medication items state
  const [medicationItems, setMedicationItems] = useState<PrescriptionItemRequest[]>([
    { medicationName: '', dose: '', frequency: '', duration: '', instructions: '' }
  ])
  
  const [createForm] = Form.useForm()
  const printRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAppSelector((state) => state.auth)
  const canCreate = user?.role === 'DOCTOR'

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receta_${printData?.prescriptionId || 'nueva'}`,
  })

  useEffect(() => {
    loadPatients()
    loadDoctors()
  }, [])

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

  const loadPatientAppointments = async (patientId: number) => {
    try {
      const data = await api.getAppointmentsByPatient(patientId)
      const relevantAppointments = data.filter(
        apt => ['COMPLETED', 'IN_PROGRESS'].includes(apt.status)
      )
      setAppointments(relevantAppointments)
    } catch {
      setAppointments([])
    }
  }

  const loadPrescriptions = async (patientId: number, status?: PrescriptionStatus) => {
    setLoading(true)
    try {
      const data = await api.getPrescriptionsByPatient(patientId, status)
      const sortedPrescriptions = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setPrescriptions(sortedPrescriptions)
    } catch {
      setPrescriptions([])
      message.error('Error al cargar prescripciones')
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    setSelectedPrescription(null)
    if (patient) {
      loadPrescriptions(patient.id, statusFilter)
      loadPatientAppointments(patient.id)
    }
  }

  const handleStatusFilterChange = (status: PrescriptionStatus | undefined) => {
    setStatusFilter(status)
    if (selectedPatient) {
      loadPrescriptions(selectedPatient.id, status)
    }
  }

  const addMedicationItem = () => {
    setMedicationItems([
      ...medicationItems,
      { medicationName: '', dose: '', frequency: '', duration: '', instructions: '' }
    ])
  }

  const removeMedicationItem = (index: number) => {
    if (medicationItems.length > 1) {
      const newItems = medicationItems.filter((_, i) => i !== index)
      setMedicationItems(newItems)
    }
  }

  const updateMedicationItem = (index: number, field: keyof PrescriptionItemRequest, value: string) => {
    const newItems = [...medicationItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setMedicationItems(newItems)
  }

  const validateMedicationItems = (): boolean => {
    for (const item of medicationItems) {
      if (!item.medicationName.trim() || !item.dose.trim() || 
          !item.frequency.trim() || !item.duration.trim()) {
        return false
      }
    }
    return true
  }

  const handleCreatePrescription = async (values: {
    doctorId: number
    appointmentId?: number
    notes?: string
  }) => {
    if (!selectedPatient) return
    
    if (!validateMedicationItems()) {
      message.error('Complete todos los campos requeridos de los medicamentos')
      return
    }
    
    try {
      const prescriptionData: PrescriptionRequest = {
        patientId: selectedPatient.id,
        doctorId: values.doctorId,
        appointmentId: values.appointmentId,
        notes: values.notes,
        items: medicationItems.map(item => ({
          ...item,
          instructions: item.instructions || ''
        }))
      }
      
      await api.createPrescription(prescriptionData)
      message.success('Prescripción creada exitosamente')
      loadPrescriptions(selectedPatient.id, statusFilter)
      setCreateModalOpen(false)
      createForm.resetFields()
      setMedicationItems([
        { medicationName: '', dose: '', frequency: '', duration: '', instructions: '' }
      ])
    } catch {
      message.error('Error al crear prescripción')
    }
  }

  const handleUpdateStatus = async (prescriptionId: number, newStatus: PrescriptionStatus) => {
    try {
      await api.updatePrescriptionStatus(prescriptionId, { status: newStatus })
      message.success(`Prescripción ${statusLabels[newStatus].toLowerCase()}`)
      if (selectedPatient) {
        loadPrescriptions(selectedPatient.id, statusFilter)
      }
      if (selectedPrescription?.id === prescriptionId) {
        setSelectedPrescription(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch {
      message.error('Error al actualizar estado')
    }
  }

  const handleViewPrescription = (prescription: PrescriptionResponse) => {
    setSelectedPrescription(prescription)
    setViewModalOpen(true)
  }

  const handlePrintPreview = async (prescriptionId: number) => {
    setPrintLoading(true)
    try {
      const data = await api.getPrescriptionForPrint(prescriptionId)
      setPrintData(data)
      setPrintPreviewOpen(true)
    } catch {
      message.error('Error al cargar datos de impresión')
    } finally {
      setPrintLoading(false)
    }
  }

  const openCreateModal = () => {
    createForm.resetFields()
    setMedicationItems([
      { medicationName: '', dose: '', frequency: '', duration: '', instructions: '' }
    ])
    setCreateModalOpen(true)
  }

  const prescriptionsColumns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 200
    },
    {
      title: 'Medicamentos',
      dataIndex: 'items',
      key: 'items',
      render: (items: PrescriptionResponse['items']) => (
        <Space direction="vertical" size={0}>
          {items.slice(0, 2).map((item, idx) => (
            <Text key={idx} ellipsis style={{ maxWidth: 200 }}>
              • {item.medicationName}
            </Text>
          ))}
          {items.length > 2 && (
            <Text type="secondary">+{items.length - 2} más</Text>
          )}
        </Space>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PrescriptionStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: PrescriptionResponse) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewPrescription(record)}
            />
          </Tooltip>
          <Tooltip title="Imprimir">
            <Button
              icon={<PrinterOutlined />}
              size="small"
              loading={printLoading}
              onClick={() => handlePrintPreview(record.id)}
            />
          </Tooltip>
          {record.status === 'ACTIVE' && (
            <>
              <Tooltip title="Marcar completada">
                <Button
                  icon={<CheckCircleOutlined />}
                  size="small"
                  onClick={() => handleUpdateStatus(record.id, 'COMPLETED')}
                />
              </Tooltip>
              <Tooltip title="Cancelar">
                <Button
                  icon={<CloseCircleOutlined />}
                  size="small"
                  danger
                  onClick={() => handleUpdateStatus(record.id, 'CANCELLED')}
                />
              </Tooltip>
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
          <MedicineBoxOutlined style={{ marginRight: 8 }} />
          Prescripciones
        </Title>
        <Space wrap>
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
          <Select
            placeholder="Filtrar por estado"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={[
              { value: 'ACTIVE', label: 'Activas' },
              { value: 'COMPLETED', label: 'Completadas' },
              { value: 'CANCELLED', label: 'Canceladas' }
            ]}
          />
          {selectedPatient && canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Nueva Prescripción
            </Button>
          )}
        </Space>
      </HeaderSection>

      {!selectedPatient ? (
        <Card>
          <Empty description="Seleccione un paciente para ver sus prescripciones" />
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
                {prescriptions.length} prescripci{prescriptions.length !== 1 ? 'ones' : 'ón'}
              </Tag>
            </div>
          </PatientInfoCard>

          <Card title="Historial de Prescripciones">
            <Table
              columns={prescriptionsColumns}
              dataSource={prescriptions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="No hay prescripciones registradas" /> }}
            />
          </Card>
        </>
      )}

      {/* Create Prescription Modal */}
      <Modal
        title="Nueva Prescripción"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          createForm.resetFields()
          setMedicationItems([
            { medicationName: '', dose: '', frequency: '', duration: '', instructions: '' }
          ])
        }}
        onOk={() => createForm.submit()}
        width={800}
        okText="Crear Prescripción"
        cancelText="Cancelar"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreatePrescription}
        >
          <Form.Item
            name="doctorId"
            label="Doctor"
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
            name="appointmentId"
            label="Cita Asociada (Opcional)"
          >
            <Select
              allowClear
              placeholder="Seleccione una cita (opcional)"
              options={appointments.map(apt => ({
                value: apt.id,
                label: `${dayjs(apt.appointmentTime).format('DD/MM/YYYY HH:mm')} - ${apt.reason}`
              }))}
            />
          </Form.Item>

          <Divider>Medicamentos</Divider>

          {medicationItems.map((item, index) => (
            <MedicationCard key={index}>
              <MedicationHeader>
                <Text strong>Medicamento {index + 1}</Text>
                {medicationItems.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeMedicationItem(index)}
                  >
                    Eliminar
                  </Button>
                )}
              </MedicationHeader>
              
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Input
                  placeholder="Nombre del medicamento *"
                  value={item.medicationName}
                  onChange={(e) => updateMedicationItem(index, 'medicationName', e.target.value)}
                />
                <Space style={{ width: '100%' }}>
                  <Input
                    placeholder="Dosis *"
                    value={item.dose}
                    onChange={(e) => updateMedicationItem(index, 'dose', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Input
                    placeholder="Frecuencia *"
                    value={item.frequency}
                    onChange={(e) => updateMedicationItem(index, 'frequency', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Input
                    placeholder="Duración *"
                    value={item.duration}
                    onChange={(e) => updateMedicationItem(index, 'duration', e.target.value)}
                    style={{ flex: 1 }}
                  />
                </Space>
                <Input
                  placeholder="Instrucciones especiales (opcional)"
                  value={item.instructions}
                  onChange={(e) => updateMedicationItem(index, 'instructions', e.target.value)}
                />
              </Space>
            </MedicationCard>
          ))}

          <Button
            type="dashed"
            onClick={addMedicationItem}
            block
            icon={<PlusOutlined />}
            style={{ marginBottom: 16 }}
          >
            Agregar Medicamento
          </Button>

          <Form.Item
            name="notes"
            label="Observaciones"
          >
            <TextArea
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        title="Detalle de Prescripción"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Cerrar
          </Button>,
          selectedPrescription && (
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => {
                setViewModalOpen(false)
                handlePrintPreview(selectedPrescription.id)
              }}
            >
              Imprimir
            </Button>
          )
        ].filter(Boolean)}
        width={700}
      >
        {selectedPrescription && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Paciente">
                {selectedPrescription.patientName}
              </Descriptions.Item>
              <Descriptions.Item label="Doctor">
                {selectedPrescription.doctorName}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {dayjs(selectedPrescription.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={statusColors[selectedPrescription.status]}>
                  {statusLabels[selectedPrescription.status]}
                </Tag>
              </Descriptions.Item>
              {selectedPrescription.notes && (
                <Descriptions.Item label="Observaciones" span={2}>
                  {selectedPrescription.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Medicamentos ({selectedPrescription.items.length})</Divider>

            {selectedPrescription.items.map((item, index) => (
              <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>{index + 1}. {item.medicationName}</Text>
                  <Space split={<Divider type="vertical" />}>
                    <Text>Dosis: {item.dose}</Text>
                    <Text>Frecuencia: {item.frequency}</Text>
                    <Text>Duración: {item.duration}</Text>
                  </Space>
                  {item.instructions && (
                    <Text type="secondary" italic>
                      Indicaciones: {item.instructions}
                    </Text>
                  )}
                </Space>
              </Card>
            ))}
          </>
        )}
      </Modal>

      {/* Print Preview Modal */}
      <Modal
        title="Vista Previa de Impresión"
        open={printPreviewOpen}
        onCancel={() => {
          setPrintPreviewOpen(false)
          setPrintData(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setPrintPreviewOpen(false)
            setPrintData(null)
          }}>
            Cerrar
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
          >
            Imprimir
          </Button>
        ]}
        width={900}
      >
        {printData && (
          <PrintPreviewContainer>
            <PrintableDocument data={printData} ref={printRef} />
          </PrintPreviewContainer>
        )}
      </Modal>

      {/* Hidden print area for actual printing */}
      <HiddenPrintArea>
        {printData && <PrintableDocument data={printData} ref={printRef} />}
      </HiddenPrintArea>
    </PageContainer>
  )
}
