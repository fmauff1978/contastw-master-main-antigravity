import { Component, LOCALE_ID } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ContasService } from '../../services/contas.service';
import { CommonModule } from '@angular/common';
import { LctosService } from '../../services/lctos.service';
import { FirestoreService } from '../../services/firestore.service';
import { NgxPaginationModule } from 'ngx-pagination'; // <-- import the module
import { PaginatePipe, PaginationControlsComponent } from 'ngx-pagination';
import { PaginationInstance } from 'ngx-pagination'; // Import PaginationInstance
import { RouterModule } from '@angular/router';
import { TimestampService } from '../../services/timestamp.service';
import { AlertComponent } from '../../shared/alert/alert.component';
@Component({
  selector: 'app-pl3',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    RouterModule, AlertComponent
  ],
  templateUrl: './pl3.component.html',
  styleUrl: './pl3.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class Pl3Component {
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  tableSize: number[] = [5, 10, 15, 20];

  readonly formconta = new FormGroup({
    conta: new FormControl(''),
  });

  readonly formdata = new FormGroup({
    datainicio: new FormControl(''),
    datafim: new FormControl(''),
  });
  readonly formregistro = new FormGroup({
    registro: new FormControl(''),
  });

  fonte1: any[] = [];
  lctos: any[] = [];
  fonte0: any[] = [];
  montante: number
  p: number = 1;
  pageSize = 15;
  currentIndex = 0;
  startIndex = 0;
  endIndex = this.pageSize;
  lastDoc: any = null;
  sortBy = 'datalcto';

  currentSortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false
  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private cs: ContasService,
    private ls: LctosService,
    private fs: FirestoreService,
    private ts: TimestampService)

    {
      // this.ls.saldoporNatureza("contadebitada.mod_despesa", "contacreditada.mod_despesa", "compromissada", '2024-01-01', '2024-12-31')
      // this.ls.value3$.subscribe((value) => {
      //   this.montante = value

      //   console.log(this.montante)
      //   ;})

      }








  // ) { this.ls.totalizarporNatureza("contadebitada.natureza", "ativo", '2024-01-01', '2024-12-31').then((x)=>{
  //   this.lctos = x;
  //   console.log(this.lctos)
  // })
  // this.ls.totalizarporNatureza("contacreditada.natureza", "ativo", '2024-01-01', '2024-12-31').then((x)=>{
  //   this.lctos = x;
  //   console.log(this.lctos)
  // })


  closeAlert(){
    this.showAlert = false;
  }


  ngOnInit() {
    this.cs.pegarTodasContas(true).then((items) => {
      this.fonte1 = items;
    });
  }

  pageChanged(event: any) {
    this.currentPage = event.page;
  }

  getTotalItems() {
    // Fetch the total number of items from your service
    this.pesquisar(); //Directly fetch the total items
  }

  sortTable(column: string) {
    if (this.currentSortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        this.currentSortColumn = column;
        this.sortDirection = 'asc'; // Reset para crescente quando nova coluna é selecionada
    }

    this.fonte0.sort((a, b) => {
      const comparison = this.compareValues(a[column], b[column]);
        return this.sortDirection === 'asc' ? comparison : -comparison; // Aplica a direção da ordenação
      });
  }


    private compareValues(a: any, b: any): number {
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return -1;
        }
        return 0;
    }



  // sortTable(column: string) {
  //   this.fonte0.sort((a, b) => {
  //     if (a[column] > b[column]) {
  //       return 1;
  //     }
  //     if (a[column] < b[column]) {
  //       return -1;
  //     }
  //     return 0;
  //   });
  // }

  ResetForm() {
    this.formconta.reset();
  }
  ResetForm2() {
    this.formdata.reset();
  }

  pesquisar() {
    let conta = this.formconta.value.conta;
    this.ls.juntarContasDebCred(conta);

    this.ls.value$.subscribe((value) => {
      this.fonte0 = value;
      this.currentPage = 1;
    });

    this.ResetForm();
  }

  pesquisarReg() {
    let registro = this.formregistro.value.registro;

    console.log(registro);

    this.ls.pegarLctosporReg(registro).then((x) => {
      this.fonte0 = x;
      this.currentPage = 1;
    });

    this.ResetForm();
  }

  async excluirData(row) {
    console.log('delete');
    console.log(row);
    let contadeb_id = row.contadebitada.id;
    console.log(contadeb_id);
    let contacred_id = row.contacreditada.id;
    console.log(contacred_id);
    let valoraestornar = row.valor;
    let id = row.id;

    try {
      await this.ls.estornar0(contadeb_id, valoraestornar);
      await this.ls.estornar1(contacred_id, valoraestornar);
      await this.ls.excluirData(id);

      // Remove o item imediatamente do array para atualizar a tela
      this.fonte0 = this.fonte0.filter(item => item.id !== id);
      console.log('Item removido do array. Fonte0 agora tem:', this.fonte0.length, 'itens');

      this.alertTitle = 'Sucesso';
      this.alertMessage = 'Lançamento Excluido!';
      this.alertType = 'success'
      this.showAlert = true;
    } catch (error) {
      console.error('Erro ao excluir:', error);
      this.alertTitle = 'Erro';
      this.alertMessage = 'Erro ao excluir o lançamento!';
      this.alertType = 'error'
      this.showAlert = true;
    }
  }

  pesquisarDatas() {
    let conta = this.formconta.value.conta;
    let inicio = this.formdata.value.datainicio;
    let fim = this.formdata.value.datafim;

    console.log(conta, inicio, fim);  

    if (this.formdata.value.datainicio == null || this.formdata.value.datafim == null) {
      this.pesquisar();
    } else if(this.formconta.value.conta == null) {
      let inicio0 = this.ts.converterDataForm(inicio);
      let fim0 = this.ts.converterDataForm(fim);

      this.ls.pegarLctosporDatas(inicio0,fim0)
      .then((x) => {
        this.fonte0 = x;
        this.currentPage = 1;
      });
    } else {
      let inicio0 = this.ts.converterDataForm(inicio);
      let fim0 = this.ts.converterDataForm(fim);
      console.log(inicio0, fim0);

      this.ls.pegarLctosContaDataGlobal(conta, inicio0, fim0);
      this.ls.value2$.subscribe((value) => {
        this.fonte0 = value;
        this.currentPage = 1;
      });

      this.ResetForm();
      this.ResetForm2();
    }
  }

  reexecutarFiltro() {
    const conta = this.formconta.value.conta;
    const datainicio = this.formdata.value.datainicio;
    const datafim = this.formdata.value.datafim;
    const registro = this.formregistro.value.registro;

    console.log('Reexecutando filtro - Conta:', conta, 'Registro:', registro);

    // Se houver um registro sendo filtrado
    if (registro) {
      console.log('Reexecutando pesquisarReg');
      this.pesquisarReg();
      return;
    }

    // Se houver datas preenchidas
    if (datainicio || datafim) {
      console.log('Reexecutando pesquisarDatas');
      this.pesquisarDatas();
      return;
    }

    // Se houver uma conta preenchida
    if (conta) {
      console.log('Reexecutando pesquisar');
      this.pesquisar();
      return;
    }

    // Se nenhum filtro foi aplicado
    this.ngOnInit();
  }
}
