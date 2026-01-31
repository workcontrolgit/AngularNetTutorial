import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { catchError, throwError } from 'rxjs';

export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const toast = inject(HotToastService);
  const errorPages = [STATUS.FORBIDDEN, STATUS.NOT_FOUND, STATUS.INTERNAL_SERVER_ERROR];

  const getMessage = (error: HttpErrorResponse) => {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.msg) {
      return error.error.msg;
    }
    if (error.status === 0) {
      return 'Network error - please check your connection';
    }
    return `${error.status} ${error.statusText}`;
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle CORS errors (status 0) - don't show toast, just log
      if (error.status === 0) {
        console.warn('Network error (possible CORS issue):', error);
        return throwError(() => error);
      }

      if (errorPages.includes(error.status)) {
        router.navigateByUrl(`/${error.status}`, {
          skipLocationChange: true,
        });
      } else {
        console.error('ERROR', error);
        toast.error(getMessage(error));
        if (error.status === STATUS.UNAUTHORIZED) {
          // Don't redirect to login for anonymous users
          console.warn('Unauthorized access - authentication required');
        }
      }

      return throwError(() => error);
    })
  );
}
