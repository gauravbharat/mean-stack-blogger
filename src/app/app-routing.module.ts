import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';

/** TIP
 * Routes are simply JavaScript objects,
 * where we define for which url which part of our app should be presented
 * Properties:
 * path (without slash '/') === page to load, where empty path === Main page, starting page
 * component === which module to load
 */
const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'create', component: PostCreateComponent },
  { path: 'edit/:postId', component: PostCreateComponent },
];

/** Now let the RouterModule know about the Routes defined by importing it and
 * calling forRoot() method which takes the root route config, and
 * export it to be used by the App Module when this file is imported there
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
