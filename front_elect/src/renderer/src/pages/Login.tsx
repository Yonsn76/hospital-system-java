import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Select, Space, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import bg from '../assets/login_back.gif'
import { Activity } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store'
import { login, register, clearError } from '../store/authSlice'
import api, { UserRole } from '../services/api'

const { Title, Text } = Typography

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-image: url(${bg});
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55));
    pointer-events: none;
  }
`

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 460px;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 2;

  .ant-card-body {
    padding: 40px 32px;
  }
`

const Logo = styled.div`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, rgba(102,126,234,0.9), rgba(118,75,162,0.9));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: #fff;
`

const StyledForm = styled(Form)`
  .ant-input-affix-wrapper, .ant-input {
    background: rgba(255,255,255,0.04) !important;
    color: #fff !important;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .ant-input::placeholder, .ant-input-affix-wrapper .ant-input::placeholder {
    color: rgba(255,255,255,0.6) !important;
  }

  .ant-form-item-label > label {
    color: rgba(255,255,255,0.9);
  }

  .ant-btn-primary {
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border: none;
  }

  .ant-form-item {
    margin-bottom: 16px;
  }
`

const ToggleLink = styled.span`
  color: #667eea;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`

interface LoginForm {
  username: string
  password: string
}

interface RegisterForm {
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export default function Login() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [form] = Form.useForm()
  const [isRegister, setIsRegister] = useState(false)
  const [dni, setDni] = useState('')
  const [dniLoading, setDniLoading] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleLogin = async (values: LoginForm) => {
    dispatch(login(values))
  }

  const handleRegister = async (values: RegisterForm) => {
    dispatch(register(values))
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    form.resetFields()
    setDni('')
    dispatch(clearError())
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

  return (
    <Container>
      <LoginCard>
        <Header>
          <Logo>
            <Activity size={36} />
          </Logo>
          <Title level={2} style={{ marginBottom: 8 }}>
            {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
          </Title>
          <Text type="secondary">Sistema de Gestión Hospitalaria</Text>
        </Header>

        {error && (
          <Alert
            message={isRegister ? 'Error en el registro' : 'Error de autenticación'}
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 12 }}
          />
        )}

        {isRegister ? (
          <StyledForm form={form} layout="vertical" onFinish={(values) => handleRegister(values as RegisterForm)}>
            <Form.Item label="Buscar por DNI">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="DNI (8 dígitos)"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  prefix={<IdcardOutlined />}
                  size="large"
                />
                <Button type="primary" onClick={buscarDni} loading={dniLoading} size="large">
                  Buscar
                </Button>
              </Space.Compact>
            </Form.Item>
            <Form.Item name="firstName" rules={[{ required: true, message: 'Ingrese su nombre' }]}>
              <Input prefix={<UserOutlined />} placeholder="Nombre" size="large" />
            </Form.Item>
            <Form.Item name="lastName" rules={[{ required: true, message: 'Ingrese su apellido' }]}>
              <Input prefix={<UserOutlined />} placeholder="Apellido" size="large" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Ingrese un email válido' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="username" rules={[{ required: true, message: 'Ingrese su usuario' }]}>
              <Input prefix={<UserOutlined />} placeholder="Usuario" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
            </Form.Item>
            <Form.Item name="role" rules={[{ required: true, message: 'Seleccione un rol' }]}>
              <Select placeholder="Seleccione rol" size="large" options={[
                { value: 'DOCTOR', label: 'Doctor' },
                { value: 'NURSE', label: 'Enfermero/a' },
                { value: 'RECEPTIONIST', label: 'Recepcionista' }
              ]} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>Registrarse</Button>
            </Form.Item>
          </StyledForm>
        ) : (
          <StyledForm form={form} layout="vertical" onFinish={(values) => handleLogin(values as LoginForm)}>
            <Form.Item name="username" rules={[{ required: true, message: 'Ingrese su usuario' }]}>
              <Input prefix={<UserOutlined />} placeholder="Usuario" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Ingrese su contraseña' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>Iniciar Sesión</Button>
            </Form.Item>
          </StyledForm>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <ToggleLink onClick={toggleMode}>
              {isRegister ? 'Iniciar Sesión' : 'Regístrate'}
            </ToggleLink>
          </Text>
        </div>
      </LoginCard>
    </Container>
  )
}
