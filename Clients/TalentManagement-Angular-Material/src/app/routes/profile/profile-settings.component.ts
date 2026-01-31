import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeader } from '@shared';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
  imports: [CommonModule, MatCardModule, MatIconModule, PageHeader],
})
export class ProfileSettingsComponent {
  // Future: User settings functionality
}
