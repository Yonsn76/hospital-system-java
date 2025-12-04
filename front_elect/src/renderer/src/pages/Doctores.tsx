import { useEffect, useState } from 'react'
import { Table, Tag, Typography, message } from 'antd'
import styled from 'styled-components'
import api, { DoctorResponse } from '../services/api'

const { Title } = Typography

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
`

const TableWrapper = styled.div`
  width: 100%;
  
  .ant-table-wrapper {
    width: 100%;
  }
  
  .ant-table {
    width: 100%;
  }
`

export default function Doctores() {
  const [doctores, setDoctores] = useState<DoctorResponse[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const docs = await api.getDoctors()
      setDoctores(docs)
    } catch {
      message.error('Error al cargar doctores')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Nombre',
      key: 'nombre',
      render: (_: unknown, record: DoctorResponse) => record.user.firstName
    },
    {
      title: 'Apellido',
      key: 'apellido',
      render: (_: unknown, record: DoctorResponse) => record.user.lastName
    },
    { title: 'Matrícula', dataIndex: 'licenseNumber', key: 'licenseNumber' },
    {
      title: 'Especialidad',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (spec: string) => <Tag color="blue">{spec}</Tag>
    },
    {
      title: 'Email',
      key: 'email',
      render: (_: unknown, record: DoctorResponse) => record.user.email
    }
  ]

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Doctores</Title>
      </div>

      <TableWrapper>
        <Table 
          columns={columns} 
          dataSource={doctores} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </TableWrapper>
    </PageContainer>
  )
}
