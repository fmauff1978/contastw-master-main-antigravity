import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Verifica primeiro se já temos um usuário atual
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      return true;
    }

    // Se não temos usuário atual, observa mudanças no estado de autenticação
    return this.auth.isAuthenticated$.pipe(
      take(1),
      map(isAuth => {
        if (isAuth) {
          return true;
        }
        // Armazena a URL atual para redirecionar depois do login
        return this.router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      })
    );
  }
}
