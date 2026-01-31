import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { tap } from 'rxjs';
import { Menu, MenuService } from './menu.service';
import { OidcAuthService } from '../authentication/oidc-auth.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private readonly http = inject(HttpClient);
  private readonly oidcAuth = inject(OidcAuthService);
  private readonly menuService = inject(MenuService);
  private readonly permissonsService = inject(NgxPermissionsService);
  private readonly rolesService = inject(NgxRolesService);

  constructor() {
    // Subscribe to authentication changes to refresh permissions
    this.oidcAuth.permissionsChange$.subscribe(() => {
      console.log('StartupService: Permission change event received, refreshing permissions');
      this.setPermissions();
    });
  }

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  load() {
    return new Promise<void>((resolve, reject) => {
      // Load menu from JSON file (public folder is served from root)
      this.http
        .get<{ menu: Menu[] }>('data/menu.json')
        .pipe(tap(response => this.setMenu(response.menu)))
        .subscribe({
          next: () => {
            this.setPermissions();
            resolve();
          },
          error: (err) => {
            console.error('Error loading menu:', err);
            this.setPermissions();
            resolve();
          },
        });
    });
  }

  private setMenu(menu: Menu[]) {
    this.menuService.addNamespace(menu, 'menu');
    this.menuService.set(menu);
  }

  /**
   * Set permissions based on current user roles
   * This method is public so it can be called after login/logout to refresh permissions
   */
  setPermissions() {
    // Get roles from OIDC token (if authenticated)
    const roles = this.oidcAuth.getUserRoles();
    console.log('StartupService: User roles from token:', roles);

    // Define permissions based on roles
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];

    // Flush existing roles and add new ones
    this.rolesService.flushRoles();

    // If user is authenticated, set their specific permissions
    if (roles.length > 0) {
      this.permissonsService.loadPermissions(permissions);
      console.log('StartupService: Loaded permissions:', permissions);

      if (roles.includes('HRAdmin')) {
        this.rolesService.addRoles({ HRAdmin: permissions });
        console.log('StartupService: Added HRAdmin role with permissions:', permissions);
      }
      if (roles.includes('Manager')) {
        this.rolesService.addRoles({ Manager: permissions });
        console.log('StartupService: Added Manager role with permissions:', permissions);
      }
      if (roles.includes('Employee')) {
        this.rolesService.addRoles({ Employee: ['canRead'] });
        console.log('StartupService: Added Employee role with canRead permission');
      }
    } else {
      // Anonymous user - set read-only permissions
      console.log('StartupService: No roles found - setting Guest permissions');
      this.permissonsService.loadPermissions(['canRead']);
      this.rolesService.addRoles({ Guest: ['canRead'] });
    }
  }
}
