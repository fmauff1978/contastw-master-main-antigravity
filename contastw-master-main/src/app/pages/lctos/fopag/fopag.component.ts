import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LctosService } from '../../../services/lctos.service';
import { TimestampService } from '../../../services/timestamp.service';
import { Timestamp } from 'firebase/firestore';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Agreg2Service } from '../../../services/agreg2.service';
import { LoadingService } from '../../../services/loading.service';
import { Contas2Service } from '../../../services/contas2.service';
import { RecliquidaService } from '../../../services/recliquida.service';
import { Agreg3Service } from '../../../services/agreg3.service';

@Component({
  selector: 'app-fopag',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SpinnerComponent,
    AlertComponent,
  ],
  templateUrl: './fopag.component.html',
  styleUrl: './fopag.component.css',
})
export class FopagComponent {
  ag2 = inject(Agreg2Service);
  cs2 = inject(Contas2Service);

  fopag: any[] = [];
  meuForm: FormGroup;
  
  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  ano = new Date().getFullYear();

  constructor(
    private ls: LctosService,
    private ts: TimestampService,
    private ag3: Agreg3Service,
    private loading: LoadingService,
    private rl: RecliquidaService
  ) {
    this.iniciarmeuForm();

    this.ls.pegarFOPAG().then((x) => {
      this.fopag = x;
      console.log(this.fopag);
    });
  }
  async onSubmit() {
    this.loading.show('Gravando FOPAG...');

    console.log(this.meuForm.value);
    const data0 = this.meuForm.value.data;
    const data1 = new Date(data0);
    const mes = data1.getMonth();
    console.log(mes);
    const month = data1.getMonth() + 1;

    const month0 = this.ts.getMonthName(month);
    console.log(month0);

    const datalcto = this.ts.converterDataForm(data0);
    const previ_vlr = this.meuForm.value.previ;
    const previ2b_vlr = this.meuForm.value.previ2b;
    const previ80_vlr =
      (this.meuForm.value.previ + this.meuForm.value.previ2b) * 0.8;
    const cassi_vlr = this.meuForm.value.cassi;
    const ir_vlr = this.meuForm.value.ir;
    const fgts_vlr = this.meuForm.value.fgts;
    const contsind_vlr = this.meuForm.value.contsind;
    const inss_vlr = this.meuForm.value.inss;
    const esprevi_vlr = this.meuForm.value.esprevi;
    const previ13_vlr = this.meuForm.value.previ13;
    const prov_vlr = this.meuForm.value.prov;
    const descricao = 'FOPAG de ' + month0;
    const minha_vlr = this.meuForm.value.minha;
    const fupilipe_vlr = this.meuForm.value.fupilipe;
    const rosa_vlr = this.meuForm.value.rosa;
    const consig_vlr = this.meuForm.value.consig;
    console.log('valores do form', consig_vlr);

    const recliq: number =
      fgts_vlr +
      previ_vlr +
      previ2b_vlr +
      previ80_vlr +
      cassi_vlr +
      inss_vlr +
      ir_vlr +
      contsind_vlr +
      prov_vlr +
      fupilipe_vlr +
      minha_vlr +
      rosa_vlr;

    await this.ag2.atualizarValoresPorMesFOPAG(
      'XgugZKlPuhn8QNvLToMB',
      mes,
      recliq
    );

   

    console.log('valores previ e fgts debitados da receita liquida', recliq);

    this.fopag[0].valor = fgts_vlr;
    this.fopag[1].valor = previ_vlr + previ2b_vlr + previ80_vlr;
    this.fopag[2].valor = prov_vlr;
    this.fopag[3].valor = cassi_vlr;
    this.fopag[4].valor = fupilipe_vlr;
    this.fopag[5].valor = minha_vlr;
    this.fopag[6].valor = rosa_vlr;
    this.fopag[7].valor = contsind_vlr;
    this.fopag[8].valor = inss_vlr;
    this.fopag[9].valor = ir_vlr;
    this.fopag[10].valor = previ13_vlr;
    this.fopag[11].valor = esprevi_vlr;
    this.fopag[12].valor = consig_vlr;

    console.log(descricao);

    for (let i = 0; i < this.fopag.length; i++) {
      const lctogravar = {
        datalcto: datalcto,
        descricao: descricao,
        reg: `${Date.now()}`,
        contadebitada: {
          id: this.fopag[i].id,
          cod: this.fopag[i].cod,
          conta: this.fopag[i].conta,
          natureza: this.fopag[i].natureza,
          enquadramento: this.fopag[i].enquadramento,
          mod_despesa: this.fopag[i].mod_despesa,
        },
        contacreditada: {
          id: 'kd8kURWDFxemcE3jqz7M',
          cod: 145,
          conta: 'Proventos',
          natureza: 'receita',
          enquadramento: 'receita',
          mod_despesa: 'nihil',
        },
        valor: this.fopag[i].valor,
        criado_em: Timestamp.now(),
      };

      console.log(lctogravar);

      if (this.fopag[i].valor > 0) {
        await this.ls.gravarLcto(lctogravar);
        await this.ls.debitar(this.fopag[i].id, this.fopag[i].valor);
        await this.ls.creditar('kd8kURWDFxemcE3jqz7M', this.fopag[i].valor);
      } else {
      }
     }
    await this.ag3.calcularDespReceitaTotais()
    await this.rl.atualizarRecLiq(mes)

    this.loading.hide();

    console.log('FOPAG GRAVADA COM SUCESSO');

   

    this.alertTitle = 'Sucesso';
    this.alertMessage = 'FOPAG lançada!';
    this.alertType = 'success';
    this.showAlert = true;

    this.ResetForm();
  }

  closeAlert() {
    this.showAlert = false;
  }

  iniciarmeuForm() {
    this.meuForm = new FormGroup({
      data: new FormControl('', Validators.required),
      previ: new FormControl('', Validators.required),
      previ2b: new FormControl('', Validators.required),
      cassi: new FormControl('', Validators.required),
      inss: new FormControl('', Validators.required),
      ir: new FormControl('', Validators.required),
      fgts: new FormControl('', Validators.required),
      contsind: new FormControl('', Validators.required),
      esprevi: new FormControl('', Validators.required),
      previ13: new FormControl('', Validators.required),
      prov: new FormControl('', Validators.required),
      rosa: new FormControl('', Validators.required),
      fupilipe: new FormControl('', Validators.required),
      minha: new FormControl('', Validators.required),
      consig: new FormControl('', Validators.required),
    });
  }

  ResetForm() {
    this.meuForm.reset();
  }
}
