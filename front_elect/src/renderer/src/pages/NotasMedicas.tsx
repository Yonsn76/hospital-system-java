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
  Timeline,
  Tooltip,
  DatePicker
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import api, {
  PatientResponse,
  MedicalNoteResponse,
  MedicalNoteRequest,
  MedicalNoteUpdateRequest,
  MedicalNoteVersionResponse,
  DoctorResponse,
  AppointmentResponse
} from '../services/api'
import { useAppSelector } from '../store'

const { Title, Text, Paragraph } = Typography
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

const VersionTimeline = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
`

export default function NotasMedicas() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null)
  const [medicalNotes, setMedicalNotes] = useState<MedicalNoteResponse[]>([])
  const [selectedNote, setSelectedNote] = useState<MedicalNoteResponse | null>(null)
  const [noteVersions, setNoteVersions] = useState<MedicalNoteVersionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [versionsLoading, setVersionsLoading] = useState(false)
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [versionsModalOpen, setVersionsModalOpen] = useState(false)
  
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  
  const { user } = useAppSelector((state) => state.auth)
  const canCreate = user?.role === 'DOCTOR'
  const canEdit = user?.role === 'DOCTOR'

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
      // Filter to show only completed or in-progress appointments
      const relevantAppointments = data.filter(
        apt => ['COMPLETED', 'IN_PROGRESS'].includes(apt.status)
      )
      setAppointments(relevantAppointments)
    } catch {
      setAppointments([])
    }
  }

  const loadMedicalNotes = async (patientId: number) => {
    setLoading(true)
    try {
      const data = await api.getMedicalNotesByPatient(patientId)
      // Sort by createdAt descending (chronological order - most recent first)
      const sortedNotes = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setMedicalNotes(sortedNotes)
    } catch {
      setMedicalNotes([])
      message.error('Error al cargar notas médicas')
    } finally {
      setLoading(false)
    }
  }

  const loadNoteVersions = async (noteId: number) => {
    setVersionsLoading(true)
    try {
      const data = await api.getMedicalNoteVersions(noteId)
      setNoteVersions(data)
    } catch {
      setNoteVersions([])
      message.error('Error al cargar historial de versiones')
    } finally {
      setVersionsLoading(false)
    }
  }

  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    setSelectedNote(null)
    if (patient) {
      loadMedicalNotes(patient.id)
      loadPatientAppointments(patient.id)
    }
  }

  const handleCreateNote = async (values: {
    doctorId: number
    appointmentId?: number
    diagnosis: string
    treatmentPlan: string
    followUpDate?: dayjs.Dayjs
    followUpInstructions?: string
  }) => {
    if (!selectedPatient) return
    
    try {
      const noteData: MedicalNoteRequest = {
        patientId: selectedPatient.id,
        doctorId: values.doctorId,
        appointmentId: values.appointmentId,
        diagnosis: values.diagnosis,
        treatmentPlan: values.treatmentPlan,
        followUpDate: values.followUpDate?.format('YYYY-MM-DD'),
        followUpInstructions: values.followUpInstructions
      }
      
      await api.createMedicalNote(noteData)
      message.success('Nota médica creada exitosamente')
      loadMedicalNotes(selectedPatient.id)
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch {
      message.error('Error al crear nota médica')
    }
  }

  const handleUpdateNote = async (values: {
    diagnosis: string
    treatmentPlan: string
    followUpDate?: dayjs.Dayjs
    followUpInstructions?: string
  }) => {
    if (!selectedNote) return
    
    try {
      const updateData: MedicalNoteUpdateRequest = {
        diagnosis: values.diagnosis,
        treatmentPlan: values.treatmentPlan,
        followUpDate: values.followUpDate?.format('YYYY-MM-DD'),
        followUpInstructions: values.followUpInstructions
      }
      
      await api.updateMedicalNote(selectedNote.id, updateData)
      message.success('Nota médica actualizada (nueva versión creada)')
      if (selectedPatient) {
        loadMedicalNotes(selectedPatient.id)
      }
      setEditModalOpen(false)
      editForm.resetFields()
    } catch {
      message.error('Error al actualizar nota médica')
    }
  }

  const handleViewNote = (note: MedicalNoteResponse) => {
    setSelectedNote(note)
    setViewModalOpen(true)
  }

  const handleEditNote = (note: MedicalNoteResponse) => {
    setSelectedNote(note)
    editForm.setFieldsValue({
      diagnosis: note.diagnosis,
      treatmentPlan: note.treatmentPlan,
      followUpDate: note.followUpDate ? dayjs(note.followUpDate) : undefined,
      followUpInstructions: note.followUpInstructions
    })
    setEditModalOpen(true)
  }

  const handleViewVersions = (note: MedicalNoteResponse) => {
    setSelectedNote(note)
    loadNoteVersions(note.id)
    setVersionsModalOpen(true)
  }

  const openCreateModal = () => {
    createForm.resetFields()
    setCreateModalOpen(true)
  }

  // Table columns for notes list
  const notesColumns = [
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
      title: 'Diagnóstico',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Seguimiento',
      dataIndex: 'followUpDate',
      key: 'followUpDate',
      width: 120,
      render: (date: string | null) => date ? (
        <Tag icon={<CalendarOutlined />} color="blue">
          {dayjs(date).format('DD/MM/YYYY')}
        </Tag>
      ) : (
        <Text type="secondary">-</Text>
      )
    },
    {
      title: 'Versión',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version: number) => (
        <Tag color="default">v{version}</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: MedicalNoteResponse) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewNote(record)}
            />
          </Tooltip>
          {canEdit && (
            <Tooltip title="Editar">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEditNote(record)}
              />
            </Tooltip>
          )}
          {record.version > 1 && (
            <Tooltip title="Ver historial">
              <Button
                icon={<HistoryOutlined />}
                size="small"
                onClick={() => handleViewVersions(record)}
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
          <FileTextOutlined style={{ marginRight: 8 }} />
          Notas Médicas
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
          {selectedPatient && canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Nueva Nota
            </Button>
          )}
        </Space>
      </HeaderSection>

      {!selectedPatient ? (
        <Card>
          <Empty description="Seleccione un paciente para ver sus notas médicas" />
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
                {medicalNotes.length} nota{medicalNotes.length !== 1 ? 's' : ''} médica{medicalNotes.length !== 1 ? 's' : ''}
              </Tag>
            </div>
          </PatientInfoCard>

          <Card title="Historial de Notas Médicas">
            <Table
              columns={notesColumns}
              dataSource={medicalNotes}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="No hay notas médicas registradas" /> }}
            />
          </Card>
        </>
      )}

      {/* Create Medical Note Modal */}
      <Modal
        title="Nueva Nota Médica"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          createForm.resetFields()
        }}
        onOk={() => createForm.submit()}
        width={700}
        okText="Crear Nota"
        cancelText="Cancelar"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateNote}
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

          <Form.Item
            name="diagnosis"
            label="Diagnóstico"
            rules={[{ required: true, message: 'El diagnóstico es requerido' }]}
          >
            <TextArea
              rows={4}
              placeholder="Ingrese el diagnóstico del paciente..."
            />
          </Form.Item>

          <Form.Item
            name="treatmentPlan"
            label="Plan de Tratamiento"
            rules={[{ required: true, message: 'El plan de tratamiento es requerido' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describa el plan de tratamiento..."
            />
          </Form.Item>

          <Form.Item
            name="followUpDate"
            label="Fecha de Seguimiento"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Seleccione fecha de seguimiento"
            />
          </Form.Item>

          <Form.Item
            name="followUpInstructions"
            label="Instrucciones de Seguimiento"
          >
            <TextArea
              rows={3}
              placeholder="Instrucciones para el seguimiento..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Medical Note Modal */}
      <Modal
        title="Editar Nota Médica"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false)
          editForm.resetFields()
        }}
        onOk={() => editForm.submit()}
        width={700}
        okText="Guardar Cambios"
        cancelText="Cancelar"
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Al guardar los cambios se creará una nueva versión de la nota médica.
          El historial de versiones anteriores se mantendrá.
        </Text>
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateNote}
        >
          <Form.Item
            name="diagnosis"
            label="Diagnóstico"
            rules={[{ required: true, message: 'El diagnóstico es requerido' }]}
          >
            <TextArea
              rows={4}
              placeholder="Ingrese el diagnóstico del paciente..."
            />
          </Form.Item>

          <Form.Item
            name="treatmentPlan"
            label="Plan de Tratamiento"
            rules={[{ required: true, message: 'El plan de tratamiento es requerido' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describa el plan de tratamiento..."
            />
          </Form.Item>

          <Form.Item
            name="followUpDate"
            label="Fecha de Seguimiento"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Seleccione fecha de seguimiento"
            />
          </Form.Item>

          <Form.Item
            name="followUpInstructions"
            label="Instrucciones de Seguimiento"
          >
            <TextArea
              rows={3}
              placeholder="Instrucciones para el seguimiento..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Medical Note Modal */}
      <Modal
        title="Detalle de Nota Médica"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Cerrar
          </Button>,
          selectedNote && selectedNote.version > 1 && (
            <Button
              key="versions"
              icon={<HistoryOutlined />}
              onClick={() => {
                setViewModalOpen(false)
                handleViewVersions(selectedNote)
              }}
            >
              Ver Historial
            </Button>
          ),
          canEdit && selectedNote && (
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setViewModalOpen(false)
                handleEditNote(selectedNote)
              }}
            >
              Editar
            </Button>
          )
        ].filter(Boolean)}
        width={700}
      >
        {selectedNote && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Paciente">
              {selectedNote.patientName}
            </Descriptions.Item>
            <Descriptions.Item label="Doctor">
              {selectedNote.doctorName}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Creación">
              {dayjs(selectedNote.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Última Actualización">
              {dayjs(selectedNote.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Versión">
              <Tag color="blue">v{selectedNote.version}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Diagnóstico">
              <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                {selectedNote.diagnosis}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Plan de Tratamiento">
              <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                {selectedNote.treatmentPlan}
              </Paragraph>
            </Descriptions.Item>
            {selectedNote.followUpDate && (
              <Descriptions.Item label="Fecha de Seguimiento">
                <Tag icon={<CalendarOutlined />} color="blue">
                  {dayjs(selectedNote.followUpDate).format('DD/MM/YYYY')}
                </Tag>
              </Descriptions.Item>
            )}
            {selectedNote.followUpInstructions && (
              <Descriptions.Item label="Instrucciones de Seguimiento">
                <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedNote.followUpInstructions}
                </Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Version History Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Historial de Versiones
          </Space>
        }
        open={versionsModalOpen}
        onCancel={() => setVersionsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setVersionsModalOpen(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {versionsLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : noteVersions.length === 0 ? (
          <Empty description="No hay versiones anteriores" />
        ) : (
          <VersionTimeline>
            <Timeline
              mode="left"
              items={noteVersions.map((version, index) => ({
                color: index === 0 ? 'blue' : 'gray',
                label: dayjs(version.modifiedAt).format('DD/MM/YYYY HH:mm'),
                children: (
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">
                        Modificado por: {version.modifiedByName}
                      </Text>
                      <div>
                        <Text strong>Diagnóstico:</Text>
                        <Paragraph
                          style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}
                          ellipsis={{ rows: 3, expandable: true }}
                        >
                          {version.diagnosis}
                        </Paragraph>
                      </div>
                      <div>
                        <Text strong>Plan de Tratamiento:</Text>
                        <Paragraph
                          style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
                          ellipsis={{ rows: 3, expandable: true }}
                        >
                          {version.treatmentPlan}
                        </Paragraph>
                      </div>
                    </Space>
                  </Card>
                )
              }))}
            />
          </VersionTimeline>
        )}
      </Modal>
    </PageContainer>
  )
}
