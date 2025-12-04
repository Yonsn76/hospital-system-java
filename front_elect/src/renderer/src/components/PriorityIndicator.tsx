import { Tag, Tooltip } from 'antd'
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import { TriagePriority } from '../services/api'

interface PriorityIndicatorProps {
  priority: TriagePriority | null
  showLabel?: boolean
  size?: 'small' | 'default' | 'large'
}

const priorityConfig: Record<TriagePriority, {
  color: string
  bgColor: string
  label: string
  labelEs: string
  icon: React.ReactNode
  level: number
  description: string
}> = {
  RESUSCITATION: {
    color: '#fff',
    bgColor: '#ff0000',
    label: 'Resuscitation',
    labelEs: 'Resucitación',
    icon: <ExclamationCircleOutlined />,
    level: 1,
    description: 'Nivel 1 - Atención inmediata requerida'
  },
  EMERGENT: {
    color: '#fff',
    bgColor: '#ff4d00',
    label: 'Emergent',
    labelEs: 'Emergente',
    icon: <WarningOutlined />,
    level: 2,
    description: 'Nivel 2 - Muy urgente (< 10 min)'
  },
  URGENT: {
    color: '#000',
    bgColor: '#faad14',
    label: 'Urgent',
    labelEs: 'Urgente',
    icon: <ClockCircleOutlined />,
    level: 3,
    description: 'Nivel 3 - Urgente (< 30 min)'
  },
  LESS_URGENT: {
    color: '#000',
    bgColor: '#52c41a',
    label: 'Less Urgent',
    labelEs: 'Menos Urgente',
    icon: <InfoCircleOutlined />,
    level: 4,
    description: 'Nivel 4 - Menos urgente (< 60 min)'
  },
  NON_URGENT: {
    color: '#000',
    bgColor: '#1890ff',
    label: 'Non-Urgent',
    labelEs: 'No Urgente',
    icon: <CheckCircleOutlined />,
    level: 5,
    description: 'Nivel 5 - No urgente (< 120 min)'
  }
}

const PriorityBadge = styled.div<{ $bgColor: string; $color: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${props => props.$size === 'small' ? '2px 8px' : props.$size === 'large' ? '8px 16px' : '4px 12px'};
  border-radius: 20px;
  background-color: ${props => props.$bgColor};
  color: ${props => props.$color};
  font-weight: 600;
  font-size: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '16px' : '14px'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  
  .anticon {
    font-size: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '18px' : '14px'};
  }
`

const LevelCircle = styled.div<{ $bgColor: string; $color: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$size === 'small' ? '24px' : props.$size === 'large' ? '40px' : '32px'};
  height: ${props => props.$size === 'small' ? '24px' : props.$size === 'large' ? '40px' : '32px'};
  border-radius: 50%;
  background-color: ${props => props.$bgColor};
  color: ${props => props.$color};
  font-weight: 700;
  font-size: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '18px' : '14px'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
`

export default function PriorityIndicator({ priority, showLabel = true, size = 'default' }: PriorityIndicatorProps) {
  if (!priority) {
    return (
      <Tag color="default">Sin clasificar</Tag>
    )
  }

  const config = priorityConfig[priority]

  if (!showLabel) {
    return (
      <Tooltip title={`${config.labelEs} - ${config.description}`}>
        <LevelCircle $bgColor={config.bgColor} $color={config.color} $size={size}>
          {config.level}
        </LevelCircle>
      </Tooltip>
    )
  }

  return (
    <Tooltip title={config.description}>
      <PriorityBadge $bgColor={config.bgColor} $color={config.color} $size={size}>
        {config.icon}
        <span>{config.labelEs}</span>
        <span style={{ opacity: 0.8 }}>({config.level})</span>
      </PriorityBadge>
    </Tooltip>
  )
}

export { priorityConfig }
export type { PriorityIndicatorProps }
