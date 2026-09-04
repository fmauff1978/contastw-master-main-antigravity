import { CommonModule } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { Agreg2Service } from '../../services/agreg2.service';
import { BmarkService } from '../../services/bmark.service';
import { FirestoreService } from '../../services/firestore.service';
import { RecliquidaService } from '../../services/recliquida.service';
import { TimestampService } from '../../services/timestamp.service';
import { Timestamp } from 'firebase/firestore';


@Component({
  selector: 'app-agregados',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ToastModule,
    ButtonModule,
    CommonModule,
    SpinnerComponent,
  
  ],
  templateUrl:  './agregados.component.html',
  styleUrl: './agregados.component.css',
})
export class AgregadosComponent {
  ag2 = inject(Agreg2Service);
  bmk = inject(BmarkService);
  fs = inject(FirestoreService);
  ts = inject(TimestampService);
  rl = inject(RecliquidaService);

  basicData: any;
  basicData2: any;
  basicData0: any;
  log1: Timestamp;

  agreg: any[] = [];
  agreg950: any[] = [];
  valoresordenados: any[] = [];
  customers = ['Natureza', 'Enquadramentos', 'Modalidade Despesa', 'Derivados'];
  agregadosordenados: any[] = [];
  mes = new Date().getMonth();
  isLoading = false;
  fonte: any[] = [];
  fonte2: any[] = [];
  index = this.mes + 62;

  basicOptions: any;

  platformId = inject(PLATFORM_ID);

  async ngOnInit() {
    this.log1 = await this.ts.log();
    console.log(this.log1);
    this.agregadosordenados = await this.ag2.pegarDespEnq();

    this.pegarAgreg();
    this.pegar950();
  }

   async pegarAgreg() {

    this.agreg = await this.ag2.pegarTab();
   
  }

 

  async pegarDespEnq() {

    this.agregadosordenados = await this.ag2.pegarDespEnq();
   
  }

  async pegar950() {
    
   this.agreg950 = await this.ag2.pegarTab2();
    
  }

  sortTable(valor){

    console.log(valor)
  }
}
