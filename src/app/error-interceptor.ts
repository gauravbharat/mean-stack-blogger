/** HttpInterceptors, a feature offered by Angular HttpClient.
 * HttpInterceptors are just functions which run on any outgoing http requests. And then we can manipulate
 * this outgoing requests to attach the token.
 *
 * Add this interceptor service in the Providers array inside App modules, instead of adding it as 'providedIn'
 */
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
} from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // Inject dialog service
  constructor(private dialog: MatDialog) {}

  // Take a request, process it and continue with next code block using next.handle(req)
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    /** handle actually gives us back the response observable stream, we can just hook into
     * that stream and listen to events
     */
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';

        if (error.error.message) {
          errorMessage = error.error.message;
        }

        // Pass data object in the Error component, use it there using @Inject in constructor
        this.dialog.open(ErrorComponent, { data: { message: errorMessage } });

        // Return observable with error
        return throwError(error);
      })
    );
  }
}
