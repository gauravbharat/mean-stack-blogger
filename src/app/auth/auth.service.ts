import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Import interface of AuthData type
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Inject HttpClient and Router
  constructor(private http: HttpClient, private router: Router) {}

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
}
