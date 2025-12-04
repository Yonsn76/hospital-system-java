import { useEffect, useState } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, message, Popconfirm, Typography, Spin } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, IdcardOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import api, { PatientResponse, PatientRequest } from '../services/api'
import { useAppSelector } from '../store'
import dayjs from 'dayjs'

const { Title } = Typography

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
`

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<PatientResponse[]>([])
  const [allPacientes, setAllPacientes] = useState<PatientResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [dniLoading, setDniLoading] = useState(false)
  const [dni, setDni] = useState('')
  const [form] = Form.useForm()
  const { user } = useAppSelector((state) => state.auth)

  const canCreate = ['ADMIN', 'RECEPTIONIST'].includes(user?.role || '')
  const canDelete = user?.role === 'ADMIN'

  useEffect(() => {
    loadPacientes()
  }, [])

  const loadPacientes = async () => {
    setLoading(true)
    try {
      const data = await api.getPatients()
      setPacientes(data)
      setAllPacientes(data)
    } catch {
      message.error('Error al cargar pacientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    if (value.trim()) {
      const filtered = allPacientes.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(value.toLowerCase()) || p.contactNumber?.includes(value)
      )
      setPacientes(filtered)
    } else {
      setPacientes(allPacientes)
    }
  }

  const handleSubmit = async (values: PatientRequest) => {
    try {
      if (editingId) {
        await api.updatePatient(editingId, values)
        message.success('Paciente actualizado')
      } else {
        await api.createPatient(values)
        message.success('Paciente creado')
      }
      setModalOpen(false)
      form.resetFields()
      setEditingId(null)
      loadPacientes()
    } catch {
      message.error('Error al guardar')
    }
  }

  const handleEdit = (paciente: PatientResponse) => {
    setEditingId(paciente.id)
    form.setFieldsValue({
      firstName: paciente.firstName,
      lastName: paciente.lastName,
      dateOfBirth: paciente.dateOfBirth,
      gender: paciente.gender,
      contactNumber: paciente.contactNumber,
      address: paciente.address
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.deletePatient(id)
      message.success('Paciente eliminado')
      loadPacientes()
    } catch {
      message.error('Error al eliminar paciente')
    }
  }

  const buscarDni = async () => {
    if (!dni || dni.length !== 8) {
      message.warning('Ingrese un DNI válido de 8 dígitos')
      return
    }

    setDniLoading(true)
    try {
      const datos = await api.consultarDni(dni)
      form.setFieldsValue({
        firstName: datos.nombres,
        lastName: `${datos.apellidoPaterno} ${datos.apellidoMaterno}`
      })
      message.success('Datos obtenidos correctamente')
    } catch {
      message.error('No se pudo obtener los datos. Verifique el DNI.')
    } finally {
      setDniLoading(false)
    }
  }

  const columns = [
    { title: 'Nombre', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Apellido', dataIndex: 'lastName', key: 'lastName' },
    {
      title: 'Fecha Nac.',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (d: string) => (d ? dayjs(d).format('DD/MM/YYYY') : '-')
    },
    { title: 'Género', dataIndex: 'gender', key: 'gender' },
    { title: 'Teléfono', dataIndex: 'contactNumber', key: 'contactNumber' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: PatientResponse) => (
        <Space>
          {canCreate && <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />}
          {canDelete && (
            <Popconfirm title="¿Eliminar paciente?" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={3}>Pacientes</Title>
        <Space wrap>
          <Input.Search
            placeholder="Buscar paciente..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              Nuevo Paciente
            </Button>
          )}
        </Space>
      </div>

      <Table columns={columns} dataSource={pacientes} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} />

      <Modal
        title={editingId ? 'Editar Paciente' : 'Nuevo Paciente'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
          setEditingId(null)
          setDni('')
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={(values) => handleSubmit(values as PatientRequest)}>
          {!editingId && (
            <Form.Item label="Buscar por DNI">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Ingrese DNI (8 dígitos)"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  prefix={<IdcardOutlined />}
                />
                <Button type="primary" onClick={buscarDni} loading={dniLoading}>
                  {dniLoading ? <Spin size="small" /> : 'Buscar'}
                </Button>
              </Space.Compact>
            </Form.Item>
          )}
          <Form.Item name="firstName" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Apellido" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Fecha de Nacimiento" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="gender" label="Género" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Femenino' },
                { value: 'O', label: 'Otro' }
              ]}
            />
          </Form.Item>
          <Form.Item name="contactNumber" label="Teléfono" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Dirección" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
