import { forwardRef } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { PrescriptionPrintResponse, PrescriptionItemResponse } from '../services/api'

const PrintContainer = styled.div`
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  background: white;
  color: black;
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  line-height: 1.5;

  @media print {
    margin: 0;
    padding: 15mm;
    box-shadow: none;
  }

  @media screen {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
  }
`

const Header = styled.div`
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 15px;
  margin-bottom: 20px;
`

const HospitalName = styled.h1`
  font-size: 18pt;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #1a365d;
`

const HospitalAddress = styled.p`
  font-size: 10pt;
  margin: 0;
  color: #666;
`

const Title = styled.h2`
  font-size: 16pt;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`

const InfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
`

const InfoBlock = styled.div`
  flex: 1;
`

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 8px;
`

const InfoLabel = styled.span`
  font-weight: bold;
  min-width: 120px;
`

const InfoValue = styled.span`
  flex: 1;
`

const MedicationsSection = styled.div`
  margin: 30px 0;
`

const MedicationsTitle = styled.h3`
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
`

const MedicationItem = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;

  @media print {
    background: white;
    border: 1px solid #333;
  }
`

const MedicationName = styled.div`
  font-size: 13pt;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a365d;

  @media print {
    color: black;
  }
`

const MedicationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  font-size: 11pt;
`

const MedicationDetail = styled.div`
  span:first-child {
    font-weight: bold;
  }
`

const MedicationInstructions = styled.div`
  margin-top: 10px;
  font-style: italic;
  font-size: 11pt;
  color: #555;

  @media print {
    color: black;
  }
`

const NotesSection = styled.div`
  margin: 20px 0;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
`

const NotesTitle = styled.h4`
  font-weight: bold;
  margin: 0 0 10px 0;
`

const NotesContent = styled.p`
  margin: 0;
  white-space: pre-wrap;
`

const Footer = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`

const SignatureBlock = styled.div`
  text-align: center;
  width: 200px;
`

const SignatureLine = styled.div`
  border-top: 1px solid #333;
  margin-top: 60px;
  padding-top: 5px;
`

const DateBlock = styled.div`
  text-align: right;
  font-size: 11pt;
`

const PrescriptionNumber = styled.div`
  font-size: 10pt;
  color: #666;
  text-align: right;
  margin-bottom: 10px;
`

interface PrintableDocumentProps {
  data: PrescriptionPrintResponse
}

const PrintableDocument = forwardRef<HTMLDivElement, PrintableDocumentProps>(
  ({ data }, ref) => {
    const formatDate = (dateStr: string) => {
      return dayjs(dateStr).format('DD/MM/YYYY')
    }

    const formatDateTime = (dateStr: string) => {
      return dayjs(dateStr).format('DD/MM/YYYY HH:mm')
    }

    return (
      <PrintContainer ref={ref}>
        <PrescriptionNumber>
          Receta N° {data.prescriptionId?.toString().padStart(6, '0')}
        </PrescriptionNumber>

        <Header>
          <HospitalName>VitaGuard - Sistema de Gestión</HospitalName>
          <HospitalAddress>Av. Principal 123, Ciudad - Tel: (01) 234-5678</HospitalAddress>
        </Header>

        <Title>Receta Médica</Title>

        <InfoSection>
          <InfoBlock>
            <InfoRow>
              <InfoLabel>Paciente:</InfoLabel>
              <InfoValue>{data.patientName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Fecha Nac.:</InfoLabel>
              <InfoValue>{data.patientDateOfBirth ? formatDate(data.patientDateOfBirth) : '-'}</InfoValue>
            </InfoRow>
          </InfoBlock>
          <InfoBlock>
            <InfoRow>
              <InfoLabel>Doctor:</InfoLabel>
              <InfoValue>{data.doctorName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Especialidad:</InfoLabel>
              <InfoValue>{data.doctorSpecialization || '-'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>CMP:</InfoLabel>
              <InfoValue>{data.doctorLicenseNumber || '-'}</InfoValue>
            </InfoRow>
          </InfoBlock>
        </InfoSection>

        <MedicationsSection>
          <MedicationsTitle>Medicamentos Prescritos</MedicationsTitle>
          {data.items?.map((item: PrescriptionItemResponse, index: number) => (
            <MedicationItem key={item.id || index}>
              <MedicationName>
                {index + 1}. {item.medicationName}
              </MedicationName>
              <MedicationDetails>
                <MedicationDetail>
                  <span>Dosis: </span>
                  <span>{item.dose}</span>
                </MedicationDetail>
                <MedicationDetail>
                  <span>Frecuencia: </span>
                  <span>{item.frequency}</span>
                </MedicationDetail>
                <MedicationDetail>
                  <span>Duración: </span>
                  <span>{item.duration}</span>
                </MedicationDetail>
              </MedicationDetails>
              {item.instructions && (
                <MedicationInstructions>
                  Indicaciones: {item.instructions}
                </MedicationInstructions>
              )}
            </MedicationItem>
          ))}
        </MedicationsSection>

        {data.notes && (
          <NotesSection>
            <NotesTitle>Observaciones:</NotesTitle>
            <NotesContent>{data.notes}</NotesContent>
          </NotesSection>
        )}

        <Footer>
          <SignatureBlock>
            <SignatureLine>
              {data.doctorName}
              <br />
              <small>CMP: {data.doctorLicenseNumber || '-'}</small>
            </SignatureLine>
          </SignatureBlock>
          <DateBlock>
            <div>Fecha de emisión:</div>
            <div><strong>{data.prescriptionDate ? formatDateTime(data.prescriptionDate) : formatDateTime(new Date().toISOString())}</strong></div>
          </DateBlock>
        </Footer>
      </PrintContainer>
    )
  }
)

PrintableDocument.displayName = 'PrintableDocument'

export default PrintableDocument
