import { Card, Statistic, Row, Col, Typography, Tooltip, Tag } from 'antd'
import {
  HeartOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  DashboardOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import dayjs from 'dayjs'
import type { VitalSignsResponse } from '../services/api'

const { Text } = Typography

interface VitalSignsCardProps {
  vitalSigns: VitalSignsResponse | null
  loading?: boolean
  showPatientInfo?: boolean
  compact?: boolean
}

const StyledCard = styled(Card)<{ $compact?: boolean }>`
  .ant-card-body {
    padding: ${props => props.$compact ? '12px' : '16px'};
  }
`

const VitalStatistic = styled.div<{ $warning?: boolean; $critical?: boolean }>`
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background: ${props => 
    props.$critical ? 'rgba(255, 77, 79, 0.1)' : 
    props.$warning ? 'rgba(250, 173, 20, 0.1)' : 
    'transparent'};
  border: 1px solid ${props => 
    props.$critical ? 'rgba(255, 77, 79, 0.3)' : 
    props.$warning ? 'rgba(250, 173, 20, 0.3)' : 
    'transparent'};
`

const IconWrapper = styled.span<{ $color?: string }>`
  font-size: 18px;
  color: ${props => props.$color || '#1890ff'};
  margin-right: 8px;
`

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

// Normal ranges for vital signs
const VITAL_RANGES = {
  bloodPressureSystolic: { min: 90, max: 140, criticalMin: 80, criticalMax: 180 },
  bloodPressureDiastolic: { min: 60, max: 90, criticalMin: 50, criticalMax: 120 },
  heartRate: { min: 60, max: 100, criticalMin: 40, criticalMax: 150 },
  temperature: { min: 36.1, max: 37.2, criticalMin: 35, criticalMax: 39 },
  respiratoryRate: { min: 12, max: 20, criticalMin: 8, criticalMax: 30 },
  oxygenSaturation: { min: 95, max: 100, criticalMin: 90, criticalMax: 100 }
}

function getVitalStatus(value: number, range: typeof VITAL_RANGES.heartRate): 'normal' | 'warning' | 'critical' {
  if (value < range.criticalMin || value > range.criticalMax) return 'critical'
  if (value < range.min || value > range.max) return 'warning'
  return 'normal'
}

function getStatusColor(status: 'normal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'critical': return '#ff4d4f'
    case 'warning': return '#faad14'
    default: return '#52c41a'
  }
}

export default function VitalSignsCard({ 
  vitalSigns, 
  loading = false, 
  showPatientInfo = false,
  compact = false 
}: VitalSignsCardProps) {
  if (!vitalSigns && !loading) {
    return (
      <StyledCard $compact={compact}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <DashboardOutlined style={{ fontSize: 32, marginBottom: 8 }} />
          <div>No hay signos vitales registrados</div>
        </div>
      </StyledCard>
    )
  }

  const bpSystolicStatus = vitalSigns ? getVitalStatus(vitalSigns.bloodPressureSystolic, VITAL_RANGES.bloodPressureSystolic) : 'normal'
  const bpDiastolicStatus = vitalSigns ? getVitalStatus(vitalSigns.bloodPressureDiastolic, VITAL_RANGES.bloodPressureDiastolic) : 'normal'
  const bpStatus = bpSystolicStatus === 'critical' || bpDiastolicStatus === 'critical' ? 'critical' : 
                   bpSystolicStatus === 'warning' || bpDiastolicStatus === 'warning' ? 'warning' : 'normal'
  
  const heartRateStatus = vitalSigns ? getVitalStatus(vitalSigns.heartRate, VITAL_RANGES.heartRate) : 'normal'
  const tempStatus = vitalSigns ? getVitalStatus(vitalSigns.temperature, VITAL_RANGES.temperature) : 'normal'
  const respStatus = vitalSigns ? getVitalStatus(vitalSigns.respiratoryRate, VITAL_RANGES.respiratoryRate) : 'normal'
  const o2Status = vitalSigns ? getVitalStatus(vitalSigns.oxygenSaturation, VITAL_RANGES.oxygenSaturation) : 'normal'

  const colSpan = compact ? 8 : 6

  return (
    <StyledCard $compact={compact} loading={loading}>
      <HeaderRow>
        <div>
          <Text strong style={{ fontSize: compact ? 14 : 16 }}>
            <DashboardOutlined style={{ marginRight: 8 }} />
            Signos Vitales
          </Text>
          {showPatientInfo && vitalSigns && (
            <Tag style={{ marginLeft: 8 }}>{vitalSigns.patientName}</Tag>
          )}
        </div>
        {vitalSigns && (
          <Tooltip title={`Registrado por: ${vitalSigns.nurseName}`}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(vitalSigns.recordedAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Tooltip>
        )}
      </HeaderRow>

      <Row gutter={[12, 12]}>
        {/* Blood Pressure */}
        <Col span={compact ? 12 : colSpan}>
          <Tooltip title={`Normal: 90-140 / 60-90 mmHg`}>
            <VitalStatistic $warning={bpStatus === 'warning'} $critical={bpStatus === 'critical'}>
              <Statistic
                title={
                  <span>
                    <IconWrapper $color={getStatusColor(bpStatus)}>
                      <DashboardOutlined />
                    </IconWrapper>
                    Presión Arterial
                  </span>
                }
                value={vitalSigns ? `${vitalSigns.bloodPressureSystolic}/${vitalSigns.bloodPressureDiastolic}` : '-'}
                suffix="mmHg"
                valueStyle={{ 
                  fontSize: compact ? 16 : 20,
                  color: getStatusColor(bpStatus)
                }}
              />
            </VitalStatistic>
          </Tooltip>
        </Col>

        {/* Heart Rate */}
        <Col span={compact ? 12 : colSpan}>
          <Tooltip title={`Normal: 60-100 lpm`}>
            <VitalStatistic $warning={heartRateStatus === 'warning'} $critical={heartRateStatus === 'critical'}>
              <Statistic
                title={
                  <span>
                    <IconWrapper $color={getStatusColor(heartRateStatus)}>
                      <HeartOutlined />
                    </IconWrapper>
                    Frec. Cardíaca
                  </span>
                }
                value={vitalSigns?.heartRate ?? '-'}
                suffix="lpm"
                valueStyle={{ 
                  fontSize: compact ? 16 : 20,
                  color: getStatusColor(heartRateStatus)
                }}
              />
            </VitalStatistic>
          </Tooltip>
        </Col>

        {/* Temperature */}
        <Col span={compact ? 12 : colSpan}>
          <Tooltip title={`Normal: 36.1-37.2 °C`}>
            <VitalStatistic $warning={tempStatus === 'warning'} $critical={tempStatus === 'critical'}>
              <Statistic
                title={
                  <span>
                    <IconWrapper $color={getStatusColor(tempStatus)}>
                      <ThunderboltOutlined />
                    </IconWrapper>
                    Temperatura
                  </span>
                }
                value={vitalSigns?.temperature ?? '-'}
                suffix="°C"
                precision={1}
                valueStyle={{ 
                  fontSize: compact ? 16 : 20,
                  color: getStatusColor(tempStatus)
                }}
              />
            </VitalStatistic>
          </Tooltip>
        </Col>

        {/* Respiratory Rate */}
        <Col span={compact ? 12 : colSpan}>
          <Tooltip title={`Normal: 12-20 rpm`}>
            <VitalStatistic $warning={respStatus === 'warning'} $critical={respStatus === 'critical'}>
              <Statistic
                title={
                  <span>
                    <IconWrapper $color={getStatusColor(respStatus)}>
                      <CloudOutlined />
                    </IconWrapper>
                    Frec. Respiratoria
                  </span>
                }
                value={vitalSigns?.respiratoryRate ?? '-'}
                suffix="rpm"
                valueStyle={{ 
                  fontSize: compact ? 16 : 20,
                  color: getStatusColor(respStatus)
                }}
              />
            </VitalStatistic>
          </Tooltip>
        </Col>

        {/* Oxygen Saturation */}
        <Col span={compact ? 12 : colSpan}>
          <Tooltip title={`Normal: 95-100%`}>
            <VitalStatistic $warning={o2Status === 'warning'} $critical={o2Status === 'critical'}>
              <Statistic
                title={
                  <span>
                    <IconWrapper $color={getStatusColor(o2Status)}>
                      <CloudOutlined />
                    </IconWrapper>
                    Sat. Oxígeno
                  </span>
                }
                value={vitalSigns?.oxygenSaturation ?? '-'}
                suffix="%"
                valueStyle={{ 
                  fontSize: compact ? 16 : 20,
                  color: getStatusColor(o2Status)
                }}
              />
            </VitalStatistic>
          </Tooltip>
        </Col>

        {/* Weight */}
        <Col span={compact ? 12 : colSpan}>
          <VitalStatistic>
            <Statistic
              title={
                <span>
                  <IconWrapper $color="#1890ff">
                    <UserOutlined />
                  </IconWrapper>
                  Peso
                </span>
              }
              value={vitalSigns?.weight ?? '-'}
              suffix="kg"
              precision={1}
              valueStyle={{ fontSize: compact ? 16 : 20 }}
            />
          </VitalStatistic>
        </Col>
      </Row>
    </StyledCard>
  )
}
