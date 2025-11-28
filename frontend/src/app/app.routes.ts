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
            // Add other routes here
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
