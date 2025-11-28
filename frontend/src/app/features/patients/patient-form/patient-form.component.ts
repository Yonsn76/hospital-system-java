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
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-form',
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
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss'
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isEditMode = false;
  patientId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      contactNumber: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.patientId = +params['id'];
        this.loadPatient(this.patientId);
      }
    });
  }

  loadPatient(id: number) {
    this.patientService.getPatient(id).subscribe({
      next: (patient: any) => {
        this.patientForm.patchValue(patient);
      },
      error: (err: any) => {
        console.error('Error loading patient', err);
      }
    });
  }

  onSubmit() {
    if (this.patientForm.valid) {
      if (this.isEditMode && this.patientId) {
        this.patientService.updatePatient(this.patientId, this.patientForm.value).subscribe({
          next: () => {
            this.router.navigate(['/patients']);
          },
          error: (err: any) => {
            console.error('Error updating patient', err);
          }
        });
      } else {
        this.patientService.createPatient(this.patientForm.value).subscribe({
          next: () => {
            this.router.navigate(['/patients']);
          },
          error: (err: any) => {
            console.error('Error creating patient', err);
          }
        });
      }
    }
  }
}
