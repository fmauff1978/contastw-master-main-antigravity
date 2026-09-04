import { CommonModule } from '@angular/common';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ParcelamentosService } from '../../services/parcelamentos.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-parcelamentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    RouterModule,
    SpinnerComponent

],
  templateUrl: './parcelamentos.component.html',
  styleUrl: './parcelamentos.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class ParcelamentosComponent implements OnInit {
  fonte0: any[] = [];
  p: any;
  meuForm: FormGroup;
  isLoading = false
  montante: number;
  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  hoje0 = new Date().getDate()
  currentSortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private ps: ParcelamentosService) {
    //this.isLoading = true


  }

   ngOnInit() {


      this.ps.pegarParc()
        .then(async (x) => {
          this.fonte0 = x;
          console.log(this.fonte0);

          this.atualizarMontante();
          console.log(this.montante);


          console.log(this.hoje0)

          if (this.hoje0 > 21){

            await this.atualizar()


          }

          //await this.atualizar()

         // this.isLoading = false; // Mova esta linha para cá
        });
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

  formregistro: any;
  pesquisarReg() {
    throw new Error('Method not implemented.');
  }

  excluirData(item){
    console.log("excluindo")
    console.log(item);
  let id = item.id;

  this.ps.desativarParcelamento(id)




}

atualizarMontante() {
  this.montante = this.fonte0.reduce((a, b) => a + b.saldorestante, 0);
}

async atualizar(){
  this.isLoading = true;
  try {
    this.fonte0 = await this.ps.atualizarparc();
    this.atualizarMontante();
    console.log('Parcelamentos atualizados com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar parcelamentos:', error);
  } finally {
    this.isLoading = false;
  }
}
}
