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
  selector: 'app-template-debitandouma',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent, AlertComponent],
  templateUrl: './template-debitandouma.component.html',
  styleUrl: './template-debitandouma.component.css'
})
export class TemplateDebitandoumaComponent {

  items: any[] = [];
  meuForm: FormGroup;
  isLoading = false;
  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';


  constructor(private cs: ContasService, private fb: FormBuilder, private ls: LctosService, private ts: TimestampService) {
  
    this.cs.pegarTodasContas(true).then((items) => {
      this.items = items;
     
    });

    this.iniciarmeuForm();
  }

  iniciarmeuForm() {
    this.meuForm = this.fb.group({ // Usando FormBuilder para melhor organização
      contadebitada: ['', Validators.required],
      complementos: this.fb.array([]) // Inicializa como FormArray vazio usando FormBuilder
    });
  }
  closeAlert(){
    this.showAlert = false;
  }
  

  async onSubmit() {
    this.isLoading = true
    console.log(this.meuForm.value);
    let deb = this.meuForm.value.contadebitada;

    console.log(deb)
  
    let split_deb = deb.split('-'); 
    const id_deb = split_deb[0];
    const cod_deb0 = split_deb[1];
    const cod_deb = Number(cod_deb0);
    const conta_deb = split_deb[2];
    const nat_deb = split_deb[3];
    const enq_deb = split_deb[4];
    const md_deb = split_deb[5];
    

    let cred = this.meuForm.value.complementos;

    console.log(cred)

    for (let i = 0; i < cred.length; i++) {
      let creditada = cred[i].contacreditada;
      let split_cred = creditada.split('-');
      let datalcto = this.ts.converterDataForm(cred[i].datalcto);


      const lctogravar = {
        datalcto: datalcto,
        descricao: cred[i].descricao,
        reg: `${Date.now()}`,
        contadebitada: {
          id: id_deb,
          cod: cod_deb,
          conta: conta_deb,
          natureza: nat_deb,
          enquadramento: enq_deb,
          mod_despesa: md_deb
        },
        contacreditada: {
          id: split_cred[0],
          cod: Number(split_cred[1]),
          conta: String(split_cred[2]),
          natureza: String(split_cred[3]),
          enquadramento: String(split_cred[4]),
          mod_despesa: String(split_cred[5]),
      
        },
        valor: cred[i].valor,
        criado_em: Timestamp.now(),
      };

      console.log(lctogravar);

      //  if (this.post[i].valor > 0) {
       await this.ls.gravarLcto(lctogravar);
      await this.ls.debitar(id_deb, cred[i].valor);
      await this.ls.creditar(split_cred[0], cred[i].valor);

     // await this.ls.debitar(split_deb[0], deb[i].valor);
    //  await this.ls.creditar(id_cred, deb[i].valor);
  }
this.isLoading = false;
this.alertTitle = 'Sucesso';
this.alertMessage = 'Lançamentos gravados em lote!';
this.alertType = 'success'
this.showAlert = true;

  this.ResetForm()
}

  criarArray(): FormGroup {
    return this.fb.group({
      datalcto: ['', Validators.required],
      descricao: ['', Validators.required],
      contacreditada: ['', Validators.required],
      valor: ['', Validators.required],
    });
  }

  get complementos(): FormArray { // Getter para acessar o FormArray com segurança
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
