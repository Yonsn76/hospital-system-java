import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Patients', icon: 'people', route: '/patients' },
    { label: 'Appointments', icon: 'calendar_today', route: '/appointments' },
    { label: 'Medical Records', icon: 'description', route: '/medical-records' },
    { label: 'Resources', icon: 'local_hospital', route: '/resources' }
  ];
}
