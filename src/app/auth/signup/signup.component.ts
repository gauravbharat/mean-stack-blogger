import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

// Selector is omitted here because this component would be loaded via Routing
@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  isLoading = false;

  onSignup(form: NgForm) {
    //
  }
}
