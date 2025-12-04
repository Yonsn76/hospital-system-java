import { Card, Typography, Switch, Segmented, ColorPicker, Select, Button } from 'antd'
import styled from 'styled-components'
import { Sun, Moon, Monitor, RotateCcw, Palette, Layout, Type, ZoomIn, Minus, Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeProvider'
import { useSettings, useUserTheme } from '../../hooks/useSettings'
import { ThemeMode } from '@shared/types'
import { useCallback, useEffect, useMemo, useState } from 'react'

const { Title, Text } = Typography

const THEME_COLOR_PRESETS = [
  '#00b96b',
  '#1677ff',
  '#722ed1',
  '#eb2f96',
  '#fa541c',
  '#faad14',
  '#13c2c2',
  '#52c41a'
]

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const SettingGroup = styled(Card)`
  margin-bottom: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  .ant-card-head {
    border-bottom: 1px solid var(--color-border);
    padding: 16px 24px;
  }
  .ant-card-head-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
  }
  .ant-card-body {
    padding: 0;
  }
`

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border-soft);
  &:last-child {
    border-bottom: none;
  }
`

const SettingRowTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const SettingLabel = styled(Text)`
  font-weight: 500;
`

const SettingDescription = styled(Text)`
  font-size: 12px;
`

const ColorCircleWrapper = styled.div`
  width: 28px;
  height: 28px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ColorCircle = styled.div<{ $color: string; $isActive?: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  cursor: pointer;
  transform: translate(-50%, -50%);
  border: 2px solid ${(props) => (props.$isActive ? 'var(--color-text)' : 'transparent')};
  transition: all 0.2s;
  &:hover {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
`

const HStack = styled.div<{ $gap?: string }>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.$gap || '8px'};
`

const ZoomValue = styled.span`
  min-width: 50px;
  text-align: center;
  font-weight: 500;
`

export default function DisplaySettings() {
  const { settedTheme, setTheme } = useTheme()
  const { windowStyle, setWindowStyle, navbarPosition, setNavbarPosition } = useSettings()
  const { userTheme, setUserTheme, initUserTheme } = useUserTheme()
  const [fontList, setFontList] = useState<string[]>([])
  const [zoomLevel, setZoomLevel] = useState(100)

  useEffect(() => {
    initUserTheme()
    // Obtener zoom actual
    const currentZoom = (window.api as any)?.zoom?.get?.() || 1
    setZoomLevel(Math.round(currentZoom * 100))
  }, [initUserTheme])

  useEffect(() => {
    const defaultFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
      'Tahoma', 'Trebuchet MS', 'Segoe UI', 'Roboto', 'Open Sans',
      'Ubuntu', 'Consolas', 'Courier New', 'Fira Code', 'JetBrains Mono'
    ]
    setFontList(defaultFonts)
  }, [])

  const handleColorPrimaryChange = useCallback(
    (colorHex: string) => {
      setUserTheme({ ...userTheme, colorPrimary: colorHex })
    },
    [setUserTheme, userTheme]
  )

  const handleUserFontChange = useCallback(
    (value: string) => {
      setUserTheme({ ...userTheme, userFontFamily: value })
    },
    [setUserTheme, userTheme]
  )

  const handleUserCodeFontChange = useCallback(
    (value: string) => {
      setUserTheme({ ...userTheme, userCodeFontFamily: value })
    },
    [setUserTheme, userTheme]
  )

  const handleWindowStyleChange = useCallback(
    (checked: boolean) => {
      setWindowStyle(checked ? 'transparent' : 'opaque')
    },
    [setWindowStyle]
  )

  const themeOptions = useMemo(
    () => [
      { value: ThemeMode.light, label: <HStack $gap="6px"><Sun size={16} /><span>Claro</span></HStack> },
      { value: ThemeMode.dark, label: <HStack $gap="6px"><Moon size={16} /><span>Oscuro</span></HStack> },
      { value: ThemeMode.system, label: <HStack $gap="6px"><Monitor size={16} /><span>Sistema</span></HStack> }
    ],
    []
  )

  const navbarOptions = useMemo(() => [
    { label: 'Izquierda', value: 'left' },
    { label: 'Arriba', value: 'top' }
  ], [])

  const isMac = navigator.userAgent.includes('Mac')

  return (
    <PageContainer>
      <Title level={3} style={{ marginBottom: 24 }}>Configuración de Pantalla</Title>

      <SettingGroup title={<><Palette size={18} /> Tema</>}>
        <SettingRow>
          <SettingRowTitle>
            <SettingLabel>Modo de tema</SettingLabel>
            <SettingDescription type="secondary">Selecciona el tema de la aplicación</SettingDescription>
          </SettingRowTitle>
          <Segmented value={settedTheme} onChange={(v) => setTheme(v as ThemeMode)} options={themeOptions} />
        </SettingRow>
        <SettingRow>
          <SettingRowTitle>
            <SettingLabel>Color primario</SettingLabel>
            <SettingDescription type="secondary">Personaliza el color de acento</SettingDescription>
          </SettingRowTitle>
          <HStack $gap="12px">
            <HStack $gap="8px">
              {THEME_COLOR_PRESETS.map((color) => (
                <ColorCircleWrapper key={color}>
                  <ColorCircle $color={color} $isActive={userTheme.colorPrimary === color} onClick={() => handleColorPrimaryChange(color)} />
                </ColorCircleWrapper>
              ))}
            </HStack>
            <ColorPicker value={userTheme.colorPrimary} onChange={(c) => handleColorPrimaryChange(c.toHexString())} showText size="small" presets={[{ label: 'Presets', colors: THEME_COLOR_PRESETS }]} />
          </HStack>
        </SettingRow>
        {isMac && (
          <SettingRow>
            <SettingRowTitle>
              <SettingLabel>Ventana transparente</SettingLabel>
              <SettingDescription type="secondary">Efecto de transparencia</SettingDescription>
            </SettingRowTitle>
            <Switch checked={windowStyle === 'transparent'} onChange={handleWindowStyleChange} />
          </SettingRow>
        )}
      </SettingGroup>

      <SettingGroup title={<><Layout size={18} /> Diseño</>}>
        <SettingRow>
          <SettingRowTitle>
            <SettingLabel>Posición del menú</SettingLabel>
            <SettingDescription type="secondary">Ubicación de la barra de navegación</SettingDescription>
          </SettingRowTitle>
          <Segmented value={navbarPosition} onChange={(v) => setNavbarPosition(v as 'left' | 'top')} options={navbarOptions} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title={<><ZoomIn size={18} /> Zoom</>}>
        <SettingRow>
          <SettingRowTitle>
            <SettingLabel>Nivel de zoom</SettingLabel>
            <SettingDescription type="secondary">Ajusta el tamaño de la interfaz</SettingDescription>
          </SettingRowTitle>
          <HStack $gap="8px">
            <Button
              icon={<Minus size={14} />}
              disabled={zoomLevel <= 50}
              onClick={() => {
                const newZoom = Math.max(zoomLevel - 10, 50)
                setZoomLevel(newZoom);
                (window.api as any)?.zoom?.set?.(newZoom / 100)
              }}
            />
            <ZoomValue>{zoomLevel}%</ZoomValue>
            <Button
              icon={<Plus size={14} />}
              disabled={zoomLevel >= 150}
              onClick={() => {
                const newZoom = Math.min(zoomLevel + 10, 150)
                setZoomLevel(newZoom);
                (window.api as any)?.zoom?.set?.(newZoom / 100)
              }}
            />
            <Button
              icon={<RotateCcw size={14} />}
              onClick={() => {
                setZoomLevel(100);
                (window.api as any)?.zoom?.reset?.()
              }}
            />
          </HStack>
        </SettingRow>
      </SettingGroup>

      <SettingGroup title={<><Type size={18} /> Fuentes</>}>
        <SettingRow>
          <SettingRowTitle>
            <SettingLabel>Fuente global</SettingLabel>
            <SettingDescription type="secondary">Tipografía para toda la aplicación</SettingDescription>
          </SettingRowTitle>
          <HStack $gap="8px">
            <Select
              style={{ width: 200 }}
              placeholder="Seleccionar fuente"
              value={userTheme.userFontFamily || undefined}
              onChange={handleUserFontChange}
              allowClear
              showSearch
              options={[{ label: 'Por defecto', value: '' }, ...fontList.map((f) => ({ label: <span style={{ fontFamily: f }}>{f}</span>, value: f }))]}
            />
            <Button icon={<RotateCcw size={14} />} onClick={() => handleUserFontChange('')} />
          </HStack>
        </SettingRow>
        <SettingRow>
          <SettingRowTitle>
            <SettingLabel>Fuente de código</SettingLabel>
            <SettingDescription type="secondary">Tipografía para bloques de código</SettingDescription>
          </SettingRowTitle>
          <HStack $gap="8px">
            <Select
              style={{ width: 200 }}
              placeholder="Seleccionar fuente"
              value={userTheme.userCodeFontFamily || undefined}
              onChange={handleUserCodeFontChange}
              allowClear
              showSearch
              options={[{ label: 'Por defecto', value: '' }, ...fontList.filter((f) => ['Consolas', 'Courier New', 'Fira Code', 'JetBrains Mono'].includes(f)).map((f) => ({ label: <span style={{ fontFamily: f }}>{f}</span>, value: f }))]}
            />
            <Button icon={<RotateCcw size={14} />} onClick={() => handleUserCodeFontChange('')} />
          </HStack>
        </SettingRow>
      </SettingGroup>
    </PageContainer>
  )
}
