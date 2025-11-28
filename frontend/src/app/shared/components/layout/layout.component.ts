import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MatSidenavModule, HeaderComponent, SidebarComponent, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
