import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
            { path: 'patients', loadComponent: () => import('./features/patients/patient-list/patient-list.component').then(m => m.PatientListComponent), canActivate: [authGuard] },
            { path: 'patients/new', loadComponent: () => import('./features/patients/patient-form/patient-form.component').then(m => m.PatientFormComponent), canActivate: [authGuard] },
            { path: 'patients/:id', loadComponent: () => import('./features/patients/patient-form/patient-form.component').then(m => m.PatientFormComponent), canActivate: [authGuard] },
            { path: 'appointments', loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent), canActivate: [authGuard] },
            { path: 'appointments/new', loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent), canActivate: [authGuard] },
            { path: 'appointments/:id', loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent), canActivate: [authGuard] },
            // Add other routes here
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
