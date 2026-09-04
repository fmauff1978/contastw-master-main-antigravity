import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContasService } from '../../../services/contas.service';
import { Timestamp } from 'firebase/firestore';
import { LctosService } from '../../../services/lctos.service';
import { TimestampService } from '../../../services/timestamp.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { AlertComponent } from '../../../shared/alert/alert.component';

@Component({
  selector: 'app-template-creditandouma',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerComponent,
    AlertComponent,
  ],
  templateUrl: './template-creditandouma.component.html',
  styleUrl: './template-creditandouma.component.css',
})
export class TemplateCreditandoumaComponent {
  items: any[] = [];
  meuForm: FormGroup;
  isLoading = false;
  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private cs: ContasService,
    private fb: FormBuilder,
    private ls: LctosService,
    private ts: TimestampService
  ) {
    this.cs.pegarTodasContas(true).then((items) => {
      this.items = items;
    });

    this.iniciarmeuForm();
  }

  adicionar() {
    console.log('gravandfo');
  }
  closeAlert() {
    this.showAlert = false;
  }

  iniciarmeuForm() {
    this.meuForm = this.fb.group({
      // Usando FormBuilder para melhor organização
      contacreditada: ['', Validators.required],
      complementos: this.fb.array([]), // Inicializa como FormArray vazio usando FormBuilder
    });
  }

  async onSubmit() {
    this.isLoading = true;
    console.log(this.meuForm.value);
    let cred = this.meuForm.value.contacreditada;

    let split_cred = cred.split('-');

    const id_cred = split_cred[0];
    const cod_cred0 = split_cred[1];
    const cod_cred = Number(cod_cred0);
    const conta_cred = split_cred[2];
    const nat_cred = split_cred[3];
    const enq_cred = split_cred[4];
    const mob_cred = split_cred[5];

    let deb = this.meuForm.value.complementos;

    console.log(deb);

    for (let i = 0; i < deb.length; i++) {
      let debitada = deb[i].contadebitada;
      let split_deb = debitada.split('-');
      let datalcto = this.ts.converterDataForm(deb[i].datalcto);

      const lctogravar = {
        datalcto: datalcto,
        descricao: deb[i].descricao,
        reg: `${Date.now()}`,
        contadebitada: {
          id: split_deb[0],
          cod: Number(split_deb[1]),
          conta: String(split_deb[2]),
          natureza: String(split_deb[3]),
          enquadramento: String(split_deb[4]),
          mod_despesa: String(split_deb[5]),
        },
        contacreditada: {
          id: id_cred,
          cod: cod_cred,
          conta: conta_cred,
          natureza: nat_cred,
          enquadramento: enq_cred,
          mod_despesa: mob_cred,
        },
        valor: deb[i].valor,
        criado_em: Timestamp.now(),
      };

      console.log(lctogravar);

      //  if (this.post[i].valor > 0) {
      await this.ls.gravarLcto(lctogravar);
      await this.ls.debitar(split_deb[0], deb[i].valor);
      await this.ls.creditar(id_cred, deb[i].valor);
    }
    this.isLoading = false;
    this.alertTitle = 'Sucesso';
    this.alertMessage = 'Lançamentos gravados em lote!';
    this.alertType = 'success';
    this.showAlert = true;
    this.ResetForm();
  }

  criarArray(): FormGroup {
    return this.fb.group({
      datalcto: ['', Validators.required],
      descricao: ['', Validators.required],
      contadebitada: ['', Validators.required],
      valor: ['', Validators.required],
    });
  }

  get complementos(): FormArray {
    // Getter para acessar o FormArray com segurança
    return this.meuForm.get('complementos') as FormArray;
  }

  addComplemento() {
    this.complementos.push(this.criarArray()); // Usa o getter para acessar a FormArray
  }

  obterLcto() {
    const complem = [];
    complem.push(this.criarArray());
    return complem;
  }

  // addComplemento() {
  //   console.log("funcionando")
  //   console.log(this.meuForm.value.contacreditada)
  //   const compl = this.meuForm.get('complementos') as FormArray;
  //   compl.push(this.criarArray());
  // }

  remove(i: number) {
    const complem = this.meuForm.get('complementos') as FormArray;
    complem.removeAt(i);
  }

  ResetForm() {
    this.meuForm.reset();
    (this.meuForm.get('complementos') as FormArray).clear(); //Limpa a FormArray
  }
}
