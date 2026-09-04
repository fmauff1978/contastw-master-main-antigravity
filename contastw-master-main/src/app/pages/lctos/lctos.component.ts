import { Component, LOCALE_ID } from '@angular/core';
import { ContasService } from '../../services/contas.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { TimestampService } from '../../services/timestamp.service';
import { LctosService } from '../../services/lctos.service';
import { AlertComponent } from '../../shared/alert/alert.component';



@Component({
  selector: 'app-lctos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './lctos.component.html',
  styleUrl: './lctos.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class LctosComponent {
  items: any[] = [];
  items2: any[] = [];
  items3: any[] = [];
  fonte: any[] = []; 
  meuForm!: FormGroup;
  selected: any;
  selected2: any;
  isModalOpen = false;
  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private cs: ContasService,
    private ts: TimestampService,
    private ls: LctosService
  ) {
    this.cs.pegarTodasContas(true).then((items) => {
      this.items = items;
      console.log(this.items);
    });
    this.iniciarmeuForm();
  }

 
  onSubmit() {


    let data = this.meuForm.value.data;

    console.log(data);
    let datalcto = this.ts.converterDataForm(data);

    this.selected = this.meuForm.value.contadebitada;
    this.selected2 = this.meuForm.value.contacreditada;

    let split_deb = this.selected.split('-');
    let split_cred = this.selected2.split('-');

    const contadeb_id = split_deb[0];
    const cod_deb0 = split_deb[1];
    const cod_deb = Number(cod_deb0);
    const contadeb = split_deb[2];
    const naturezadeb = split_deb[3];
    const enquadramentodeb = split_deb[4];
    const mod_despesa_deb = split_deb[5];

    const contacred_id = split_cred[0];
    const cod_cred0 = split_cred[1];
    const cod_cred = Number(cod_cred0);
    const contacred = split_cred[2];
    const naturezacred = split_cred[3];
    const enquadramentocred = split_cred[4];
    const mod_despesa_cred = split_cred[5];
    const valor = this.meuForm.value.valor;

    const lctogravar = {
      datalcto: datalcto,
      descricao: this.meuForm.value.descricao,
      reg: `${Date.now()}`,
      contadebitada: {
        id: contadeb_id,
        cod: cod_deb,
        conta: contadeb,
        natureza: naturezadeb,
        enquadramento: enquadramentodeb,
        mod_despesa: mod_despesa_deb,
      },

      contacreditada: {
        id: contacred_id,
        cod: cod_cred,
        conta: contacred,
        natureza: naturezacred,
        enquadramento: enquadramentocred,
        mod_despesa: mod_despesa_cred,
      },

      valor: valor,
      criado_em: Timestamp.now(),
    };

    console.log(lctogravar);
     this.ls.gravarLcto(lctogravar);



    this.ls.debitar(contadeb_id,valor)
   this.ls.creditar(contacred_id, valor)
   this.alertTitle = 'Sucesso';
   this.alertMessage = 'Lançamento criado e contas deb/creditadas com sucesso!';
   this.alertType = 'success'
   this.showAlert = true;

     this.ResetForm();
  }

  iniciarmeuForm() {
    this.meuForm = new FormGroup({
      data: new FormControl('', Validators.required),
      descricao: new FormControl('', Validators.required),
      contadebitada: new FormControl('', Validators.required),
      contacreditada: new FormControl('', Validators.required),
      valor: new FormControl('', Validators.required),
    });
  }

  ResetForm() {
    this.meuForm.reset();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  closeAlert(){
    this.showAlert = false;
  }

}
