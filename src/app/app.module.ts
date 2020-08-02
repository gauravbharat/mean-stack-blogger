/** Angular base libs and built-in modules */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/** Custom Angular Modules */
import { AppRoutingModule } from './app-routing.module';
import { PostsModule } from './posts/posts.module';

/** Angular Material Module */
import { AngularMaterialModule } from './angular-material.module';

/** Components */
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ErrorComponent } from './error/error.component';

/** HTTP Interceptors */
import { AuthInterceptor } from './auth/auth.interceptor';
import { ErrorInterceptor } from './error-interceptor';

@NgModule({
  declarations: [AppComponent, HeaderComponent, ErrorComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    PostsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  /** Since the error component would load neither through a selector nor through any routing,
   * we have to inform angular that it eventually needs to be prepared to create this component.
   * Since we dynamically create this component using the Material Dialog service
   *
   * entryComponents inform Angular that the components inside it are going to be used, even
   * though Angular can't see them
   */
  entryComponents: [ErrorComponent],
})
export class AppModule {}
