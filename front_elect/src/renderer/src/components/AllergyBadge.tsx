import { Tag, Tooltip } from 'antd'
import { WarningOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { AllergySeverity } from '../services/api'

interface AllergyBadgeProps {
  allergyName: string
  severity: AllergySeverity
  notes?: string
  showIcon?: boolean
}

const severityConfig: Record<AllergySeverity, { color: string; icon: React.ReactNode; label: string }> = {
  SEVERE: {
    color: '#ff4d4f',
    icon: <WarningOutlined />,
    label: 'Severa'
  },
  MODERATE: {
    color: '#faad14',
    icon: <ExclamationCircleOutlined />,
    label: 'Moderada'
  },
  MILD: {
    color: '#52c41a',
    icon: <InfoCircleOutlined />,
    label: 'Leve'
  }
}

export default function AllergyBadge({ allergyName, severity, notes, showIcon = true }: AllergyBadgeProps) {
  const config = severityConfig[severity]
  
  const content = (
    <Tag
      color={config.color}
      icon={showIcon ? config.icon : undefined}
      style={{ 
        margin: '2px',
        borderRadius: '6px',
        fontWeight: 500
      }}
    >
      {allergyName}
    </Tag>
  )

  if (notes) {
    return (
      <Tooltip title={`${config.label}: ${notes}`}>
        {content}
      </Tooltip>
    )
  }

  return (
    <Tooltip title={config.label}>
      {content}
    </Tooltip>
  )
}
