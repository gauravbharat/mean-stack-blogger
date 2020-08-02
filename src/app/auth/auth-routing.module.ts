/** Separate Router to implement lazy-loading of Auth components
 *
 * Registering child route using RouterModule.forChild() to
 * eventually merge this with the app root RouterModule
 *
 * import this module in AuthModule.ts
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
