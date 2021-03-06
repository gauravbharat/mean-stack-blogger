import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;

  // Inject Auth service to use the token
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Get the current token status since the header loads
    // after the autoAuthUser() is run in the App component and the header component is not loaded yet
    this.userIsAuthenticated = this.authService.getIsAuth();

    // Subscribe to token status observable
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  ngOnDestroy() {
    // user-defined observables needs to be unsubscribed from
    this.authListenerSubs.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
