import { SeriestemporaisComponent } from './pages/seriestemporais/seriestemporais.component';
import { OutroscredoresComponent } from './pages/outroscredores/outroscredores.component';
import { LoginComponent } from './shared/login/login.component';
import { SchedulerComponent } from './shared/scheduler/scheduler.component';

import { Routes } from '@angular/router';

import { LctosComponent } from './pages/lctos/lctos.component';
import { TableComponent } from './pages/table/table.component';

import { Pl3Component } from './pages/pl3/pl3.component';
import { TemplateCreditandoumaComponent } from './pages/lctos/template-creditandouma/template-creditandouma.component';
import { TemplateDebitandoumaComponent } from './pages/lctos/template-debitandouma/template-debitandouma.component';
import { FopagComponent } from './pages/lctos/fopag/fopag.component';

import { Mensal2024Component } from './pages/despesas/mensal2024/mensal2024.component';
import { Mensal2025Component } from './pages/despesas/mensal2025/mensal2025.component';
import { GestaobdComponent } from './pages/gestaobd/gestaobd.component';
import { ParcelamentosComponent } from './pages/parcelamentos/parcelamentos.component';
import { CadastrarparcComponent } from './pages/parcelamentos/cadastrarparc/cadastrarparc.component';
import { FaturasComponent } from './pages/faturas/faturas.component';
import { CalendarComponent } from './pages/calendar/calendar.component';

import { ContasComponent } from './pages/contas/contas.component';

import { PreviComponent } from './pages/previ/previ.component';
import { AuthGuard } from './services/auth.guard';
import { Bp2Component } from './pages/bp2/bp2.component';

import { AgregadasComponent } from './pages/despesas2/agregadas/agregadas.component';
import { Agenda2Component } from './pages/agenda2/agenda2.component';
import { Parcelamentos2Component } from './pages/parcelamentos2/parcelamentos2.component';
import { PatrimonioComponent } from './pages/patrimonio/patrimonio.component';
import { Previ2Component } from './pages/previ2/previ2.component';
import { GrafComponent } from './shared/graficos/graf/graf.component';
import { ProvisoesComponent } from './pages/provisoes/provisoes.component';
import { UploadComponent } from './pages/upload/upload.component';
import { EncerramentoComponent } from './pages/encerramento/encerramento.component';
import { Mensal2026Component } from './pages/despesas/mensal2026/mensal2026.component';
import { AgregadosComponent } from './pages/agregados/agregados.component';
import { Bp3Component } from './pages/bp3/bp3.component';
import { St2Component } from './pages/st2/st2.component';
import { St3Component } from './pages/st3/st3.component';
import { GaugeComponent } from './shared/gauge/gauge.component';
import { PainelcontasComponent } from './pages/painelcontas/painelcontas.component';
import { MensalComponent } from './pages/despesas/mensal/mensal.component';
import { AgregadoAtualComponent } from './pages/agregado-atual/agregado-atual.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
  },
  {
    path: 'pc',
    component: PainelcontasComponent,
    title: 'Contas',
  },
  {
    path: '',
    redirectTo: 'bp3',
    pathMatch: 'full',
  },
  {
    path: 'bp',
    component: Bp2Component,
    canActivate: [AuthGuard],
    title: 'Resultado das Contas',
  },
  {
    path: 'mensal',
    component: MensalComponent,
    canActivate: [AuthGuard],
    title: 'Resultado das Contas',
  },
  {
    path: 'agregadoatual',
    component: AgregadoAtualComponent,
    canActivate: [AuthGuard],
    title: 'Resultado das Contas',
  },
  {
    path: 'cadlctos',
    canActivate: [AuthGuard],
    component: LctosComponent,
    //  canActivate: [AuthGuard],
  },

  {
    path: 'bp3',
    // canActivate: [AuthGuard],
    component: Bp3Component,
    title: 'Resultado das Contas',
    //  canActivate: [AuthGuard],
  },

  {
    path: 'tb',
    component: TableComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'gauge',
    component: GaugeComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'up',
    component: UploadComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'enc',
    component: EncerramentoComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'st',
    component: SeriestemporaisComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'st2',
    component: St2Component,
    // canActivate: [AuthGuard],
  },

  {
    path: 'st3',
    component: St3Component,
    // canActivate: [AuthGuard],
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'pl3',
    title: 'Lançamentos',
    component: Pl3Component,
    // canActivate: [AuthGuard],
  },

  {
    path: 'graf',
    title: 'Agregados',
    component: GrafComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'agreg26',
    title: 'Agregados',
    component: AgregadosComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'cred-uma',
    title: 'Vários Lctos à Crédito de uma',
    component: TemplateCreditandoumaComponent,
    //  canActivate: [AuthGuard],
  },

  {
    path: 'deb-uma',
    title: 'Vários Lctos à Débito de uma',
    component: TemplateDebitandoumaComponent,

    //canActivate: [AuthGuard],
  },

  {
    path: 'fopag',
    title: 'FOPAG',
    component: FopagComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'mensal2024',
    title: 'Despesas Mensais 2024',
    component: Mensal2024Component,
    // canActivate: [AuthGuard],
  },

  {
    path: 'mensal2025',
    title: 'Despesas Mensais 2025',
    component: Mensal2025Component,
    // canActivate: [AuthGuard],
  },

  {
    path: 'mensal2026',
    title: 'Despesas Mensais 2026',
    component: Mensal2026Component,
    // canActivate: [AuthGuard],
  },

  {
    path: 'gestao',
    title: 'Gestao BD',
    component: GestaobdComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'parcelamentos',
    title: 'Parcelamentos',
    component: ParcelamentosComponent,
    //canActivate: [AuthGuard],
  },

  {
    path: 'cadparc',
    title: 'Parcelamentos',
    component: CadastrarparcComponent,
    //canActivate: [AuthGuard],
  },

  {
    path: 'patr',
    title: 'Patrimonio',
    component: PatrimonioComponent,
    //canActivate: [AuthGuard],
  },

  {
    path: 'faturas',
    title: 'Faturas',
    component: FaturasComponent,
    //canActivate: [AuthGuard],
  },

  {
    path: 'calendar',
    title: 'Calendar',
    component: CalendarComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'previ2',
    title: 'Previ',
    component: Previ2Component,
    // canActivate: [AuthGuard],
  },

  {
    path: 'ativas',
    title: 'Contas Ativas',
    component: ContasComponent,
    //  canActivate: [AuthGuard],
  },

  {
    path: 'previ',
    title: 'Previ',
    component: PreviComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'schedule',
    title: 'Agenda',
    component: SchedulerComponent,
    // canActivate: [AuthGuard],
  },

  {
    path: 'ag',
    component: AgregadasComponent,
    //canActivate: [AuthGuard]
  },

  {
    path: 'agenda2',
    component: Agenda2Component,
    //canActivate: [AuthGuard]
  },

  {
    path: 'parc2',
    component: Parcelamentos2Component,
    //canActivate: [AuthGuard]
  },

  {
    path: 'prov',
    component: ProvisoesComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'oc',
    component: OutroscredoresComponent,
    //canActivate: [AuthGuard]
  },

  // { path: '', redirectTo: '/bp2', pathMatch: 'full' },
  // { path: '**', redirectTo: '/bp2' },
];
