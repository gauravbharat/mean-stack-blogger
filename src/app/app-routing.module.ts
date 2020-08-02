import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { AuthGuard } from './auth/auth.guard';

/** TIP
 * Routes are simply JavaScript objects,
 * where we define for which url which part of our app should be presented
 * Properties:
 * path (without slash '/') === page to load, where empty path === Main page, starting page
 * component === which module to load
 *
 * Attach AuthGuard to the routes that needs to be protected from unauthenticated access
 *
 *  ***** Lazy Loading *****
 * Link child Router Module, AuthRouterModule, using a new route 'auth'
 * Instead of adding a component, use loadChildren which describes a path you want to load lazyly
 * import AuthModule using the arrow function, and pass it to loadChildren
 * to let angular know, which class the child would use as a module, and to lazy load that module
 *
 * REMOVE the AuthModule imported in the APP MODULE, since we have not registered it here for lazy load
 */
const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  {
    path: 'edit/:postId',
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  // { path: 'auth', loadChildren: './auth/auth.module#AuthModule' },
];

/** Now let the RouterModule know about the Routes defined by importing it and
 * calling forRoot() method which takes the root route config, and
 * export it to be used by the App Module when this file is imported there
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
