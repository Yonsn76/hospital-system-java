import { useState } from 'react'
import {
  Typography,
  Card,
  Button,
  DatePicker,
  Form,
  Select,
  Table,
  Space,
  message,
  Empty,
  Spin,
  Statistic,
  Row,
  Col,
  Tabs,
  Divider,
  Progress,
  InputNumber
} from 'antd'
import {
  BarChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  LineChartOutlined,
  UserOutlined,
  ExperimentOutlined,
  HomeOutlined,
  AlertOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs, { Dayjs } from 'dayjs'
import api, {
  ProductivityReportDTO,
  AttendanceReportDTO,
  FrequentPatientsDTO,
  ClinicalStatisticsDTO,
  DoctorProductivity,
  DoctorResponse
} from '../services/api'
import { useAppSelector } from '../store'

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

const StatsCard = styled(Card)`
  margin-bottom: 16px;
`

const ExportButtonGroup = styled(Space)`
  margin-top: 16px;
`

type ReportType = 'productivity' | 'attendance' | 'frequent-patients' | 'clinical-statistics'

export default function Reportes() {
  const [activeTab, setActiveTab] = useState<ReportType>('productivity')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [doctorsLoaded, setDoctorsLoaded] = useState(false)
  
  // Report data states
  const [productivityReport, setProductivityReport] = useState<ProductivityReportDTO | null>(null)
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReportDTO | null>(null)
  const [frequentPatientsReport, setFrequentPatientsReport] = useState<FrequentPatientsDTO | null>(null)
  const [clinicalStatistics, setClinicalStatistics] = useState<ClinicalStatisticsDTO | null>(null)
  
  // Filter states
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(undefined)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>(undefined)
  const [visitThreshold, setVisitThreshold] = useState<number>(3)
  
  const { user } = useAppSelector((state) => state.auth)
  const canViewReports = user?.role === 'ADMIN' || user?.role === 'DOCTOR'

  const loadDoctors = async () => {
    if (doctorsLoaded) return
    try {
      const data = await api.getDoctors()
      setDoctors(data)
      setDoctorsLoaded(true)
    } catch {
      message.error('Error al cargar doctores')
    }
  }

  const formatDate = (date: Dayjs) => date.format('YYYY-MM-DD')

  const generateReport = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning('Seleccione un rango de fechas')
      return
    }

    setLoading(true)
    const startDate = formatDate(dateRange[0])
    const endDate = formatDate(dateRange[1])

    try {
      switch (activeTab) {
        case 'productivity':
          const prodReport = await api.getProductivityReport(startDate, endDate, selectedDoctorId)
          setProductivityReport(prodReport)
          break
        case 'attendance':
          const attReport = await api.getAttendanceReport(startDate, endDate, selectedDoctorId, selectedSpecialty)
          setAttendanceReport(attReport)
          break
        case 'frequent-patients':
          const freqReport = await api.getFrequentPatientsReport(startDate, endDate, visitThreshold)
          setFrequentPatientsReport(freqReport)
          break
        case 'clinical-statistics':
          const statsReport = await api.getClinicalStatistics(startDate, endDate)
          setClinicalStatistics(statsReport)
          break
      }
      message.success('Reporte generado exitosamente')
    } catch {
      message.error('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning('Seleccione un rango de fechas')
      return
    }

    setExporting(true)
    const startDate = formatDate(dateRange[0])
    const endDate = formatDate(dateRange[1])
    const extension = format === 'pdf' ? 'pdf' : 'xlsx'

    try {
      let blob: Blob
      let filename: string

      switch (activeTab) {
        case 'productivity':
          blob = format === 'pdf' 
            ? await api.exportProductivityReportToPdf(startDate, endDate, selectedDoctorId)
            : await api.exportProductivityReportToExcel(startDate, endDate, selectedDoctorId)
          filename = `reporte_productividad_${startDate}_${endDate}.${extension}`
          break
        case 'attendance':
          blob = format === 'pdf'
            ? await api.exportAttendanceReportToPdf(startDate, endDate, selectedDoctorId, selectedSpecialty)
            : await api.exportAttendanceReportToExcel(startDate, endDate, selectedDoctorId, selectedSpecialty)
          filename = `reporte_asistencia_${startDate}_${endDate}.${extension}`
          break
        case 'frequent-patients':
          blob = format === 'pdf'
            ? await api.exportFrequentPatientsReportToPdf(startDate, endDate, visitThreshold)
            : await api.exportFrequentPatientsReportToExcel(startDate, endDate, visitThreshold)
          filename = `reporte_pacientes_frecuentes_${startDate}_${endDate}.${extension}`
          break
        case 'clinical-statistics':
          blob = format === 'pdf'
            ? await api.exportClinicalStatisticsToPdf(startDate, endDate)
            : await api.exportClinicalStatisticsToExcel(startDate, endDate)
          filename = `estadisticas_clinicas_${startDate}_${endDate}.${extension}`
          break
        default:
          throw new Error('Tipo de reporte no válido')
      }

      downloadBlob(blob, filename)
      message.success(`Reporte exportado a ${format.toUpperCase()} exitosamente`)
    } catch {
      message.error(`Error al exportar el reporte a ${format.toUpperCase()}`)
    } finally {
      setExporting(false)
    }
  }

  // Specialties list
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

  // Table columns for productivity report
  const productivityColumns = [
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 200
    },
    {
      title: 'Especialidad',
      dataIndex: 'specialization',
      key: 'specialization',
      width: 150
    },
    {
      title: 'Consultas',
      dataIndex: 'totalConsultations',
      key: 'totalConsultations',
      width: 100,
      sorter: (a: DoctorProductivity, b: DoctorProductivity) => a.totalConsultations - b.totalConsultations
    },
    {
      title: 'Completadas',
      dataIndex: 'completedConsultations',
      key: 'completedConsultations',
      width: 110
    },
    {
      title: 'Pacientes Únicos',
      dataIndex: 'uniquePatients',
      key: 'uniquePatients',
      width: 130
    },
    {
      title: 'Prescripciones',
      dataIndex: 'prescriptionsIssued',
      key: 'prescriptionsIssued',
      width: 120
    },
    {
      title: 'Exámenes Lab.',
      dataIndex: 'labExamsRequested',
      key: 'labExamsRequested',
      width: 120
    },
    {
      title: 'Derivaciones',
      dataIndex: 'referralsMade',
      key: 'referralsMade',
      width: 110
    }
  ]

  // Render filter section based on active tab
  const renderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Form layout="inline" style={{ flexWrap: 'wrap', gap: 8 }}>
        <Form.Item label="Rango de Fechas">
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]])
              }
            }}
            format="DD/MM/YYYY"
          />
        </Form.Item>

        {(activeTab === 'productivity' || activeTab === 'attendance') && (
          <Form.Item label="Doctor">
            <Select
              showSearch
              allowClear
              placeholder="Todos los doctores"
              style={{ width: 200 }}
              value={selectedDoctorId}
              onChange={setSelectedDoctorId}
              onFocus={loadDoctors}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={doctors.map(d => ({
                value: d.id,
                label: `Dr. ${d.user.firstName} ${d.user.lastName}`
              }))}
            />
          </Form.Item>
        )}

        {activeTab === 'attendance' && (
          <Form.Item label="Especialidad">
            <Select
              allowClear
              placeholder="Todas las especialidades"
              style={{ width: 180 }}
              value={selectedSpecialty}
              onChange={setSelectedSpecialty}
              options={specialties.map(s => ({ value: s, label: s }))}
            />
          </Form.Item>
        )}

        {activeTab === 'frequent-patients' && (
          <Form.Item label="Mínimo de Visitas">
            <InputNumber
              min={1}
              max={100}
              value={visitThreshold}
              onChange={(val) => setVisitThreshold(val || 3)}
              style={{ width: 100 }}
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" icon={<BarChartOutlined />} onClick={generateReport} loading={loading}>
            Generar Reporte
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )

  // Render productivity report
  const renderProductivityReport = () => {
    if (!productivityReport) {
      return <Empty description="Genere un reporte para ver los resultados" />
    }

    return (
      <>
        <StatsCard>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Total Doctores"
                value={productivityReport.totalDoctors}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Total Consultas"
                value={productivityReport.totalConsultations}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Promedio por Doctor"
                value={productivityReport.averageConsultationsPerDoctor?.toFixed(1) || 0}
                prefix={<LineChartOutlined />}
              />
            </Col>
          </Row>
        </StatsCard>

        <Card title="Productividad por Doctor">
          <Table
            columns={productivityColumns}
            dataSource={productivityReport.doctorProductivity}
            rowKey="doctorId"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            locale={{ emptyText: <Empty description="No hay datos de productividad" /> }}
          />
        </Card>

        <ExportButtonGroup>
          <Button icon={<FilePdfOutlined />} onClick={() => exportReport('pdf')} loading={exporting}>
            Exportar PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={() => exportReport('excel')} loading={exporting}>
            Exportar Excel
          </Button>
        </ExportButtonGroup>
      </>
    )
  }

  // Render attendance report
  const renderAttendanceReport = () => {
    if (!attendanceReport) {
      return <Empty description="Genere un reporte para ver los resultados" />
    }

    const completionRate = attendanceReport.completionRate || 
      (attendanceReport.totalVisits > 0 
        ? (attendanceReport.completedVisits / attendanceReport.totalVisits) * 100 
        : 0)

    return (
      <>
        <StatsCard>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Total Visitas"
                value={attendanceReport.totalVisits}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Completadas"
                value={attendanceReport.completedVisits}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Canceladas"
                value={attendanceReport.cancelledVisits}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="No Asistieron"
                value={attendanceReport.noShowVisits}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={24}>
              <Text>Tasa de Completado</Text>
              <Progress 
                percent={Number(completionRate.toFixed(1))} 
                status={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'normal' : 'exception'}
              />
            </Col>
          </Row>
        </StatsCard>

        <Card title="Asistencia Diaria">
          <Table
            columns={[
              { title: 'Fecha', dataIndex: 'date', key: 'date', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
              { title: 'Total Visitas', dataIndex: 'totalVisits', key: 'totalVisits' },
              { title: 'Completadas', dataIndex: 'completedVisits', key: 'completedVisits' },
              { title: 'Canceladas', dataIndex: 'cancelledVisits', key: 'cancelledVisits' },
              { title: 'No Asistieron', dataIndex: 'noShowVisits', key: 'noShowVisits' }
            ]}
            dataSource={attendanceReport.dailyAttendance}
            rowKey="date"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="No hay datos de asistencia" /> }}
          />
        </Card>

        <ExportButtonGroup>
          <Button icon={<FilePdfOutlined />} onClick={() => exportReport('pdf')} loading={exporting}>
            Exportar PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={() => exportReport('excel')} loading={exporting}>
            Exportar Excel
          </Button>
        </ExportButtonGroup>
      </>
    )
  }

  // Render frequent patients report
  const renderFrequentPatientsReport = () => {
    if (!frequentPatientsReport) {
      return <Empty description="Genere un reporte para ver los resultados" />
    }

    return (
      <>
        <StatsCard>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Pacientes Frecuentes"
                value={frequentPatientsReport.totalFrequentPatients}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Umbral de Visitas"
                value={frequentPatientsReport.visitThreshold}
                suffix="visitas mínimas"
              />
            </Col>
          </Row>
        </StatsCard>

        <Card title="Pacientes Frecuentes">
          <Table
            columns={[
              { title: 'Paciente', dataIndex: 'patientName', key: 'patientName', width: 200 },
              { 
                title: 'Visitas', 
                dataIndex: 'visitCount', 
                key: 'visitCount', 
                width: 100,
                sorter: (a, b) => a.visitCount - b.visitCount,
                defaultSortOrder: 'descend'
              },
              { 
                title: 'Última Visita', 
                dataIndex: 'lastVisitDate', 
                key: 'lastVisitDate',
                width: 120,
                render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : '-'
              },
              { title: 'Doctor Principal', dataIndex: 'primaryDoctor', key: 'primaryDoctor', width: 180 }
            ]}
            dataSource={frequentPatientsReport.frequentPatients}
            rowKey="patientId"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="No hay pacientes frecuentes" /> }}
          />
        </Card>

        <ExportButtonGroup>
          <Button icon={<FilePdfOutlined />} onClick={() => exportReport('pdf')} loading={exporting}>
            Exportar PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={() => exportReport('excel')} loading={exporting}>
            Exportar Excel
          </Button>
        </ExportButtonGroup>
      </>
    )
  }

  // Render clinical statistics
  const renderClinicalStatistics = () => {
    if (!clinicalStatistics) {
      return <Empty description="Genere un reporte para ver los resultados" />
    }

    return (
      <>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Notas Médicas"
                value={clinicalStatistics.totalMedicalNotes}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Prescripciones"
                value={clinicalStatistics.totalPrescriptions}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Exámenes de Lab."
                value={clinicalStatistics.totalLabExams}
                prefix={<ExperimentOutlined />}
                suffix={<Text type="secondary" style={{ fontSize: 14 }}>({clinicalStatistics.completedLabExams} completados)</Text>}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Hospitalizaciones"
                value={clinicalStatistics.totalHospitalizations}
                prefix={<HomeOutlined />}
                suffix={<Text type="secondary" style={{ fontSize: 14 }}>({clinicalStatistics.activeHospitalizations} activas)</Text>}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total Triajes"
                value={clinicalStatistics.totalTriages}
                prefix={<AlertOutlined />}
              />
              {clinicalStatistics.averageTriageWaitTime > 0 && (
                <Text type="secondary">
                  Tiempo promedio de espera: {clinicalStatistics.averageTriageWaitTime.toFixed(0)} min
                </Text>
              )}
            </Card>
          </Col>
        </Row>

        <Card title="Top 10 Diagnósticos">
          <Table
            columns={[
              { title: 'Diagnóstico', dataIndex: 'diagnosis', key: 'diagnosis' },
              { title: 'Cantidad', dataIndex: 'count', key: 'count', width: 100 },
              { 
                title: 'Porcentaje', 
                dataIndex: 'percentage', 
                key: 'percentage', 
                width: 150,
                render: (val: number) => (
                  <Progress percent={Number(val.toFixed(1))} size="small" />
                )
              }
            ]}
            dataSource={clinicalStatistics.topDiagnoses}
            rowKey="diagnosis"
            pagination={false}
            locale={{ emptyText: <Empty description="No hay datos de diagnósticos" /> }}
          />
        </Card>

        <ExportButtonGroup>
          <Button icon={<FilePdfOutlined />} onClick={() => exportReport('pdf')} loading={exporting}>
            Exportar PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={() => exportReport('excel')} loading={exporting}>
            Exportar Excel
          </Button>
        </ExportButtonGroup>
      </>
    )
  }

  if (!canViewReports) {
    return (
      <PageContainer>
        <Card>
          <Empty description="No tiene permisos para ver reportes" />
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title level={3}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Reportes Avanzados
        </Title>
        <Button icon={<ReloadOutlined />} onClick={() => {
          setProductivityReport(null)
          setAttendanceReport(null)
          setFrequentPatientsReport(null)
          setClinicalStatistics(null)
        }}>
          Limpiar
        </Button>
      </HeaderSection>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as ReportType)}
        items={[
          {
            key: 'productivity',
            label: (
              <span>
                <TeamOutlined />
                Productividad
              </span>
            ),
            children: (
              <Spin spinning={loading}>
                {renderFilters()}
                {renderProductivityReport()}
              </Spin>
            )
          },
          {
            key: 'attendance',
            label: (
              <span>
                <CalendarOutlined />
                Asistencia
              </span>
            ),
            children: (
              <Spin spinning={loading}>
                {renderFilters()}
                {renderAttendanceReport()}
              </Spin>
            )
          },
          {
            key: 'frequent-patients',
            label: (
              <span>
                <UserOutlined />
                Pacientes Frecuentes
              </span>
            ),
            children: (
              <Spin spinning={loading}>
                {renderFilters()}
                {renderFrequentPatientsReport()}
              </Spin>
            )
          },
          {
            key: 'clinical-statistics',
            label: (
              <span>
                <LineChartOutlined />
                Estadísticas Clínicas
              </span>
            ),
            children: (
              <Spin spinning={loading}>
                {renderFilters()}
                {renderClinicalStatistics()}
              </Spin>
            )
          }
        ]}
      />
    </PageContainer>
  )
}
