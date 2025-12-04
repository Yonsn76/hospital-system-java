import { useEffect, useState } from 'react'
import {
  Typography,
  Tabs,
  Card,
  Button,
  Input,
  Form,
  Select,
  Table,
  Space,
  Modal,
  message,
  Popconfirm,
  Empty,
  Spin,
  Tag,
  Alert
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  FileTextOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import api, {
  PatientResponse,
  ClinicalHistoryResponse,
  AllergyResponse,
  AllergyRequest,
  AllergySeverity,
  ChronicDiseaseResponse,
  ChronicDiseaseRequest,
  DiseaseStatus,
  ClinicalEvolutionRequest,
  DoctorResponse
} from '../services/api'
import { useAppSelector } from '../store'
import AllergyBadge from '../components/AllergyBadge'

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

const AllergyWarning = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`


const severityOptions = [
  { value: 'MILD', label: 'Leve' },
  { value: 'MODERATE', label: 'Moderada' },
  { value: 'SEVERE', label: 'Severa' }
]

const diseaseStatusOptions = [
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'CONTROLLED', label: 'Controlada' },
  { value: 'RESOLVED', label: 'Resuelta' }
]

const diseaseStatusColors: Record<DiseaseStatus, string> = {
  ACTIVE: 'red',
  CONTROLLED: 'orange',
  RESOLVED: 'green'
}

export default function HistoriaClinica() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null)
  const [clinicalHistory, setClinicalHistory] = useState<ClinicalHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [activeTab, setActiveTab] = useState('antecedentes')
  
  // Modal states
  const [allergyModalOpen, setAllergyModalOpen] = useState(false)
  const [diseaseModalOpen, setDiseaseModalOpen] = useState(false)
  const [evolutionModalOpen, setEvolutionModalOpen] = useState(false)
  const [antecedentesModalOpen, setAntecedentesModalOpen] = useState(false)
  
  // Edit states
  const [editingAllergy, setEditingAllergy] = useState<AllergyResponse | null>(null)
  const [editingDisease, setEditingDisease] = useState<ChronicDiseaseResponse | null>(null)
  
  const [allergyForm] = Form.useForm()
  const [diseaseForm] = Form.useForm()
  const [evolutionForm] = Form.useForm()
  const [antecedentesForm] = Form.useForm()
  
  const { user } = useAppSelector((state) => state.auth)
  const canEdit = ['ADMIN', 'DOCTOR'].includes(user?.role || '')
  const canAddEvolution = user?.role === 'DOCTOR'

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

  const loadClinicalHistory = async (patientId: number) => {
    setLoading(true)
    try {
      const data = await api.getClinicalHistory(patientId)
      setClinicalHistory(data)
    } catch {
      setClinicalHistory(null)
      message.error('Error al cargar historia clínica')
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    if (patient) {
      loadClinicalHistory(patient.id)
    }
  }

  const handleSearchPatients = async (value: string) => {
    if (value.trim()) {
      try {
        const data = await api.searchPatientsByCondition(value)
        setPatients(data)
      } catch {
        message.error('Error en la búsqueda')
      }
    } else {
      loadPatients()
    }
  }


  // Antecedentes handlers
  const handleUpdateAntecedentes = async (values: { antecedentes: string; observaciones: string }) => {
    if (!selectedPatient) return
    try {
      await api.updateClinicalHistory(selectedPatient.id, values)
      message.success('Antecedentes actualizados')
      loadClinicalHistory(selectedPatient.id)
      setAntecedentesModalOpen(false)
    } catch {
      message.error('Error al actualizar antecedentes')
    }
  }

  // Allergy handlers
  const handleAddAllergy = async (values: AllergyRequest) => {
    if (!selectedPatient) return
    try {
      if (editingAllergy) {
        await api.updateAllergy(selectedPatient.id, editingAllergy.id, values)
        message.success('Alergia actualizada')
      } else {
        await api.addAllergy(selectedPatient.id, values)
        message.success('Alergia agregada')
      }
      loadClinicalHistory(selectedPatient.id)
      setAllergyModalOpen(false)
      setEditingAllergy(null)
      allergyForm.resetFields()
    } catch {
      message.error('Error al guardar alergia')
    }
  }

  const handleDeleteAllergy = async (allergyId: number) => {
    if (!selectedPatient) return
    try {
      await api.deleteAllergy(selectedPatient.id, allergyId)
      message.success('Alergia eliminada')
      loadClinicalHistory(selectedPatient.id)
    } catch {
      message.error('Error al eliminar alergia')
    }
  }

  // Chronic Disease handlers
  const handleAddDisease = async (values: ChronicDiseaseRequest) => {
    if (!selectedPatient) return
    try {
      if (editingDisease) {
        await api.updateChronicDisease(selectedPatient.id, editingDisease.id, values)
        message.success('Enfermedad actualizada')
      } else {
        await api.addChronicDisease(selectedPatient.id, values)
        message.success('Enfermedad agregada')
      }
      loadClinicalHistory(selectedPatient.id)
      setDiseaseModalOpen(false)
      setEditingDisease(null)
      diseaseForm.resetFields()
    } catch {
      message.error('Error al guardar enfermedad')
    }
  }

  const handleDeleteDisease = async (diseaseId: number) => {
    if (!selectedPatient) return
    try {
      await api.deleteChronicDisease(selectedPatient.id, diseaseId)
      message.success('Enfermedad eliminada')
      loadClinicalHistory(selectedPatient.id)
    } catch {
      message.error('Error al eliminar enfermedad')
    }
  }

  // Evolution handlers
  const handleAddEvolution = async (values: { doctorId: number; evolutionNotes: string }) => {
    if (!selectedPatient) return
    try {
      const evolutionData: ClinicalEvolutionRequest = {
        doctorId: values.doctorId,
        evolutionNotes: values.evolutionNotes
      }
      await api.addEvolution(selectedPatient.id, evolutionData)
      message.success('Evolución agregada')
      loadClinicalHistory(selectedPatient.id)
      setEvolutionModalOpen(false)
      evolutionForm.resetFields()
    } catch {
      message.error('Error al agregar evolución')
    }
  }


  // Table columns
  const allergyColumns = [
    { title: 'Alergia', dataIndex: 'allergyName', key: 'allergyName' },
    {
      title: 'Severidad',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: AllergySeverity, record: AllergyResponse) => (
        <AllergyBadge allergyName={record.allergyName} severity={severity} showIcon={false} />
      )
    },
    { title: 'Notas', dataIndex: 'notes', key: 'notes', ellipsis: true },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: AllergyResponse) => (
        <Space>
          {canEdit && (
            <>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingAllergy(record)
                  allergyForm.setFieldsValue(record)
                  setAllergyModalOpen(true)
                }}
              />
              <Popconfirm title="¿Eliminar alergia?" onConfirm={() => handleDeleteAllergy(record.id)}>
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ]

  const diseaseColumns = [
    { title: 'Enfermedad', dataIndex: 'diseaseName', key: 'diseaseName' },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: DiseaseStatus) => (
        <Tag color={diseaseStatusColors[status]}>
          {diseaseStatusOptions.find(o => o.value === status)?.label}
        </Tag>
      )
    },
    {
      title: 'Fecha Diagnóstico',
      dataIndex: 'diagnosisDate',
      key: 'diagnosisDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    { title: 'Notas', dataIndex: 'notes', key: 'notes', ellipsis: true },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: ChronicDiseaseResponse) => (
        <Space>
          {canEdit && (
            <>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingDisease(record)
                  diseaseForm.setFieldsValue({
                    ...record,
                    diagnosisDate: record.diagnosisDate
                  })
                  setDiseaseModalOpen(true)
                }}
              />
              <Popconfirm title="¿Eliminar enfermedad?" onConfirm={() => handleDeleteDisease(record.id)}>
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ]

  const evolutionColumns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName', width: 200 },
    { title: 'Notas de Evolución', dataIndex: 'evolutionNotes', key: 'evolutionNotes' }
  ]


  // Tab items
  const tabItems = [
    {
      key: 'antecedentes',
      label: (
        <span>
          <FileTextOutlined /> Antecedentes
        </span>
      ),
      children: (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={5}>Antecedentes y Observaciones</Title>
            {canEdit && (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  antecedentesForm.setFieldsValue({
                    antecedentes: clinicalHistory?.antecedentes || '',
                    observaciones: clinicalHistory?.observaciones || ''
                  })
                  setAntecedentesModalOpen(true)
                }}
              >
                Editar
              </Button>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Antecedentes:</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {clinicalHistory?.antecedentes || 'Sin antecedentes registrados'}
            </Paragraph>
          </div>
          <div>
            <Text strong>Observaciones:</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {clinicalHistory?.observaciones || 'Sin observaciones'}
            </Paragraph>
          </div>
        </Card>
      )
    },
    {
      key: 'alergias',
      label: (
        <span>
          <AlertOutlined /> Alergias
          {clinicalHistory?.allergies && clinicalHistory.allergies.length > 0 && (
            <Tag color="red" style={{ marginLeft: 8 }}>{clinicalHistory.allergies.length}</Tag>
          )}
        </span>
      ),
      children: (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={5}>Alergias Registradas</Title>
            {canEdit && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingAllergy(null)
                  allergyForm.resetFields()
                  setAllergyModalOpen(true)
                }}
              >
                Agregar Alergia
              </Button>
            )}
          </div>
          <Table
            columns={allergyColumns}
            dataSource={clinicalHistory?.allergies || []}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: <Empty description="No hay alergias registradas" /> }}
          />
        </Card>
      )
    },
    {
      key: 'enfermedades',
      label: (
        <span>
          <MedicineBoxOutlined /> Enfermedades Crónicas
          {clinicalHistory?.chronicDiseases && clinicalHistory.chronicDiseases.length > 0 && (
            <Tag color="orange" style={{ marginLeft: 8 }}>{clinicalHistory.chronicDiseases.length}</Tag>
          )}
        </span>
      ),
      children: (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={5}>Enfermedades Crónicas</Title>
            {canEdit && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingDisease(null)
                  diseaseForm.resetFields()
                  setDiseaseModalOpen(true)
                }}
              >
                Agregar Enfermedad
              </Button>
            )}
          </div>
          <Table
            columns={diseaseColumns}
            dataSource={clinicalHistory?.chronicDiseases || []}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: <Empty description="No hay enfermedades crónicas registradas" /> }}
          />
        </Card>
      )
    },
    {
      key: 'evolucion',
      label: (
        <span>
          <HistoryOutlined /> Evolución
        </span>
      ),
      children: (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={5}>Historial de Evolución</Title>
            {canAddEvolution && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  evolutionForm.resetFields()
                  setEvolutionModalOpen(true)
                }}
              >
                Agregar Evolución
              </Button>
            )}
          </div>
          <Table
            columns={evolutionColumns}
            dataSource={clinicalHistory?.evolutions || []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="No hay registros de evolución" /> }}
          />
        </Card>
      )
    }
  ]


  return (
    <PageContainer>
      <HeaderSection>
        <Title level={3}>Historia Clínica</Title>
        <Space wrap>
          <Input.Search
            placeholder="Buscar por condición..."
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearchPatients}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
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
      </HeaderSection>

      {!selectedPatient ? (
        <Card>
          <Empty description="Seleccione un paciente para ver su historia clínica" />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={4} style={{ marginBottom: 4 }}>
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
              {clinicalHistory?.allergies && clinicalHistory.allergies.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<AlertOutlined />}
                  message={
                    <div>
                      <Text strong>Alergias:</Text>
                      <AllergyWarning>
                        {clinicalHistory.allergies.map(allergy => (
                          <AllergyBadge
                            key={allergy.id}
                            allergyName={allergy.allergyName}
                            severity={allergy.severity}
                            notes={allergy.notes}
                          />
                        ))}
                      </AllergyWarning>
                    </div>
                  }
                />
              )}
            </div>
          </PatientInfoCard>

          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </>
      )}


      {/* Antecedentes Modal */}
      <Modal
        title="Editar Antecedentes"
        open={antecedentesModalOpen}
        onCancel={() => setAntecedentesModalOpen(false)}
        onOk={() => antecedentesForm.submit()}
        width={600}
      >
        <Form form={antecedentesForm} layout="vertical" onFinish={handleUpdateAntecedentes}>
          <Form.Item name="antecedentes" label="Antecedentes">
            <TextArea rows={6} placeholder="Ingrese los antecedentes del paciente..." />
          </Form.Item>
          <Form.Item name="observaciones" label="Observaciones">
            <TextArea rows={4} placeholder="Ingrese observaciones adicionales..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Allergy Modal */}
      <Modal
        title={editingAllergy ? 'Editar Alergia' : 'Agregar Alergia'}
        open={allergyModalOpen}
        onCancel={() => {
          setAllergyModalOpen(false)
          setEditingAllergy(null)
          allergyForm.resetFields()
        }}
        onOk={() => allergyForm.submit()}
      >
        <Form form={allergyForm} layout="vertical" onFinish={handleAddAllergy}>
          <Form.Item
            name="allergyName"
            label="Nombre de la Alergia"
            rules={[{ required: true, message: 'Ingrese el nombre de la alergia' }]}
          >
            <Input placeholder="Ej: Penicilina, Mariscos, Polen..." />
          </Form.Item>
          <Form.Item
            name="severity"
            label="Severidad"
            rules={[{ required: true, message: 'Seleccione la severidad' }]}
          >
            <Select options={severityOptions} placeholder="Seleccione severidad" />
          </Form.Item>
          <Form.Item name="notes" label="Notas">
            <TextArea rows={3} placeholder="Notas adicionales sobre la alergia..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Chronic Disease Modal */}
      <Modal
        title={editingDisease ? 'Editar Enfermedad Crónica' : 'Agregar Enfermedad Crónica'}
        open={diseaseModalOpen}
        onCancel={() => {
          setDiseaseModalOpen(false)
          setEditingDisease(null)
          diseaseForm.resetFields()
        }}
        onOk={() => diseaseForm.submit()}
      >
        <Form form={diseaseForm} layout="vertical" onFinish={handleAddDisease}>
          <Form.Item
            name="diseaseName"
            label="Nombre de la Enfermedad"
            rules={[{ required: true, message: 'Ingrese el nombre de la enfermedad' }]}
          >
            <Input placeholder="Ej: Diabetes Tipo 2, Hipertensión..." />
          </Form.Item>
          <Form.Item
            name="diagnosisDate"
            label="Fecha de Diagnóstico"
            rules={[{ required: true, message: 'Seleccione la fecha de diagnóstico' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Seleccione el estado' }]}
          >
            <Select options={diseaseStatusOptions} placeholder="Seleccione estado" />
          </Form.Item>
          <Form.Item name="notes" label="Notas">
            <TextArea rows={3} placeholder="Notas adicionales sobre la enfermedad..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Evolution Modal */}
      <Modal
        title="Agregar Evolución"
        open={evolutionModalOpen}
        onCancel={() => {
          setEvolutionModalOpen(false)
          evolutionForm.resetFields()
        }}
        onOk={() => evolutionForm.submit()}
        width={600}
      >
        <Form form={evolutionForm} layout="vertical" onFinish={handleAddEvolution}>
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
            name="evolutionNotes"
            label="Notas de Evolución"
            rules={[{ required: true, message: 'Ingrese las notas de evolución' }]}
          >
            <TextArea rows={6} placeholder="Describa la evolución del paciente..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
