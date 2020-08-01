import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

// Selector is omitted here because this component would be loaded via Routing
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  isLoading = false;

  onLogin(form: NgForm) {
    //
  }
}
