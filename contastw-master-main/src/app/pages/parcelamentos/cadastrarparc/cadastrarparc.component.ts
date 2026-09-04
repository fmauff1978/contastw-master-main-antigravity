import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParcelamentosService } from '../../../services/parcelamentos.service';
import { TimestampService } from '../../../services/timestamp.service';
import { Timestamp } from 'firebase/firestore';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastrarparc',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent, RouterModule],
  templateUrl: './cadastrarparc.component.html',
  styleUrl: './cadastrarparc.component.css'
})
export class CadastrarparcComponent {

  meuForm: FormGroup;
items: any[]=[];
showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';


constructor(private ps: ParcelamentosService, private ts: TimestampService){


  this.ps.pegarCartao().then((x)=>{

   this.items=x;
   console.log(this.items);




  })

this.iniciarmeuForm()


}


iniciarmeuForm() {
  this.meuForm = new FormGroup({
    datacompra: new FormControl('', Validators.required),
    cartaovinc: new FormControl('', Validators.required),
    origem: new FormControl('', Validators.required),
    descricao: new FormControl('', Validators.required),
    valorcompra: new FormControl('', Validators.required),
    qtdeparc: new FormControl('', Validators.required),
    valorparc: new FormControl('', Validators.required),
    data1aparc: new FormControl('', Validators.required),
  });
}

ResetForm() {
  this.meuForm.reset();
}


  async onSubmit() {

  console.log(this.meuForm.value);

  let cardvinculado = this.meuForm.value.cartaovinc
  let data1parc = this.meuForm.value.data1aparc;
  let data1parc0 = this.ts.converterDataForm(data1parc);
  console.log(data1parc0)
  let datacompra = this.meuForm.value.datacompra;
  let datacompra0 = this.ts.converterDataForm(datacompra);
  let qtdeparc = this.meuForm.value.qtdeparc;
  const monthsToAdd = (qtdeparc)-1;
 const ultparc0 = await this.ts.addMonths(data1parc0, monthsToAdd);
 const ultparc = this.ts.dateToFirebaseTimestamp(await ultparc0);

 console.log(ultparc)

  const parcgravar = {

    datadacompra: datacompra0,
    cod: `${Date.now()}`,
    ativa: true,
    descricao: this.meuForm.value.descricao.toUpperCase(),
    cartaovinculado: {nome:cardvinculado},
      dataparcela: data1parc0,
      enq: "cartao",
      valorparcela: this.meuForm.value.valorparc,
      origem: this.meuForm.value.origem.toLowerCase(),
      parcelasrestantes: this.meuForm.value.qtdeparc,
      qtdedeparcelas: this.meuForm.value.qtdeparc,
      saldorestante: (this.meuForm.value.qtdeparc)*(this.meuForm.value.valorparc),

      ultimaparcela: ultparc,
      valorcompra: this.meuForm.value.valorcompra,

      log: Timestamp.now()
  }

  console.log(parcgravar)

 await this.ps.saveParc(parcgravar)

//await this.ps.gerarFatura(parcgravar.cod,parcgravar.cartaovinculado.nome, data1parc0, this.meuForm.value.descricao.toUpperCase(), this.meuForm.value.qtdeparc, this.meuForm.value.valorparc)
 this.alertTitle = 'Sucesso';
this.alertMessage = 'Parcelamento gravado!';
this.alertType = 'success'
this.showAlert = true;

  this.ResetForm()




}

closeAlert(){
  this.showAlert = false;
}

}
