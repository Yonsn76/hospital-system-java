export interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    appointmentTime: string;
    status: string;
    reason: string;
}

export interface AppointmentRequest {
    patientId: number;
    doctorId: number;
    appointmentTime: string;
    status: string;
    reason: string;
}
