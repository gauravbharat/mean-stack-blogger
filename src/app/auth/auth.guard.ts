/** Create AuthGuard service
 * What does Guard mean?
 * Angular adds some interfaces your classes can implement,
 * which forces the classes to add certain methods,
 * which the Angular Router can execute before it loads a route,
 * to check whether it should proceed or do something else.
 * And one such interface which helps us protecting the routes is CanActivate (from @angular/router)
 *
 * Add this service as a provider in the App Routing module
 */

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    // get current auth status value instead of observing new
    const isAuth = this.authService.getIsAuth();
    if (!isAuth) {
      this.router.navigate(['/auth/login']);
    }
    return isAuth;
  }
}
