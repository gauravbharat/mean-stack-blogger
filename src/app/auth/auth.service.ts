import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

// Import interface of AuthData type
import { AuthData } from './auth-data.model';
import { environment } from '../../environments/environment';

const BACKEND_URL = `${environment.apiUrl}/user`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
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

  getUserId() {
    return this.userId;
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

    this.http.post(`${BACKEND_URL}/signup`, authData).subscribe(
      () => {
        // navigate to Home page on success
        this.router.navigate['/'];
      },
      (error) => {
        // Push the false value to the entire app, Signup component is listening to this
        this.authStatusListner.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,
    };

    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        `${BACKEND_URL}/login`,
        authData
      )
      .subscribe(
        (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);

            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListner.next(true); //update the listener status

            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(token, expirationDate, this.userId);

            this.router.navigate(['/']);
          }
        },
        (error) => {
          // Push the false value to the entire app, Login component is listening to this
          this.authStatusListner.next(false);
        }
      );
  }

  // Automatically authorize the user if we'got the information in localStorage
  autoAuthUser() {
    const authInformation = this.getAuthData();

    if (!authInformation) return;

    // Check that the token expiration date is in the future
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.userId = authInformation.userId;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListner.next(true);
    } else {
      this.logout();
    }
  }

  logout() {
    this.clearAuthData();
    this.token = null;
    this.userId = null;
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    //serialized expiration date stored
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }

    // De-serialize expiration date
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId,
    };
  }
}
