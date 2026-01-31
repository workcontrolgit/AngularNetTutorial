import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Position } from '../../models';
import { PositionService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-position-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './position-detail.component.html',
  styleUrl: './position-detail.component.scss',
})
export class PositionDetailComponent implements OnInit {
  private positionService = inject(PositionService);
  private authService = inject(OidcAuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  position!: Position;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPosition(id);
    }
  }

  loadPosition(id: string): void {
    this.loading = true;

    this.positionService.getById(id).subscribe({
      next: (position: Position) => {
        this.position = position;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading position:', error);
        this.showMessage('Error loading position');
        this.loading = false;
        this.router.navigate(['/positions']);
      },
    });
  }

  editPosition(): void {
    this.router.navigate(['/positions', 'edit', this.position.id]);
  }

  deletePosition(): void {
    if (confirm(`Are you sure you want to delete "${this.position.positionTitle}"?`)) {
      this.positionService.delete(this.position.id).subscribe({
        next: () => {
          this.showMessage('Position deleted successfully');
          this.router.navigate(['/positions']);
        },
        error: error => {
          console.error('Error deleting position:', error);
          this.showMessage('Error deleting position');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/positions']);
  }

  canEdit(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  canDelete(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
