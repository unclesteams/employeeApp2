import { NgModule, Injectable } from '@angular/core';
import { Routes,Router,RouterModule, CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {LoginService} from './login/login.service';
import { map} from 'rxjs/operators';
import {from} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CanActivateDashboard implements CanActivate {
  constructor(private loginService:LoginService, private router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ){
    if (this.loginService.isLoggedIn()) {
      const jwtLocal = this.loginService.getAuthToken();
      const emailLocal = this.loginService.getEmail();
      return from(this.loginService.isValidToken(emailLocal, jwtLocal).pipe(
      map(
        response => {
          if(!response.valid) {
            this.router.navigate(['/login'], {
              queryParams: {
                return: state.url
              }
            });
            this.loginService.clearSession();
          }
          return response.valid;
        })
      ).toPromise());
    } else {
      this.loginService.logout();
      this.router.navigate(['/login'], {
        queryParams: {
          return: state.url
        }
      });
      return false;
    }
  }
}

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'dashboard', component: DashboardComponent, canActivate: [CanActivateDashboard]},
  { path: 'login', component: LoginComponent},
  { path: '404', component: NotFoundComponent},
  { path: '**', redirectTo: '/404'} // load all paths which are not specify before to 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
