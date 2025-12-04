import { useState, useCallback } from 'react'
import { Upload, message, Progress, Typography, Space, Tag } from 'antd'
import { InboxOutlined, FileOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import type { UploadFile, RcFile } from 'antd/es/upload/interface'
import api, { FileType, ClinicalFileResponse } from '../services/api'

const { Dragger } = Upload
const { Text } = Typography

const UploadContainer = styled.div`
  .ant-upload-drag {
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .ant-upload-drag:hover {
    border-color: #22c55e;
  }
  
  .ant-upload-drag-icon {
    color: #22c55e !important;
  }
`

const FileInfoContainer = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
`

const UploadProgress = styled.div`
  margin-top: 12px;
`

// Allowed file types and max size (50MB)
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/dicom',
  'image/dicom'
]

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.dcm', '.dicom']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface FileUploaderProps {
  patientId: number
  fileType: FileType
  onUploadSuccess?: (file: ClinicalFileResponse) => void
  onUploadError?: (error: Error) => void
  disabled?: boolean
}

interface UploadState {
  uploading: boolean
  progress: number
  file: UploadFile | null
  error: string | null
  success: boolean
}

export default function FileUploader({
  patientId,
  fileType,
  onUploadSuccess,
  onUploadError,
  disabled = false
}: FileUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    file: null,
    error: null,
    success: false
  })

  const validateFile = useCallback((file: RcFile): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      message.error(`El archivo excede el tamaño máximo de 50MB`)
      return false
    }

    // Check file type by extension
    const fileName = file.name.toLowerCase()
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
    
    // Check MIME type
    const hasValidMimeType = ALLOWED_MIME_TYPES.includes(file.type) || 
      file.type === '' // Some DICOM files may not have MIME type

    if (!hasValidExtension && !hasValidMimeType) {
      message.error('Formato de archivo no permitido. Use PDF, JPG, PNG o DICOM')
      return false
    }

    return true
  }, [])

  const handleUpload = useCallback(async (file: RcFile) => {
    if (!validateFile(file)) {
      return false
    }

    setUploadState({
      uploading: true,
      progress: 0,
      file: {
        uid: file.uid,
        name: file.name,
        size: file.size,
        type: file.type
      } as UploadFile,
      error: null,
      success: false
    })

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90)
      }))
    }, 200)

    try {
      const response = await api.uploadClinicalFile(patientId, file, fileType)
      
      clearInterval(progressInterval)
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        success: true,
        error: null
      }))

      message.success(`Archivo "${file.name}" subido exitosamente`)
      onUploadSuccess?.(response)

      // Reset state after success
      setTimeout(() => {
        setUploadState({
          uploading: false,
          progress: 0,
          file: null,
          error: null,
          success: false
        })
      }, 2000)

    } catch (error) {
      clearInterval(progressInterval)
      
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo'
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      }))

      message.error(errorMessage)
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage))
    }

    return false // Prevent default upload behavior
  }, [patientId, fileType, validateFile, onUploadSuccess, onUploadError])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf':
        return <FileOutlined style={{ color: '#ff4d4f' }} />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileOutlined style={{ color: '#1890ff' }} />
      case 'dcm':
      case 'dicom':
        return <FileOutlined style={{ color: '#722ed1' }} />
      default:
        return <FileOutlined />
    }
  }

  return (
    <UploadContainer>
      <Dragger
        name="file"
        multiple={false}
        showUploadList={false}
        beforeUpload={handleUpload}
        disabled={disabled || uploadState.uploading}
        accept={ALLOWED_EXTENSIONS.join(',')}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Haga clic o arrastre un archivo aquí para subir
        </p>
        <p className="ant-upload-hint">
          Formatos permitidos: PDF, JPG, PNG, DICOM. Tamaño máximo: 50MB
        </p>
      </Dragger>

      {uploadState.file && (
        <FileInfoContainer>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              {getFileIcon(uploadState.file.name || '')}
              <Text strong>{uploadState.file.name}</Text>
              <Text type="secondary">
                ({formatFileSize(uploadState.file.size || 0)})
              </Text>
              {uploadState.success && (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Subido
                </Tag>
              )}
              {uploadState.error && (
                <Tag color="error" icon={<CloseCircleOutlined />}>
                  Error
                </Tag>
              )}
            </Space>

            {uploadState.uploading && (
              <UploadProgress>
                <Progress 
                  percent={uploadState.progress} 
                  status="active"
                  strokeColor="#22c55e"
                />
              </UploadProgress>
            )}

            {uploadState.error && (
              <Text type="danger">{uploadState.error}</Text>
            )}
          </Space>
        </FileInfoContainer>
      )}
    </UploadContainer>
  )
}
