import { useEffect, useState, useCallback } from 'react'
import {
  Typography,
  Card,
  Button,
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
  DatePicker,
  Popconfirm
} from 'antd'
import {
  FolderOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  UserOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  HistoryOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import api, {
  PatientResponse,
  ClinicalFileResponse,
  FileAccessLogResponse,
  FileType,
  ClinicalFileSearchParams
} from '../services/api'
import { useAppSelector } from '../store'
import FileUploader from '../components/FileUploader'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

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

const FilterCard = styled(Card)`
  margin-bottom: 16px;
`

const fileTypeLabels: Record<FileType, string> = {
  RADIOGRAFIA: 'Radiografía',
  CONSENTIMIENTO: 'Consentimiento',
  LABORATORIO: 'Laboratorio',
  OTRO: 'Otro'
}

const fileTypeColors: Record<FileType, string> = {
  RADIOGRAFIA: 'purple',
  CONSENTIMIENTO: 'blue',
  LABORATORIO: 'green',
  OTRO: 'default'
}

const accessActionLabels: Record<string, string> = {
  VIEW: 'Visualización',
  DOWNLOAD: 'Descarga'
}

export default function ArchivosClinicos() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null)
  const [clinicalFiles, setClinicalFiles] = useState<ClinicalFileResponse[]>([])
  const [selectedFile, setSelectedFile] = useState<ClinicalFileResponse | null>(null)
  const [accessLogs, setAccessLogs] = useState<FileAccessLogResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [logsModalOpen, setLogsModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<FileType | undefined>(undefined)
  const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [uploadFileType, setUploadFileType] = useState<FileType>('OTRO')

  const { user } = useAppSelector((state) => state.auth)
  const canUpload = user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE'
  const canDelete = user?.role === 'ADMIN'

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const data = await api.getPatients()
      setPatients(data)
    } catch {
      message.error('Error al cargar pacientes')
    }
  }

  const loadClinicalFiles = useCallback(async (patientId: number, filters?: ClinicalFileSearchParams) => {
    setLoading(true)
    try {
      let data: ClinicalFileResponse[]
      if (filters && (filters.fileType || filters.startDate || filters.endDate)) {
        data = await api.searchClinicalFiles({ patientId, ...filters })
      } else if (filterType) {
        data = await api.getClinicalFilesByPatientAndType(patientId, filterType)
      } else {
        data = await api.getClinicalFilesByPatient(patientId)
      }
      const sortedFiles = data.sort((a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
      setClinicalFiles(sortedFiles)
    } catch {
      setClinicalFiles([])
      message.error('Error al cargar archivos clínicos')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  const handlePatientSelect = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    setSelectedFile(null)
    setFilterType(undefined)
    setFilterDateRange(null)
    if (patient) loadClinicalFiles(patient.id)
  }

  const handleFilterApply = () => {
    if (!selectedPatient) return
    const filters: ClinicalFileSearchParams = {
      patientId: selectedPatient.id,
      fileType: filterType,
      startDate: filterDateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: filterDateRange?.[1]?.format('YYYY-MM-DD')
    }
    loadClinicalFiles(selectedPatient.id, filters)
  }

  const handleFilterClear = () => {
    setFilterType(undefined)
    setFilterDateRange(null)
    if (selectedPatient) loadClinicalFiles(selectedPatient.id)
  }

  const handleUploadSuccess = () => {
    if (selectedPatient) loadClinicalFiles(selectedPatient.id)
    setUploadModalOpen(false)
  }

  const handleViewFile = (file: ClinicalFileResponse) => {
    setSelectedFile(file)
    setViewModalOpen(true)
  }

  const handleDownloadFile = async (file: ClinicalFileResponse) => {
    try {
      const blob = await api.downloadClinicalFile(file.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success(`Archivo "${file.fileName}" descargado`)
    } catch {
      message.error('Error al descargar archivo')
    }
  }

  const handleDeleteFile = async (file: ClinicalFileResponse) => {
    try {
      await api.deleteClinicalFile(file.id)
      message.success(`Archivo "${file.fileName}" eliminado`)
      if (selectedPatient) loadClinicalFiles(selectedPatient.id)
    } catch {
      message.error('Error al eliminar archivo')
    }
  }

  const handleViewAccessLogs = async (file: ClinicalFileResponse) => {
    setSelectedFile(file)
    setLogsLoading(true)
    setLogsModalOpen(true)
    try {
      const logs = await api.getClinicalFileAccessLogs(file.id)
      setAccessLogs(logs)
    } catch {
      message.error('Error al cargar historial de accesos')
      setAccessLogs([])
    } finally {
      setLogsLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
    if (mimeType.includes('image')) return <FileImageOutlined style={{ color: '#1890ff', fontSize: 18 }} />
    return <FileOutlined style={{ fontSize: 18 }} />
  }


  const filesColumns = [
    {
      title: 'Archivo',
      key: 'file',
      width: 300,
      render: (_: unknown, record: ClinicalFileResponse) => (
        <Space>
          {getFileIcon(record.mimeType)}
          <div>
            <Text strong>{record.fileName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{formatFileSize(record.fileSize)}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Categoría',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 130,
      render: (type: FileType) => <Tag color={fileTypeColors[type]}>{fileTypeLabels[type]}</Tag>
    },
    {
      title: 'Fecha de Subida',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Subido por',
      dataIndex: 'uploadedByName',
      key: 'uploadedByName',
      width: 150
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ClinicalFileResponse) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewFile(record)} />
          </Tooltip>
          <Tooltip title="Descargar">
            <Button icon={<DownloadOutlined />} size="small" type="primary" onClick={() => handleDownloadFile(record)} />
          </Tooltip>
          <Tooltip title="Historial de accesos">
            <Button icon={<HistoryOutlined />} size="small" onClick={() => handleViewAccessLogs(record)} />
          </Tooltip>
          {canDelete && (
            <Popconfirm
              title="¿Eliminar archivo?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleDeleteFile(record)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Eliminar">
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  const accessLogsColumns = [
    {
      title: 'Fecha/Hora',
      dataIndex: 'accessedAt',
      key: 'accessedAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Usuario',
      dataIndex: 'userName',
      key: 'userName',
      width: 150
    },
    {
      title: 'Acción',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string) => (
        <Tag color={action === 'DOWNLOAD' ? 'blue' : 'green'}>{accessActionLabels[action] || action}</Tag>
      )
    },
    {
      title: 'Dirección IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130
    }
  ]


  return (
    <PageContainer>
      <HeaderSection>
        <Title level={3}>
          <FolderOutlined style={{ marginRight: 8 }} />
          Archivos Clínicos
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
            options={patients.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` }))}
          />
          {selectedPatient && canUpload && (
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
              Subir Archivo
            </Button>
          )}
        </Space>
      </HeaderSection>

      {!selectedPatient ? (
        <Card>
          <Empty description="Seleccione un paciente para ver sus archivos clínicos" />
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
                  <Text type="secondary">Fecha Nac: {dayjs(selectedPatient.dateOfBirth).format('DD/MM/YYYY')}</Text>
                  <Text type="secondary">Género: {selectedPatient.gender}</Text>
                  <Text type="secondary">Tel: {selectedPatient.contactNumber}</Text>
                </Space>
              </div>
              <Tag color="blue" style={{ fontSize: 14 }}>
                {clinicalFiles.length} archivo{clinicalFiles.length !== 1 ? 's' : ''}
              </Tag>
            </div>
          </PatientInfoCard>

          <FilterCard size="small">
            <Space wrap>
              <FilterOutlined />
              <Text strong>Filtros:</Text>
              <Select
                placeholder="Categoría"
                style={{ width: 150 }}
                allowClear
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: 'RADIOGRAFIA', label: 'Radiografía' },
                  { value: 'CONSENTIMIENTO', label: 'Consentimiento' },
                  { value: 'LABORATORIO', label: 'Laboratorio' },
                  { value: 'OTRO', label: 'Otro' }
                ]}
              />
              <RangePicker
                value={filterDateRange}
                onChange={(dates) => setFilterDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="DD/MM/YYYY"
              />
              <Button type="primary" onClick={handleFilterApply}>Aplicar</Button>
              <Button icon={<ClearOutlined />} onClick={handleFilterClear}>Limpiar</Button>
            </Space>
          </FilterCard>

          <Card title="Archivos del Paciente">
            <Table
              columns={filesColumns}
              dataSource={clinicalFiles}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="No hay archivos clínicos registrados" /> }}
            />
          </Card>
        </>
      )}


      {/* Upload Modal */}
      <Modal
        title="Subir Archivo Clínico"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Categoría del archivo:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={uploadFileType}
              onChange={setUploadFileType}
              options={[
                { value: 'RADIOGRAFIA', label: 'Radiografía' },
                { value: 'CONSENTIMIENTO', label: 'Consentimiento' },
                { value: 'LABORATORIO', label: 'Laboratorio' },
                { value: 'OTRO', label: 'Otro' }
              ]}
            />
          </div>
          {selectedPatient && (
            <FileUploader
              patientId={selectedPatient.id}
              fileType={uploadFileType}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </Space>
      </Modal>

      {/* View File Details Modal */}
      <Modal
        title="Detalles del Archivo"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>Cerrar</Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedFile && handleDownloadFile(selectedFile)}
          >
            Descargar
          </Button>
        ]}
        width={600}
      >
        {selectedFile && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Nombre del archivo">{selectedFile.fileName}</Descriptions.Item>
            <Descriptions.Item label="Categoría">
              <Tag color={fileTypeColors[selectedFile.fileType]}>{fileTypeLabels[selectedFile.fileType]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tipo MIME">{selectedFile.mimeType}</Descriptions.Item>
            <Descriptions.Item label="Tamaño">{formatFileSize(selectedFile.fileSize)}</Descriptions.Item>
            <Descriptions.Item label="Subido por">{selectedFile.uploadedByName}</Descriptions.Item>
            <Descriptions.Item label="Fecha de subida">
              {dayjs(selectedFile.uploadedAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Access Logs Modal */}
      <Modal
        title={`Historial de Accesos - ${selectedFile?.fileName || ''}`}
        open={logsModalOpen}
        onCancel={() => setLogsModalOpen(false)}
        footer={<Button onClick={() => setLogsModalOpen(false)}>Cerrar</Button>}
        width={700}
      >
        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={accessLogsColumns}
            dataSource={accessLogs}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="No hay registros de acceso" /> }}
          />
        )}
      </Modal>
    </PageContainer>
  )
}
