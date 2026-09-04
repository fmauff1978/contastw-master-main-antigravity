import { CommonModule } from '@angular/common';
import { Component, LOCALE_ID } from '@angular/core';
import { TimestampService } from '../../services/timestamp.service';
import { ContasService } from '../../services/contas.service';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { LctosService } from '../../services/lctos.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertComponent } from '../../shared/alert/alert.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ContasComponent } from '../contas/contas.component';
import { PainelcontasComponent } from "../painelcontas/painelcontas.component";

@Component({
  selector: 'app-gestaobd',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    AlertComponent,
    ModalComponent,
    ContasComponent,
    PainelcontasComponent
],
  templateUrl: './gestaobd.component.html',
  styleUrl: './gestaobd.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class GestaobdComponent {
  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  showModal: boolean = false;
  showModal2: boolean = false;
  selectedItem: any;
  readonly formconta = new FormGroup({
    agregado: new FormControl(''),
  });

  readonly formdata = new FormGroup({
    datainicio: new FormControl(''),
    datafim: new FormControl(''),
  });
  montante: number;
  montante2: number;
  p: any;

  fonte0: any[];
  fonte1: any[];
  fonte2: any[];
  fonte3: any[] = [];
  arrayObj = [
    'ativo',
    'passivo',
    'despesa',
    'receita',
    'resultado',
    'circulante',
    'imobilizado',
    'investimento',
    'realizável',
    'alimentação fora de casa',
    'educação',
    'familiares',
    'financeiras',
    'fopag',
    'imobiliárias',
    'lazer',
    'mobilidade',
    'ordinárias',
    'streaming',
    'cdc',
    'financiamento',
    'rotativo',
    'despesas liquidas',
    'compromissada',
    'gerenciável',
    'off',
    'DFO',
    'AUM',
  ];

  constructor(
    private cs: ContasService,
    private ts: TimestampService,
    private fs: FirestoreService,
    private ls: LctosService
  ) {
  
  }

  async fechamento2024() {
    this.cs
      .pegarContasParam('natureza', 'in', ['ativo', 'passivo'],"saldo","desc")
      .then(async (x) => {
        this.fonte0 = x;
        console.log(this.fonte0);

        for (let i = 0; i < this.fonte0.length; i++) {
          let id = this.fonte0[i].id;
          console.log(id);
          let saldo = this.fonte0[i].saldo;
          console.log(saldo);

          const docRef = doc(this.fs.db, 'contas2025', id);
          await updateDoc(docRef, { fechamento2024: saldo });

          console.log('atualiznado:' + id);
        }
      });
    console.log('terminado');
  }

  async gd2024() {
    this.cs.pegarContasParam('natureza', '==', 'despesa',"saldo", "desc").then(async (x) => {
      this.fonte0 = x;
      console.log(this.fonte0);

      for (let i = 0; i < this.fonte0.length; i++) {
        let id = this.fonte0[i].id;
        console.log(id);
        let gd2024 = this.fonte0[i].saldo / 366;
        console.log(gd2024);

        const docRef = doc(this.fs.db, 'contas2025', id);
        await updateDoc(docRef, { gd2024: gd2024 });

        console.log('atualiznado:' + id);
      }
    });
    console.log('terminado');
  }

  pesquisarDatas() {
    let agregado = this.formconta.value.agregado;
    let inicio = this.formdata.value.datainicio;
    let fim = this.formdata.value.datafim;

    console.log(agregado, inicio, fim);

    const naturezas = ['ativo', 'passivo', 'despesa', 'receita', 'resultado'];
    const enquadramentos = [
      'circulante',
      'imobilizado',
      'investimento',
      'realizável',
      'alimentação fora de casa',
      'educação',
      'familiares',
      'financeiras',
      'fopag',
      'imobiliárias',
      'lazer',
      'mobilidade',
      'ordinárias',
      'streaming',
      'cdc',
      'financiamento',
      'rotativo',
    ];
    const mod_despesas = ['compromissada', 'gerenciável', 'off'];

    const bucket = ['DFO'];

    const bucket1 = ['despesas liquidas'];

    if (naturezas.includes(agregado)) {
      this.ls.saldoporNatureza(
        'contadebitada.natureza',
        'contacreditada.natureza',
        agregado,
        inicio,
        fim
      );
      this.ls.value3$.subscribe((value) => {
        this.montante = value;
        console.log(this.montante);
      });
    } else if (enquadramentos.includes(agregado)) {
      this.ls.saldoporNatureza(
        'contadebitada.enquadramento',
        'contacreditada.enquadramento',
        agregado,
        inicio,
        fim
      );
      this.ls.value3$.subscribe((value) => {
        this.montante = value;
        console.log(this.montante);
      });
    } else if (mod_despesas.includes(agregado)) {
      this.ls.saldoporNatureza(
        'contadebitada.mod_despesa',
        'contacreditada.mod_despesa',
        agregado,
        inicio,
        fim
      );
      this.ls.value3$.subscribe((value) => {
        this.montante = value;
        console.log(this.montante);
      });
    } else if (bucket.includes(agregado)) {
      this.ls.saldoDFO(inicio, fim).then((x) => {
        this.montante = x;
        console.log(this.montante);
      });
    } else if (bucket1.includes(agregado)) {
      const inic = this.ts.converterDataForm(inicio);
      const fim0 = this.ts.converterDataForm(fim);
      this.ls.pegarLctoporModDespesa(inic, fim0).then((x) => {
        this.montante = x;
        console.log(this.montante);
      });
    } else {
    }
  }

  sortTable(column: string) {
    this.fonte3.sort((a, b) => {
      if (a[column] > b[column]) {
        return 1;
      }
      if (a[column] < b[column]) {
        return -1;
      }
      return 0;
    });
  }

  contasAtivas() {
    this.cs.pegarTodasContas(true).then((x) => {
      this.fonte3 = x;
      console.log(this.fonte3);
    });
  }

  contasInativas() {
    this.cs.pegarTodasContas(false).then((x) => {
      this.fonte3 = x;
      console.log(this.fonte3);
    });
  }

  async excluirData(item) {
    let id = item.id;
    let saldo = item.saldo;
    let check = item.em_uso;
    console.log(id, saldo, check);

    if (saldo == 0 && check == true) {
      const docRef = doc(this.fs.db, 'contas2025', id);
      await updateDoc(docRef, { em_uso: false });
      this.alertTitle = 'Sucesso';
      this.alertMessage = 'Conta desativada com sucesso!';
      this.alertType = 'success';
      this.showAlert = true;

      console.log('conta desativada com sucesso');
    } else if (saldo == 0 && check == false) {
      const docRef = doc(this.fs.db, 'contas2025', id);
      await updateDoc(docRef, { em_uso: true });

      this.alertTitle = 'Sucesso';
      this.alertMessage = 'Conta ativada com sucesso!';
      this.alertType = 'success';
      this.showAlert = true;
    } else {
      this.alertTitle = 'Erro';
      this.alertMessage =
        'É preciso zerar o saldo da conta antes de desativá-la';
      this.alertType = 'error';
      this.showAlert = true; // Mostra o alerta
      console.log('Saldo diferente de zero, não é possível desativar.');
    }
  }

  closeAlert() {
    this.showAlert = false;
  }

  editarData(item) {
    console.log('editadno');
    console.log(item);
    this.selectedItem = item;
    this.showModal = true;
  }

  cadastrar() {
    this.showModal2 = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async saveData(editedItem: any) {
    try {
      const docRef = doc(this.fs.db, 'contas2025', editedItem.id);
      await updateDoc(docRef, editedItem);

      // Recarrega os dados após a atualização
      if (editedItem.em_uso) {
        this.contasAtivas();
      } else {
        this.contasInativas();
      }

      this.alertTitle = 'Sucesso';
      this.alertMessage = 'Conta alterada com sucesso!';
      this.alertType = 'success';
      this.showAlert = true;
      console.log('Conta atualizada com sucesso:', editedItem);
    } catch (error) {
      console.error('Erro ao atualizar a conta:', error);
      this.alertTitle = 'Erro';
      this.alertMessage = 'Erro ao alterar conta, tente novamente!';
      this.alertType = 'error';
      this.showAlert = true;
    }
  }
}
