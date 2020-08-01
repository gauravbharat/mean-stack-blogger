import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

// Import interface of AuthData type
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  /** Listener to set, is the user authenticated (true) or not (false)
   * The token can change on login, logout, expired, etc., so we want to push that token update
   * information to the components that are interested.
   */
  private authStatusListner = new Subject<boolean>();

  // Inject HttpClient and Router
  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    // Return the observable part of the listener, so that we can't emit new values from
    // other components using this listener handle
    return this.authStatusListner.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.http
      .post(`http://localhost:3000/api/user/signup`, authData)
      .subscribe((response) => {
        console.log(response);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.http
      .post<{ token: string; expiresIn: number }>(
        `http://localhost:3000/api/user/login`,
        authData
      )
      .subscribe((response) => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.tokenTimer = setTimeout(() => {
            this.logout();
          }, expiresInDuration * 1000);

          this.isAuthenticated = true;
          this.authStatusListner.next(true); //update the listener status
          this.router.navigate(['/']);
        }
      });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/']);
  }
}
