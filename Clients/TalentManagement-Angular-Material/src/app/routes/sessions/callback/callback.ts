import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OidcAuthService } from '../../../core/authentication/oidc-auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <h2>Processing login...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  `,
  styles: `
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
  `,
})
export class CallbackComponent implements OnInit {
  private authService = inject(OidcAuthService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      // Initialize auth will process the callback
      const isAuthenticated = await this.authService.initAuth();

      if (isAuthenticated) {
        // Redirect to dashboard or original URL
        this.router.navigate(['/dashboard']);
      } else {
        // Authentication failed, redirect to login
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error processing callback:', error);
      this.router.navigate(['/login']);
    }
  }
}
