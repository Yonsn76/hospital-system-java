const API_BASE_URL = 'http://localhost:2026/api'

class ApiService {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  getToken() {
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
      const error = await response.text()
      throw new Error(error || `HTTP ${response.status}`)
    }

    if (response.status === 204) {
      return null as T
    }

    return response.json()
  }

  private async requestBlob(endpoint: string): Promise<Blob> {
    const headers: HeadersInit = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers })

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
      throw new Error(`HTTP ${response.status}`)
    }

    return response.blob()
  }

  private async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      if (response.status === 401) {
        this.token = null
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
      const error = await response.text()
      throw new Error(error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // ==================== Auth ====================
  async login(username: string, password: string): Promise<{ token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  }

  async register(data: RegisterRequest): Promise<{ token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ==================== Patients ====================
  async getPatients(): Promise<PatientResponse[]> {
    return this.request('/patients')
  }

  async getPatientById(id: number): Promise<PatientResponse> {
    return this.request(`/patients/${id}`)
  }

  async createPatient(data: PatientRequest): Promise<PatientResponse> {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePatient(id: number, data: PatientRequest): Promise<PatientResponse> {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePatient(id: number): Promise<void> {
    return this.request(`/patients/${id}`, { method: 'DELETE' })
  }

  async searchPatientsByCondition(condition: string): Promise<PatientResponse[]> {
    return this.request(`/patients/search?condition=${encodeURIComponent(condition)}`)
  }

  // ==================== Doctors ====================
  async getDoctors(): Promise<DoctorResponse[]> {
    return this.request('/doctors')
  }

  async getDoctorById(id: number): Promise<DoctorResponse> {
    return this.request(`/doctors/${id}`)
  }

  // ==================== Users ====================
  async getUsers(): Promise<UserResponse[]> {
    return this.request('/users')
  }

  async getUsersByRole(role: string): Promise<UserResponse[]> {
    return this.request(`/users/role/${role}`)
  }

  async getUserById(id: number): Promise<UserResponse> {
    return this.request(`/users/${id}`)
  }

  // ==================== Appointments ====================
  async getAppointments(): Promise<AppointmentResponse[]> {
    return this.request('/appointments')
  }

  async getMyAppointments(): Promise<AppointmentResponse[]> {
    return this.request('/appointments/my-appointments')
  }

  async getAppointmentById(id: number): Promise<AppointmentResponse> {
    return this.request(`/appointments/${id}`)
  }

  async getAppointmentsByPatient(patientId: number): Promise<AppointmentResponse[]> {
    return this.request(`/appointments/patient/${patientId}`)
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<AppointmentResponse[]> {
    return this.request(`/appointments/doctor/${doctorId}`)
  }

  async createAppointment(data: AppointmentRequest): Promise<AppointmentResponse> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateAppointment(id: number, data: AppointmentRequest): Promise<AppointmentResponse> {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<AppointmentResponse> {
    return this.request(`/appointments/${id}/status?status=${status}`, {
      method: 'PATCH'
    })
  }

  async deleteAppointment(id: number): Promise<void> {
    return this.request(`/appointments/${id}`, { method: 'DELETE' })
  }

  async getMedicalNoteByAppointment(appointmentId: number): Promise<MedicalNoteResponse> {
    return this.request(`/appointments/${appointmentId}/medical-note`)
  }

  // ==================== Clinical History ====================
  async getClinicalHistory(patientId: number): Promise<ClinicalHistoryResponse> {
    return this.request(`/patients/${patientId}/clinical-history`)
  }

  async updateClinicalHistory(patientId: number, data: ClinicalHistoryRequest): Promise<ClinicalHistoryResponse> {
    return this.request(`/patients/${patientId}/clinical-history`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ==================== Allergies ====================
  async getAllergies(patientId: number): Promise<AllergyResponse[]> {
    return this.request(`/patients/${patientId}/allergies`)
  }

  async getAllergiesBySeverity(patientId: number, severity: AllergySeverity): Promise<AllergyResponse[]> {
    return this.request(`/patients/${patientId}/allergies/severity/${severity}`)
  }

  async addAllergy(patientId: number, data: AllergyRequest): Promise<AllergyResponse> {
    return this.request(`/patients/${patientId}/allergies`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateAllergy(patientId: number, allergyId: number, data: AllergyRequest): Promise<AllergyResponse> {
    return this.request(`/patients/${patientId}/allergies/${allergyId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteAllergy(patientId: number, allergyId: number): Promise<void> {
    return this.request(`/patients/${patientId}/allergies/${allergyId}`, { method: 'DELETE' })
  }

  // ==================== Chronic Diseases ====================
  async getChronicDiseases(patientId: number): Promise<ChronicDiseaseResponse[]> {
    return this.request(`/patients/${patientId}/chronic-diseases`)
  }

  async getChronicDiseasesByStatus(patientId: number, status: DiseaseStatus): Promise<ChronicDiseaseResponse[]> {
    return this.request(`/patients/${patientId}/chronic-diseases/status/${status}`)
  }

  async addChronicDisease(patientId: number, data: ChronicDiseaseRequest): Promise<ChronicDiseaseResponse> {
    return this.request(`/patients/${patientId}/chronic-diseases`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateChronicDisease(patientId: number, diseaseId: number, data: ChronicDiseaseRequest): Promise<ChronicDiseaseResponse> {
    return this.request(`/patients/${patientId}/chronic-diseases/${diseaseId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async updateDiseaseStatus(patientId: number, diseaseId: number, status: DiseaseStatus): Promise<ChronicDiseaseResponse> {
    return this.request(`/patients/${patientId}/chronic-diseases/${diseaseId}/status?status=${status}`, {
      method: 'PUT'
    })
  }

  async deleteChronicDisease(patientId: number, diseaseId: number): Promise<void> {
    return this.request(`/patients/${patientId}/chronic-diseases/${diseaseId}`, { method: 'DELETE' })
  }

  // ==================== Clinical Evolutions ====================
  async getEvolutions(patientId: number): Promise<ClinicalEvolutionResponse[]> {
    return this.request(`/patients/${patientId}/evolutions`)
  }

  async getEvolutionById(patientId: number, evolutionId: number): Promise<ClinicalEvolutionResponse> {
    return this.request(`/patients/${patientId}/evolutions/${evolutionId}`)
  }

  async addEvolution(patientId: number, data: ClinicalEvolutionRequest): Promise<ClinicalEvolutionResponse> {
    return this.request(`/patients/${patientId}/evolutions`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateEvolution(patientId: number, evolutionId: number, data: ClinicalEvolutionRequest): Promise<ClinicalEvolutionResponse> {
    return this.request(`/patients/${patientId}/evolutions/${evolutionId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ==================== Medical Notes ====================
  async createMedicalNote(data: MedicalNoteRequest): Promise<MedicalNoteResponse> {
    return this.request('/medical-notes', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getMedicalNoteById(id: number): Promise<MedicalNoteResponse> {
    return this.request(`/medical-notes/${id}`)
  }

  async updateMedicalNote(id: number, data: MedicalNoteUpdateRequest): Promise<MedicalNoteResponse> {
    return this.request(`/medical-notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getMedicalNoteVersions(id: number): Promise<MedicalNoteVersionResponse[]> {
    return this.request(`/medical-notes/${id}/versions`)
  }

  async getMedicalNotesByPatient(patientId: number): Promise<MedicalNoteResponse[]> {
    return this.request(`/patients/${patientId}/medical-notes`)
  }

  // ==================== Prescriptions ====================
  async createPrescription(data: PrescriptionRequest): Promise<PrescriptionResponse> {
    return this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getPrescriptionById(id: number): Promise<PrescriptionResponse> {
    return this.request(`/prescriptions/${id}`)
  }

  async updatePrescriptionStatus(id: number, data: PrescriptionStatusUpdateRequest): Promise<PrescriptionResponse> {
    return this.request(`/prescriptions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getPrescriptionForPrint(id: number): Promise<PrescriptionPrintResponse> {
    return this.request(`/prescriptions/${id}/print`)
  }

  async getPrescriptionsByPatient(patientId: number, status?: PrescriptionStatus): Promise<PrescriptionResponse[]> {
    const url = status
      ? `/patients/${patientId}/prescriptions?status=${status}`
      : `/patients/${patientId}/prescriptions`
    return this.request(url)
  }

  // ==================== Lab Exams ====================
  async createLabExam(data: LabExamRequest): Promise<LabExamResponse> {
    return this.request('/lab-exams', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getLabExamById(id: number): Promise<LabExamResponse> {
    return this.request(`/lab-exams/${id}`)
  }

  async uploadLabResults(id: number, data: LabResultsUploadRequest): Promise<LabExamResponse> {
    return this.request(`/lab-exams/${id}/results`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async updateLabExamStatus(id: number, status: ExamStatus): Promise<LabExamResponse> {
    return this.request(`/lab-exams/${id}/status?status=${status}`, {
      method: 'PUT'
    })
  }

  async getLabExamsByPatient(patientId: number): Promise<LabExamResponse[]> {
    return this.request(`/lab-exams/patient/${patientId}`)
  }

  async getPendingLabResultsForDoctor(doctorId: number): Promise<LabExamResponse[]> {
    return this.request(`/lab-exams/doctor/${doctorId}/pending`)
  }

  async getLabExamsByAppointment(appointmentId: number): Promise<LabExamResponse[]> {
    return this.request(`/lab-exams/appointment/${appointmentId}`)
  }

  // ==================== Vital Signs ====================
  async recordVitalSigns(data: VitalSignsRequest): Promise<VitalSignsResponse> {
    return this.request('/vital-signs', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getVitalSignsById(id: number): Promise<VitalSignsResponse> {
    return this.request(`/vital-signs/${id}`)
  }

  async getVitalSignsByPatient(patientId: number): Promise<VitalSignsResponse[]> {
    return this.request(`/patients/${patientId}/vital-signs`)
  }

  async getLatestVitalSigns(patientId: number): Promise<VitalSignsResponse> {
    return this.request(`/patients/${patientId}/vital-signs/latest`)
  }

  // ==================== Nursing Observations ====================
  async createNursingObservation(data: NursingObservationRequest): Promise<NursingObservationResponse> {
    return this.request('/nursing-observations', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getNursingObservationById(id: number): Promise<NursingObservationResponse> {
    return this.request(`/nursing-observations/${id}`)
  }

  async getNursingObservationsByPatient(patientId: number, type?: ObservationType): Promise<NursingObservationResponse[]> {
    const url = type
      ? `/patients/${patientId}/nursing-observations?type=${type}`
      : `/patients/${patientId}/nursing-observations`
    return this.request(url)
  }


  // ==================== Clinical Files ====================
  async uploadClinicalFile(patientId: number, file: File, fileType: FileType): Promise<ClinicalFileResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patientId', patientId.toString())
    formData.append('fileType', fileType)
    return this.uploadFile('/clinical-files/upload', formData)
  }

  async getClinicalFileById(id: number): Promise<ClinicalFileResponse> {
    return this.request(`/clinical-files/${id}`)
  }

  async downloadClinicalFile(id: number): Promise<Blob> {
    return this.requestBlob(`/clinical-files/${id}/download`)
  }

  async getClinicalFilesByPatient(patientId: number): Promise<ClinicalFileResponse[]> {
    return this.request(`/clinical-files/patient/${patientId}`)
  }

  async getClinicalFilesByPatientAndType(patientId: number, fileType: FileType): Promise<ClinicalFileResponse[]> {
    return this.request(`/clinical-files/patient/${patientId}/type/${fileType}`)
  }

  async searchClinicalFiles(params: ClinicalFileSearchParams): Promise<ClinicalFileResponse[]> {
    const queryParams = new URLSearchParams()
    if (params.patientId) queryParams.append('patientId', params.patientId.toString())
    if (params.fileType) queryParams.append('fileType', params.fileType)
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    return this.request(`/clinical-files/search?${queryParams.toString()}`)
  }

  async deleteClinicalFile(id: number): Promise<void> {
    return this.request(`/clinical-files/${id}`, { method: 'DELETE' })
  }

  async getClinicalFileAccessLogs(id: number): Promise<FileAccessLogResponse[]> {
    return this.request(`/clinical-files/${id}/access-logs`)
  }

  // ==================== Hospitalizations ====================
  async admitPatient(data: HospitalizationRequest): Promise<HospitalizationResponse> {
    return this.request('/hospitalizations', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getHospitalizationById(id: number): Promise<HospitalizationResponse> {
    return this.request(`/hospitalizations/${id}`)
  }

  async getActiveHospitalizations(): Promise<HospitalizationResponse[]> {
    return this.request('/hospitalizations/active')
  }

  async assignBed(hospitalizationId: number, data: BedAssignmentRequest): Promise<HospitalizationResponse> {
    return this.request(`/hospitalizations/${hospitalizationId}/assign-bed`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async transferPatient(hospitalizationId: number, data: BedTransferRequest): Promise<HospitalizationResponse> {
    return this.request(`/hospitalizations/${hospitalizationId}/transfer`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async dischargePatient(hospitalizationId: number, data: DischargeRequest): Promise<HospitalizationResponse> {
    return this.request(`/hospitalizations/${hospitalizationId}/discharge`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getPatientHospitalizations(patientId: number): Promise<HospitalizationResponse[]> {
    return this.request(`/patients/${patientId}/hospitalizations`)
  }

  async getTransferHistory(hospitalizationId: number): Promise<BedTransferResponse[]> {
    return this.request(`/hospitalizations/${hospitalizationId}/transfers`)
  }

  // ==================== Beds ====================
  async createBed(data: BedRequest): Promise<BedResponse> {
    return this.request('/beds', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getAllBeds(): Promise<BedResponse[]> {
    return this.request('/beds')
  }

  async getAvailableBeds(): Promise<BedResponse[]> {
    return this.request('/beds/available')
  }

  async getBedById(id: number): Promise<BedResponse> {
    return this.request(`/beds/${id}`)
  }

  async getBedsByArea(area: string): Promise<BedResponse[]> {
    return this.request(`/beds/area/${encodeURIComponent(area)}`)
  }

  async getBedsByStatus(status: BedStatus): Promise<BedResponse[]> {
    return this.request(`/beds/status/${status}`)
  }

  async updateBed(id: number, data: BedRequest): Promise<BedResponse> {
    return this.request(`/beds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async updateBedStatus(id: number, status: BedStatus): Promise<BedResponse> {
    return this.request(`/beds/${id}/status?status=${status}`, {
      method: 'PUT'
    })
  }

  async deleteBed(id: number): Promise<void> {
    return this.request(`/beds/${id}`, { method: 'DELETE' })
  }

  // ==================== Triage ====================
  async createTriage(data: TriageRequest): Promise<TriageResponse> {
    return this.request('/triage', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getTriageById(id: number): Promise<TriageResponse> {
    return this.request(`/triage/${id}`)
  }

  async assignTriagePriority(id: number, data: TriagePriorityRequest): Promise<TriageResponse> {
    return this.request(`/triage/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async markTriageAsAttended(id: number): Promise<TriageResponse> {
    return this.request(`/triage/${id}/attend`, { method: 'PUT' })
  }

  async markTriageAsInProgress(id: number): Promise<TriageResponse> {
    return this.request(`/triage/${id}/in-progress`, { method: 'PUT' })
  }

  async markTriageAsLeft(id: number): Promise<TriageResponse> {
    return this.request(`/triage/${id}/left`, { method: 'PUT' })
  }

  async getTriageWaitingList(): Promise<TriageResponse[]> {
    return this.request('/triage/waiting-list')
  }

  async getTriageByStatus(status: TriageStatus): Promise<TriageResponse[]> {
    return this.request(`/triage/status/${status}`)
  }

  async getTriageByPatient(patientId: number): Promise<TriageResponse[]> {
    return this.request(`/triage/patient/${patientId}`)
  }

  // ==================== Referrals ====================
  async createReferral(data: ReferralRequest): Promise<ReferralResponse> {
    return this.request('/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getReferralById(id: number): Promise<ReferralResponse> {
    return this.request(`/referrals/${id}`)
  }

  async acceptReferral(id: number): Promise<ReferralResponse> {
    return this.request(`/referrals/${id}/accept`, { method: 'PUT' })
  }

  async completeReferral(id: number, appointmentId?: number): Promise<ReferralResponse> {
    const url = appointmentId
      ? `/referrals/${id}/complete?appointmentId=${appointmentId}`
      : `/referrals/${id}/complete`
    return this.request(url, { method: 'PUT' })
  }

  async cancelReferral(id: number): Promise<ReferralResponse> {
    return this.request(`/referrals/${id}/cancel`, { method: 'PUT' })
  }

  async updateReferralStatus(id: number, data: ReferralStatusUpdateRequest): Promise<ReferralResponse> {
    return this.request(`/referrals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getReferralsByPatient(patientId: number): Promise<ReferralResponse[]> {
    return this.request(`/referrals/patient/${patientId}`)
  }

  async getPendingReferralsForDoctor(doctorId: number): Promise<ReferralResponse[]> {
    return this.request(`/referrals/doctor/${doctorId}/pending`)
  }

  async getReferralsByReferringDoctor(doctorId: number): Promise<ReferralResponse[]> {
    return this.request(`/referrals/doctor/${doctorId}/created`)
  }

  // ==================== Reports ====================
  async getProductivityReport(startDate: string, endDate: string, doctorId?: number): Promise<ProductivityReportDTO> {
    const params = new URLSearchParams({ startDate, endDate })
    if (doctorId) params.append('doctorId', doctorId.toString())
    return this.request(`/reports/productivity?${params.toString()}`)
  }

  async getAttendanceReport(startDate: string, endDate: string, doctorId?: number, specialty?: string): Promise<AttendanceReportDTO> {
    const params = new URLSearchParams({ startDate, endDate })
    if (doctorId) params.append('doctorId', doctorId.toString())
    if (specialty) params.append('specialty', specialty)
    return this.request(`/reports/attendance?${params.toString()}`)
  }

  async getFrequentPatientsReport(startDate: string, endDate: string, visitThreshold?: number): Promise<FrequentPatientsDTO> {
    const params = new URLSearchParams({ startDate, endDate })
    if (visitThreshold) params.append('visitThreshold', visitThreshold.toString())
    return this.request(`/reports/frequent-patients?${params.toString()}`)
  }

  async getClinicalStatistics(startDate: string, endDate: string): Promise<ClinicalStatisticsDTO> {
    return this.request(`/reports/clinical-statistics?startDate=${startDate}&endDate=${endDate}`)
  }

  async exportProductivityReportToPdf(startDate: string, endDate: string, doctorId?: number): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate })
    if (doctorId) params.append('doctorId', doctorId.toString())
    return this.requestBlob(`/reports/productivity/export/pdf?${params.toString()}`)
  }

  async exportProductivityReportToExcel(startDate: string, endDate: string, doctorId?: number): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate })
    if (doctorId) params.append('doctorId', doctorId.toString())
    return this.requestBlob(`/reports/productivity/export/excel?${params.toString()}`)
  }

  async exportAttendanceReportToPdf(startDate: string, endDate: string, doctorId?: number, specialty?: string): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate })
    if (doctorId) params.append('doctorId', doctorId.toString())
    if (specialty) params.append('specialty', specialty)
    return this.requestBlob(`/reports/attendance/export/pdf?${params.toString()}`)
  }

  async exportAttendanceReportToExcel(startDate: string, endDate: string, doctorId?: number, specialty?: string): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate })
    if (doctorId) params.append('doctorId', doctorId.toString())
    if (specialty) params.append('specialty', specialty)
    return this.requestBlob(`/reports/attendance/export/excel?${params.toString()}`)
  }

  async exportFrequentPatientsReportToPdf(startDate: string, endDate: string, visitThreshold?: number): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate })
    if (visitThreshold) params.append('visitThreshold', visitThreshold.toString())
    return this.requestBlob(`/reports/frequent-patients/export/pdf?${params.toString()}`)
  }

  async exportFrequentPatientsReportToExcel(startDate: string, endDate: string, visitThreshold?: number): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate })
    if (visitThreshold) params.append('visitThreshold', visitThreshold.toString())
    return this.requestBlob(`/reports/frequent-patients/export/excel?${params.toString()}`)
  }

  async exportClinicalStatisticsToPdf(startDate: string, endDate: string): Promise<Blob> {
    return this.requestBlob(`/reports/clinical-statistics/export/pdf?startDate=${startDate}&endDate=${endDate}`)
  }

  async exportClinicalStatisticsToExcel(startDate: string, endDate: string): Promise<Blob> {
    return this.requestBlob(`/reports/clinical-statistics/export/excel?startDate=${startDate}&endDate=${endDate}`)
  }

  // ==================== RENIEC - Consulta DNI ====================
  async consultarDni(dni: string): Promise<DatosPersonaDni> {
    const RENIEC_URL = 'https://api.codart.cgrt.net/api/v1/consultas/reniec/dni'
    const RENIEC_TOKEN = 'tikbkBZTVVVg3irM8a5eQugzPDvocB0l1jzhF268BuyDZivsFBOxvyp5NQZv'

    const response = await fetch(`${RENIEC_URL}/${dni}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RENIEC_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error('No se pudo consultar el DNI')
    }

    const data: ReniecResponse = await response.json()
    return {
      nombres: data.result.first_name,
      apellidoPaterno: data.result.first_last_name,
      apellidoMaterno: data.result.second_last_name,
      dni: data.result.document_number
    }
  }

  // ==================== Module Permissions ====================
  async getAllPermissions(): Promise<ModulePermissionResponse[]> {
    return this.request('/permissions')
  }

  async getMyPermissions(): Promise<ModulePermissionResponse[]> {
    return this.request('/permissions/my-permissions')
  }

  async getPermissionsByRole(role: string): Promise<ModulePermissionResponse[]> {
    return this.request(`/permissions/role/${role}`)
  }

  async getPermissionsByUsername(username: string): Promise<ModulePermissionResponse[]> {
    return this.request(`/permissions/user/${username}`)
  }

  async createOrUpdatePermission(data: ModulePermissionRequest): Promise<ModulePermissionResponse> {
    return this.request('/permissions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async deletePermission(id: number): Promise<void> {
    return this.request(`/permissions/${id}`, { method: 'DELETE' })
  }

  async deletePermissionByRoleAndModule(role: string, moduleId: string): Promise<void> {
    return this.request(`/permissions/role/${role}/module/${moduleId}`, { method: 'DELETE' })
  }

  async deletePermissionByUsernameAndModule(username: string, moduleId: string): Promise<void> {
    return this.request(`/permissions/user/${username}/module/${moduleId}`, { method: 'DELETE' })
  }
}


// ==================== Types ====================

// RENIEC Types
interface ReniecResponse {
  success: boolean
  source: string
  result: {
    first_name: string
    first_last_name: string
    second_last_name: string
    full_name: string
    tipo_documento: string
    document_number: string
  }
}

export interface DatosPersonaDni {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  dni: string
}

// Auth Types
export interface RegisterRequest {
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST'

// Patient Types
export interface PatientRequest {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  contactNumber: string
  address: string
}

export interface PatientResponse {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  contactNumber: string
  address: string
}

// Doctor Types
export interface DoctorResponse {
  id: number
  user: {
    id: number
    username: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
  }
  specialization: string
  licenseNumber: string
}

// Appointment Types
export interface AppointmentRequest {
  patientId: number
  doctorId: number
  appointmentTime: string
  reason: string
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface AppointmentResponse {
  id: number
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  appointmentTime: string
  status: AppointmentStatus
  reason: string
}

// Clinical History Types
export interface ClinicalHistoryRequest {
  antecedentes?: string
  observaciones?: string
}

export interface ClinicalHistoryResponse {
  id: number
  patientId: number
  patientName: string
  antecedentes: string
  observaciones: string
  allergies: AllergyResponse[]
  chronicDiseases: ChronicDiseaseResponse[]
  evolutions: ClinicalEvolutionResponse[]
  createdAt: string
  updatedAt: string
}

// Allergy Types
export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE'

export interface AllergyRequest {
  allergyName: string
  severity: AllergySeverity
  notes?: string
}

export interface AllergyResponse {
  id: number
  patientId: number
  allergyName: string
  severity: AllergySeverity
  notes: string
  createdAt: string
}

// Chronic Disease Types
export type DiseaseStatus = 'ACTIVE' | 'CONTROLLED' | 'RESOLVED'

export interface ChronicDiseaseRequest {
  diseaseName: string
  diagnosisDate: string
  status: DiseaseStatus
  notes?: string
}

export interface ChronicDiseaseResponse {
  id: number
  patientId: number
  diseaseName: string
  diagnosisDate: string
  status: DiseaseStatus
  notes: string
  createdAt: string
}

// Clinical Evolution Types
export interface ClinicalEvolutionRequest {
  appointmentId?: number
  doctorId: number
  evolutionNotes: string
}

export interface ClinicalEvolutionResponse {
  id: number
  patientId: number
  appointmentId: number | null
  doctorId: number
  doctorName: string
  evolutionNotes: string
  createdAt: string
}

// Medical Note Types
export interface MedicalNoteRequest {
  patientId: number
  appointmentId?: number
  doctorId: number
  diagnosis: string
  treatmentPlan: string
  followUpDate?: string
  followUpInstructions?: string
}

export interface MedicalNoteUpdateRequest {
  diagnosis: string
  treatmentPlan: string
  followUpDate?: string
  followUpInstructions?: string
}

export interface MedicalNoteResponse {
  id: number
  patientId: number
  patientName: string
  appointmentId: number | null
  doctorId: number
  doctorName: string
  diagnosis: string
  treatmentPlan: string
  followUpDate: string | null
  followUpInstructions: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export interface MedicalNoteVersionResponse {
  id: number
  medicalNoteId: number
  diagnosis: string
  treatmentPlan: string
  modifiedBy: number
  modifiedByName: string
  modifiedAt: string
}

// Prescription Types
export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface PrescriptionItemRequest {
  medicationName: string
  dose: string
  frequency: string
  duration: string
  instructions?: string
}

export interface PrescriptionRequest {
  patientId: number
  doctorId: number
  appointmentId?: number
  notes?: string
  items: PrescriptionItemRequest[]
}

export interface PrescriptionStatusUpdateRequest {
  status: PrescriptionStatus
}

export interface PrescriptionItemResponse {
  id: number
  medicationName: string
  dose: string
  frequency: string
  duration: string
  instructions: string
}

export interface PrescriptionResponse {
  id: number
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  appointmentId: number | null
  status: PrescriptionStatus
  notes: string
  items: PrescriptionItemResponse[]
  createdAt: string
}

export interface PrescriptionPrintResponse {
  prescriptionId: number
  patientName: string
  patientDateOfBirth: string
  doctorName: string
  doctorSpecialization: string
  doctorLicenseNumber: string
  prescriptionDate: string
  notes: string
  items: PrescriptionItemResponse[]
}

// Lab Exam Types
export type ExamPriority = 'ROUTINE' | 'URGENT' | 'STAT'
export type ExamStatus = 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface LabExamRequest {
  patientId: number
  requestingDoctorId: number
  appointmentId?: number
  examType: string
  priority: ExamPriority
  clinicalIndication?: string
}

export interface LabResultRequest {
  resultValue: string
  referenceRange: string
  isAbnormal: boolean
  notes?: string
}

export interface LabResultsUploadRequest {
  results: LabResultRequest[]
}

export interface LabResultResponse {
  id: number
  labExamId: number
  resultValue: string
  referenceRange: string
  isAbnormal: boolean
  notes: string
  uploadedBy: number
  uploadedByName: string
  uploadedAt: string
}

export interface LabExamResponse {
  id: number
  patientId: number
  patientName: string
  requestingDoctorId: number
  requestingDoctorName: string
  appointmentId: number | null
  examType: string
  priority: ExamPriority
  clinicalIndication: string
  status: ExamStatus
  requestedAt: string
  completedAt: string | null
  results: LabResultResponse[]
}

// Vital Signs Types
export interface VitalSignsRequest {
  patientId: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  temperature: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  weight?: number
}

export interface VitalSignsResponse {
  id: number
  patientId: number
  patientName: string
  nurseId: number
  nurseName: string
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  temperature: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  weight: number | null
  recordedAt: string
}

// Nursing Observation Types
export type ObservationType = 'TREATMENT' | 'GENERAL' | 'ALERT'

export interface NursingObservationRequest {
  patientId: number
  observationType: ObservationType
  notes: string
}

export interface NursingObservationResponse {
  id: number
  patientId: number
  patientName: string
  nurseId: number
  nurseName: string
  observationType: ObservationType
  notes: string
  createdAt: string
}


// Clinical File Types
export type FileType = 'RADIOGRAFIA' | 'CONSENTIMIENTO' | 'LABORATORIO' | 'OTRO'
export type AccessAction = 'VIEW' | 'DOWNLOAD'

export interface ClinicalFileSearchParams {
  patientId?: number
  fileType?: FileType
  startDate?: string
  endDate?: string
}

export interface ClinicalFileResponse {
  id: number
  patientId: number
  patientName: string
  fileName: string
  fileType: FileType
  mimeType: string
  fileSize: number
  uploadedBy: number
  uploadedByName: string
  uploadedAt: string
}

export interface FileAccessLogResponse {
  id: number
  clinicalFileId: number
  userId: number
  userName: string
  action: AccessAction
  accessedAt: string
  ipAddress: string
}

// Hospitalization Types
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
export type HospitalizationStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED'
export type DischargeType = 'MEDICAL' | 'VOLUNTARY' | 'TRANSFER' | 'DECEASED'

export interface BedRequest {
  bedNumber: string
  area: string
  status?: BedStatus
}

export interface BedResponse {
  id: number
  bedNumber: string
  area: string
  status: BedStatus
  currentHospitalizationId: number | null
}

export interface HospitalizationRequest {
  patientId: number
  admittingDoctorId: number
  admissionReason: string
  bedId?: number
}

export interface BedAssignmentRequest {
  bedId: number
}

export interface BedTransferRequest {
  toBedId: number
  reason: string
}

export interface DischargeRequest {
  dischargeType: DischargeType
  dischargeNotes?: string
}

export interface HospitalizationResponse {
  id: number
  patientId: number
  patientName: string
  admittingDoctorId: number
  admittingDoctorName: string
  bedId: number | null
  bedNumber: string | null
  bedArea: string | null
  admissionDate: string
  dischargeDate: string | null
  admissionReason: string
  dischargeType: DischargeType | null
  status: HospitalizationStatus
}

export interface BedTransferResponse {
  id: number
  hospitalizationId: number
  fromBedId: number
  fromBedNumber: string
  toBedId: number
  toBedNumber: string
  transferredAt: string
  reason: string
}

// Triage Types
export type TriagePriority = 'RESUSCITATION' | 'EMERGENT' | 'URGENT' | 'LESS_URGENT' | 'NON_URGENT'
export type TriageStatus = 'WAITING' | 'IN_PROGRESS' | 'ATTENDED' | 'LEFT'

export interface TriageRequest {
  patientId: number
  chiefComplaint: string
  initialAssessment?: string
  vitalSignsId?: number
}

export interface TriagePriorityRequest {
  priorityLevel: TriagePriority
  recommendedDestination?: string
}

export interface TriageResponse {
  id: number
  patientId: number
  patientName: string
  nurseId: number
  nurseName: string
  chiefComplaint: string
  initialAssessment: string
  priorityLevel: TriagePriority | null
  recommendedDestination: string | null
  vitalSignsId: number | null
  status: TriageStatus
  arrivedAt: string
  triagedAt: string | null
  attendedAt: string | null
}

// Referral Types
export type ReferralUrgency = 'ROUTINE' | 'PRIORITY' | 'URGENT'
export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED'

export interface ReferralRequest {
  patientId: number
  referringDoctorId: number
  destinationDoctorId?: number
  destinationSpecialty?: string
  externalService?: string
  reason: string
  urgency: ReferralUrgency
}

export interface ReferralStatusUpdateRequest {
  status: ReferralStatus
  resultingAppointmentId?: number
}

export interface ReferralResponse {
  id: number
  patientId: number
  patientName: string
  referringDoctorId: number
  referringDoctorName: string
  destinationDoctorId: number | null
  destinationDoctorName: string | null
  destinationSpecialty: string | null
  externalService: string | null
  reason: string
  urgency: ReferralUrgency
  status: ReferralStatus
  resultingAppointmentId: number | null
  createdAt: string
  completedAt: string | null
}

// Report Types
export interface DoctorProductivity {
  doctorId: number
  doctorName: string
  specialization: string
  totalConsultations: number
  completedConsultations: number
  cancelledConsultations: number
  uniquePatients: number
  prescriptionsIssued: number
  labExamsRequested: number
  referralsMade: number
}

export interface ProductivityReportDTO {
  startDate: string
  endDate: string
  totalDoctors: number
  totalConsultations: number
  averageConsultationsPerDoctor: number
  doctorProductivity: DoctorProductivity[]
}

export interface DailyAttendance {
  date: string
  totalVisits: number
  completedVisits: number
  cancelledVisits: number
  noShowVisits: number
}

export interface AttendanceReportDTO {
  startDate: string
  endDate: string
  totalVisits: number
  completedVisits: number
  cancelledVisits: number
  noShowVisits: number
  completionRate: number
  dailyAttendance: DailyAttendance[]
}

export interface FrequentPatient {
  patientId: number
  patientName: string
  visitCount: number
  lastVisitDate: string
  primaryDoctor: string
}

export interface FrequentPatientsDTO {
  startDate: string
  endDate: string
  visitThreshold: number
  totalFrequentPatients: number
  frequentPatients: FrequentPatient[]
}

export interface DiagnosisCount {
  diagnosis: string
  count: number
  percentage: number
}

export interface ClinicalStatisticsDTO {
  startDate: string
  endDate: string
  totalMedicalNotes: number
  totalPrescriptions: number
  totalLabExams: number
  completedLabExams: number
  totalHospitalizations: number
  activeHospitalizations: number
  totalTriages: number
  averageTriageWaitTime: number
  topDiagnoses: DiagnosisCount[]
}

// Module Permission Types
export type PermissionType = 'ADDED' | 'REMOVED'

export interface ModulePermissionRequest {
  role: string
  username?: string
  moduleId: string
  permissionType: PermissionType
}

export interface ModulePermissionResponse {
  id: number
  role: string
  username: string | null
  moduleId: string
  permissionType: PermissionType
}

// User Types
export interface UserResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export const api = new ApiService()
export default api
