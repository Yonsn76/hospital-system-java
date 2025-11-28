import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss'
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  isEditMode = false;
  appointmentId: number | null = null;
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      status: ['SCHEDULED', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.appointmentId = +params['id'];
        this.loadAppointment(this.appointmentId);
      }
    });
  }

  loadPatients() {
    this.patientService.getPatients().subscribe({
      next: (data: Patient[]) => this.patients = data,
      error: (err: any) => console.error('Error loading patients', err)
    });
  }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (data: Doctor[]) => this.doctors = data,
      error: (err: any) => console.error('Error loading doctors', err)
    });
  }

  loadAppointment(id: number) {
    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment: any) => {
        this.appointmentForm.patchValue({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentTime: appointment.appointmentTime,
          status: appointment.status,
          reason: appointment.reason
        });
      },
      error: (err: any) => console.error('Error loading appointment', err)
    });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      if (this.isEditMode && this.appointmentId) {
        this.appointmentService.updateAppointment(this.appointmentId, this.appointmentForm.value).subscribe({
          next: () => this.router.navigate(['/appointments']),
          error: (err: any) => console.error('Error updating appointment', err)
        });
      } else {
        this.appointmentService.createAppointment(this.appointmentForm.value).subscribe({
          next: () => this.router.navigate(['/appointments']),
          error: (err: any) => console.error('Error creating appointment', err)
        });
      }
    }
  }
}
