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
  Switch,
  Alert
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  ExperimentOutlined,
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import api, {
  PatientResponse,
  DoctorResponse,
  AppointmentResponse,
  LabExamRequest,
  LabExamResponse,
  LabResultRequest,
  LabResultsUploadRequest,
  ExamPriority,
  ExamStatus
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

const ResultCard = styled(Card)<{ $isAbnormal?: boolean }>`
  margin-bottom: 12px;
  border: 1px solid ${props => props.$isAbnormal ? '#ff4d4f' : '#d9d9d9'};
  background: ${props => props.$isAbnormal ? 'rgba(255, 77, 79, 0.05)' : 'inherit'};
  
  .ant-card-body {
    padding: 16px;
  }
`

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const AbnormalBadge = styled(Tag)`
  font-weight: bold;
`

const priorityColors: Record<ExamPriority, string> = {
  ROUTINE: 'default',
  URGENT: 'orange',
  STAT: 'red'
}

const priorityLabels: Record<ExamPriority, string> = {
  ROUTINE: 'Rutina',
  URGENT: 'Urgente',
  STAT: 'Inmediato'
}

const statusColors: Record<ExamStatus, string> = {
  REQUESTED: 'blue',
  IN_PROGRESS: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red'
}

const statusLabels: Record<ExamStatus, string> = {
  REQUESTED: 'Solicitado',
  IN_PROGRESS: 'En Proceso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado'
}

const statusIcons: Record<ExamStatus, React.ReactNode> = {
  REQUESTED: <ClockCircleOutlined />,
  IN_PROGRESS: <SyncOutlined spin />,
  COMPLETED: <CheckCircleOutlined />,
  CANCELLED: <CloseCircleOutlined />
}

export default function Laboratorio() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null)
  const [labExams, setLabExams] = useState<LabExamResponse[]>([])
  const [selectedExam, setSelectedExam] = useState<LabExamResponse | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [uploadResultsModalOpen, setUploadResultsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ExamStatus | undefined>(undefined)
  
  // Results upload state
  const [resultItems, setResultItems] = useState<LabResultRequest[]>([
    { resultValue: '', referenceRange: '', isAbnormal: false, notes: '' }
  ])
  
  const [createForm] = Form.useForm()
  
  const { user } = useAppSelector((state) => state.auth)
  const canCreate = user?.role === 'DOCTOR'
  const canUploadResults = user?.role === 'ADMIN' || user?.role === 'NURSE'

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
        apt => ['COMPLETED', 'IN_PROGRESS', 'SCHEDULED', 'CONFIRMED'].includes(apt.status)
      )
      setAppointments(relevantAppointments)
    } catch {
      setAppointments([])
    }
  }

  const loadLabExams = async (patientId: number) => {
    setLoading(true)
    try {
      const data = await api.getLabExamsByPatient(patientId)
      let filteredData = data
      if (statusFilter) {
        filteredData = data.filter(exam => exam.status === statusFilter)
      }
      const sortedExams = filteredData.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      )
      setLabExams(sortedExams)
    } catch {
      setLabExams([])
      message.error('Error al cargar exámenes de laboratorio')
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    setSelectedExam(null)
    if (patient) {
      loadLabExams(patient.id)
      loadPatientAppointments(patient.id)
    }
  }

  const handleStatusFilterChange = (status: ExamStatus | undefined) => {
    setStatusFilter(status)
    if (selectedPatient) {
      setLoading(true)
      api.getLabExamsByPatient(selectedPatient.id).then(data => {
        let filteredData = data
        if (status) {
          filteredData = data.filter(exam => exam.status === status)
        }
        const sortedExams = filteredData.sort((a, b) => 
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        )
        setLabExams(sortedExams)
      }).catch(() => {
        message.error('Error al filtrar exámenes')
      }).finally(() => {
        setLoading(false)
      })
    }
  }


  const handleCreateExam = async (values: {
    requestingDoctorId: number
    appointmentId?: number
    examType: string
    priority: ExamPriority
    clinicalIndication?: string
  }) => {
    if (!selectedPatient) return
    
    try {
      const examData: LabExamRequest = {
        patientId: selectedPatient.id,
        requestingDoctorId: values.requestingDoctorId,
        appointmentId: values.appointmentId,
        examType: values.examType,
        priority: values.priority,
        clinicalIndication: values.clinicalIndication
      }
      
      await api.createLabExam(examData)
      message.success('Examen de laboratorio solicitado exitosamente')
      loadLabExams(selectedPatient.id)
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch {
      message.error('Error al solicitar examen de laboratorio')
    }
  }

  const handleUpdateStatus = async (examId: number, newStatus: ExamStatus) => {
    try {
      await api.updateLabExamStatus(examId, newStatus)
      message.success(`Estado actualizado a ${statusLabels[newStatus]}`)
      if (selectedPatient) {
        loadLabExams(selectedPatient.id)
      }
      if (selectedExam?.id === examId) {
        setSelectedExam(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch {
      message.error('Error al actualizar estado')
    }
  }

  const handleViewExam = (exam: LabExamResponse) => {
    setSelectedExam(exam)
    setViewModalOpen(true)
  }

  const openUploadResultsModal = (exam: LabExamResponse) => {
    setSelectedExam(exam)
    setResultItems([{ resultValue: '', referenceRange: '', isAbnormal: false, notes: '' }])
    setUploadResultsModalOpen(true)
  }

  const addResultItem = () => {
    setResultItems([
      ...resultItems,
      { resultValue: '', referenceRange: '', isAbnormal: false, notes: '' }
    ])
  }

  const removeResultItem = (index: number) => {
    if (resultItems.length > 1) {
      const newItems = resultItems.filter((_, i) => i !== index)
      setResultItems(newItems)
    }
  }

  const updateResultItem = (index: number, field: keyof LabResultRequest, value: string | boolean) => {
    const newItems = [...resultItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setResultItems(newItems)
  }

  const validateResultItems = (): boolean => {
    for (const item of resultItems) {
      if (!item.resultValue.trim() || !item.referenceRange.trim()) {
        return false
      }
    }
    return true
  }

  const handleUploadResults = async () => {
    if (!selectedExam) return
    
    if (!validateResultItems()) {
      message.error('Complete todos los campos requeridos de los resultados')
      return
    }
    
    try {
      const uploadData: LabResultsUploadRequest = {
        results: resultItems.map(item => ({
          ...item,
          notes: item.notes || ''
        }))
      }
      
      await api.uploadLabResults(selectedExam.id, uploadData)
      message.success('Resultados cargados exitosamente')
      if (selectedPatient) {
        loadLabExams(selectedPatient.id)
      }
      setUploadResultsModalOpen(false)
      setResultItems([{ resultValue: '', referenceRange: '', isAbnormal: false, notes: '' }])
    } catch {
      message.error('Error al cargar resultados')
    }
  }

  const openCreateModal = () => {
    createForm.resetFields()
    setCreateModalOpen(true)
  }

  const hasAbnormalResults = (exam: LabExamResponse): boolean => {
    return exam.results.some(r => r.isAbnormal)
  }

  const labExamsColumns = [
    {
      title: 'Fecha Solicitud',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Tipo de Examen',
      dataIndex: 'examType',
      key: 'examType',
      width: 200
    },
    {
      title: 'Doctor Solicitante',
      dataIndex: 'requestingDoctorName',
      key: 'requestingDoctorName',
      width: 180
    },
    {
      title: 'Prioridad',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: ExamPriority) => (
        <Tag color={priorityColors[priority]}>{priorityLabels[priority]}</Tag>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: ExamStatus) => (
        <Tag color={statusColors[status]} icon={statusIcons[status]}>
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: 'Resultados',
      key: 'results',
      width: 120,
      render: (_: unknown, record: LabExamResponse) => {
        if (record.status === 'COMPLETED' && record.results.length > 0) {
          const abnormalCount = record.results.filter(r => r.isAbnormal).length
          return abnormalCount > 0 ? (
            <Tag color="red" icon={<WarningOutlined />}>
              {abnormalCount} anormal{abnormalCount > 1 ? 'es' : ''}
            </Tag>
          ) : (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Normal
            </Tag>
          )
        }
        return <Text type="secondary">-</Text>
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: LabExamResponse) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewExam(record)}
            />
          </Tooltip>
          {canUploadResults && record.status === 'REQUESTED' && (
            <Tooltip title="Iniciar proceso">
              <Button
                icon={<SyncOutlined />}
                size="small"
                onClick={() => handleUpdateStatus(record.id, 'IN_PROGRESS')}
              />
            </Tooltip>
          )}
          {canUploadResults && (record.status === 'REQUESTED' || record.status === 'IN_PROGRESS') && (
            <Tooltip title="Cargar resultados">
              <Button
                icon={<UploadOutlined />}
                size="small"
                type="primary"
                onClick={() => openUploadResultsModal(record)}
              />
            </Tooltip>
          )}
          {record.status === 'REQUESTED' && (
            <Tooltip title="Cancelar">
              <Button
                icon={<CloseCircleOutlined />}
                size="small"
                danger
                onClick={() => handleUpdateStatus(record.id, 'CANCELLED')}
              />
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
          <ExperimentOutlined style={{ marginRight: 8 }} />
          Laboratorio
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
              { value: 'REQUESTED', label: 'Solicitados' },
              { value: 'IN_PROGRESS', label: 'En Proceso' },
              { value: 'COMPLETED', label: 'Completados' },
              { value: 'CANCELLED', label: 'Cancelados' }
            ]}
          />
          {selectedPatient && canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Solicitar Examen
            </Button>
          )}
        </Space>
      </HeaderSection>

      {!selectedPatient ? (
        <Card>
          <Empty description="Seleccione un paciente para ver sus exámenes de laboratorio" />
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
              <Space>
                <Tag color="blue" style={{ fontSize: 14 }}>
                  {labExams.length} examen{labExams.length !== 1 ? 'es' : ''}
                </Tag>
                {labExams.some(hasAbnormalResults) && (
                  <Tag color="red" icon={<WarningOutlined />} style={{ fontSize: 14 }}>
                    Valores anormales
                  </Tag>
                )}
              </Space>
            </div>
          </PatientInfoCard>

          <Card title="Exámenes de Laboratorio">
            <Table
              columns={labExamsColumns}
              dataSource={labExams}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="No hay exámenes de laboratorio registrados" /> }}
            />
          </Card>
        </>
      )}

      {/* Create Lab Exam Modal */}
      <Modal
        title="Solicitar Examen de Laboratorio"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          createForm.resetFields()
        }}
        onOk={() => createForm.submit()}
        width={600}
        okText="Solicitar Examen"
        cancelText="Cancelar"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateExam}
        >
          <Form.Item
            name="requestingDoctorId"
            label="Doctor Solicitante"
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
            name="examType"
            label="Tipo de Examen"
            rules={[{ required: true, message: 'Ingrese el tipo de examen' }]}
          >
            <Input placeholder="Ej: Hemograma completo, Glucosa, Perfil lipídico..." />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Prioridad"
            rules={[{ required: true, message: 'Seleccione la prioridad' }]}
            initialValue="ROUTINE"
          >
            <Select
              options={[
                { value: 'ROUTINE', label: 'Rutina' },
                { value: 'URGENT', label: 'Urgente' },
                { value: 'STAT', label: 'Inmediato (STAT)' }
              ]}
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

          <Form.Item
            name="clinicalIndication"
            label="Indicación Clínica"
          >
            <TextArea
              rows={3}
              placeholder="Motivo del examen, síntomas relevantes..."
            />
          </Form.Item>
        </Form>
      </Modal>


      {/* View Lab Exam Modal */}
      <Modal
        title="Detalle del Examen de Laboratorio"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Cerrar
          </Button>,
          canUploadResults && selectedExam && (selectedExam.status === 'REQUESTED' || selectedExam.status === 'IN_PROGRESS') && (
            <Button
              key="upload"
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => {
                setViewModalOpen(false)
                openUploadResultsModal(selectedExam)
              }}
            >
              Cargar Resultados
            </Button>
          )
        ].filter(Boolean)}
        width={800}
      >
        {selectedExam && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Paciente">
                {selectedExam.patientName}
              </Descriptions.Item>
              <Descriptions.Item label="Doctor Solicitante">
                {selectedExam.requestingDoctorName}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo de Examen">
                {selectedExam.examType}
              </Descriptions.Item>
              <Descriptions.Item label="Prioridad">
                <Tag color={priorityColors[selectedExam.priority]}>
                  {priorityLabels[selectedExam.priority]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha Solicitud">
                {dayjs(selectedExam.requestedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={statusColors[selectedExam.status]} icon={statusIcons[selectedExam.status]}>
                  {statusLabels[selectedExam.status]}
                </Tag>
              </Descriptions.Item>
              {selectedExam.completedAt && (
                <Descriptions.Item label="Fecha Completado" span={2}>
                  {dayjs(selectedExam.completedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              )}
              {selectedExam.clinicalIndication && (
                <Descriptions.Item label="Indicación Clínica" span={2}>
                  {selectedExam.clinicalIndication}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedExam.results.length > 0 && (
              <>
                <Divider>Resultados ({selectedExam.results.length})</Divider>
                
                {selectedExam.results.some(r => r.isAbnormal) && (
                  <Alert
                    message="Valores Anormales Detectados"
                    description="Algunos resultados están fuera del rango de referencia. Revise los valores marcados en rojo."
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}

                {selectedExam.results.map((result, index) => (
                  <ResultCard key={result.id} size="small" $isAbnormal={result.isAbnormal}>
                    <ResultHeader>
                      <Text strong>Resultado {index + 1}</Text>
                      {result.isAbnormal ? (
                        <AbnormalBadge color="red" icon={<WarningOutlined />}>
                          ANORMAL
                        </AbnormalBadge>
                      ) : (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Normal
                        </Tag>
                      )}
                    </ResultHeader>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                          <Text type="secondary">Valor: </Text>
                          <Text strong style={{ color: result.isAbnormal ? '#ff4d4f' : 'inherit', fontSize: 16 }}>
                            {result.resultValue}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary">Rango de Referencia: </Text>
                          <Text>{result.referenceRange}</Text>
                        </div>
                      </div>
                      {result.notes && (
                        <div>
                          <Text type="secondary">Notas: </Text>
                          <Text italic>{result.notes}</Text>
                        </div>
                      )}
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Cargado por: {result.uploadedByName} - {dayjs(result.uploadedAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </div>
                    </Space>
                  </ResultCard>
                ))}
              </>
            )}

            {selectedExam.status === 'COMPLETED' && selectedExam.results.length === 0 && (
              <Empty description="No hay resultados registrados para este examen" />
            )}
          </>
        )}
      </Modal>


      {/* Upload Results Modal */}
      <Modal
        title={`Cargar Resultados - ${selectedExam?.examType || ''}`}
        open={uploadResultsModalOpen}
        onCancel={() => {
          setUploadResultsModalOpen(false)
          setResultItems([{ resultValue: '', referenceRange: '', isAbnormal: false, notes: '' }])
        }}
        onOk={handleUploadResults}
        width={700}
        okText="Cargar Resultados"
        cancelText="Cancelar"
      >
        <Alert
          message="Ingrese los resultados del examen"
          description="Marque como 'Anormal' los valores que estén fuera del rango de referencia."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {resultItems.map((item, index) => (
          <ResultCard key={index}>
            <ResultHeader>
              <Text strong>Resultado {index + 1}</Text>
              {resultItems.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeResultItem(index)}
                >
                  Eliminar
                </Button>
              )}
            </ResultHeader>
            
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Space style={{ width: '100%' }}>
                <Input
                  placeholder="Valor del resultado *"
                  value={item.resultValue}
                  onChange={(e) => updateResultItem(index, 'resultValue', e.target.value)}
                  style={{ flex: 1 }}
                />
                <Input
                  placeholder="Rango de referencia *"
                  value={item.referenceRange}
                  onChange={(e) => updateResultItem(index, 'referenceRange', e.target.value)}
                  style={{ flex: 1 }}
                />
              </Space>
              <Space>
                <Text>¿Valor anormal?</Text>
                <Switch
                  checked={item.isAbnormal}
                  onChange={(checked) => updateResultItem(index, 'isAbnormal', checked)}
                  checkedChildren={<WarningOutlined />}
                  unCheckedChildren={<CheckCircleOutlined />}
                />
                {item.isAbnormal && (
                  <Tag color="red" icon={<WarningOutlined />}>
                    Marcado como anormal
                  </Tag>
                )}
              </Space>
              <Input
                placeholder="Notas adicionales (opcional)"
                value={item.notes}
                onChange={(e) => updateResultItem(index, 'notes', e.target.value)}
              />
            </Space>
          </ResultCard>
        ))}

        <Button
          type="dashed"
          onClick={addResultItem}
          block
          icon={<PlusOutlined />}
        >
          Agregar Resultado
        </Button>
      </Modal>
    </PageContainer>
  )
}
