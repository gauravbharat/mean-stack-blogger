/** To use AuthService.getToken() into PostsService, one way was to inject AuthService into
 * PostsService constructor() and call the method inside to get the token. And then add a header
 * to all outgoing http requests.
 *
 * However, we are using another approach using HttpInterceptors, a feature offered by Angular HttpClient.
 * HttpInterceptors are just functions which run on any outgoing http requests. And then we can manipulate
 * this outgoing requests to attach the token.
 *
 * Add this interceptor service in the Providers array inside App modules, instead of adding it as 'providedIn'
 */

import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';

// Injectable decorator is required to inject services into another service class
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  // Take a request, process it and continue with next code block using next.handle(req)
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();

    // Clone and manipulate the request instead of directly changing it to avoid any unwanted side-effects
    // Pass configuration to clone, to edit the clone
    const authRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });

    return next.handle(authRequest);
  }
}
