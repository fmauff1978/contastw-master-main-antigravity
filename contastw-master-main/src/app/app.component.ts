import { Component, LOCALE_ID } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { Toolbar3Component } from './shared/toolbar3/toolbar3.component';
import { Footer3Component } from './shared/footer3/footer3.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { TickerComponent } from './shared/ticker/ticker.component';
import { CommonModule } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { take } from 'rxjs/operators';

registerLocaleData(localePt);


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer3Component, Toolbar3Component, SpinnerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class AppComponent {
  constructor(
    private fs: FirestoreService,
    private auth: AuthService,
    private router: Router
  ) {
    // Não fazemos mais a verificação de autenticação aqui
    // Deixamos isso para o AuthGuard
  }
}

