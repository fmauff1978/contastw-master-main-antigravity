import { BmarkService } from './../../../services/bmark.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  Signal,
} from '@angular/core';

import { ChartModule } from 'primeng/chart';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Agreg2Service } from '../../../services/agreg2.service';
import { SpinnerComponent } from '../../spinner/spinner.component';

import {
  collection,
  where,
  getDocs,
  orderBy,
  query,
  DocumentData,
  CollectionReference,
  Timestamp,
} from 'firebase/firestore';
import { FirestoreService } from '../../../services/firestore.service';
import { TimestampService } from '../../../services/timestamp.service';
import { RecliquidaService } from '../../../services/recliquida.service';

@Component({
  selector: 'app-graf',
  imports: [
    ChartModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ToastModule,
    ButtonModule,
    CommonModule,
    SpinnerComponent,
  ],
  providers: [MessageService],

  templateUrl: './graf.component.html',
  styleUrl: './graf.component.css',
})
export class GrafComponent implements OnInit {
  onRowCollapse($event: any) {
    throw new Error('Method not implemented.');
  }
  onRowExpand($event: any) {
    throw new Error('Method not implemented.');
  }
  products: any;
  expandedRows: any;
  sortTable(arg0: string) {
    throw new Error('Method not implemented.');
  }

  basicData: any;
  basicData2: any;
  basicData0: any;
  log1: Timestamp;

  agreg = signal<any[]>([]);
  agreg950 = signal<any[]>([]);
  valoresordenados = signal<any[]>([]);
  customers = ['Natureza', 'Enquadramentos', 'Modalidade Despesa', 'Derivados'];
  agregadosordenados = signal<any[]>([]);
  mes = new Date().getMonth();

  basicOptions: any;

  platformId = inject(PLATFORM_ID);

  ag2 = inject(Agreg2Service);
  bmk = inject(BmarkService);
  fs = inject(FirestoreService);
  ts = inject(TimestampService);
  rl = inject(RecliquidaService);

  isLoading = false;
  fonte: any[] = [];
  fonte2: any[] = [];
  index = this.mes + 62;

  //configService = inject(AppConfigService);

  constructor(private cd: ChangeDetectorRef) {}

  themeEffect = effect(() => {
    // if (this.configService.transitionComplete()) {
    //   if (this.designerService.preset()) {
    //   this.initChart();
    //}
    //}
  });

  async ngOnInit() {
    this.log1 = await this.ts.log();
    console.log(this.log1);
    let data = await this.ag2.pegarDespEnq();
    this.agregadosordenados.set(data);
    // this.atualizarAUM()
    // this.ag2.atualizarAUM(this.mes, this.index);
    // this.ag2.atualizarAUM(this.mes - 1, this.index - 1);
    // this.pegarDespEnq();

    this.pegarAgreg();
    this.pegar950();
  }

  async pegarAgreg() {
    let data: any[] = [];
    data = await this.ag2.pegarTab();
    this.agreg.set(data);
    console.log(this.agreg());
  }

 

  async pegarDespEnq() {
    let data: any[] = [];
    data = await this.ag2.pegarDespEnq();
    this.agregadosordenados.set(data);
    console.log(this.agregadosordenados());
  }

  async pegar950() {
    let data: any[] = [];
    data = await this.ag2.pegarTab2();
    this.agreg950.set(data);
    console.log(this.agreg());
  }

  // async atualizar() {
  //   this.isLoading = true;
  //   await this.ag2.menosum();
  //   await this.ag2.menosum2();
  //   await this.ag2.menosum3();
  //   await this.rl.atualizarRecLiq(12);
  //   await this.rl.atualizarRecLiq(this.mes - 1);
   
  //   //await this.ag2.menosum4();
  //   await this.ag2.menosum5();

  //   await this.ag2.DFO(this.mes, this.fonte);
  //   await this.ag2.DFO(this.mes - 1, this.fonte2);
  //   // await this.ag2.totalizador();

  //   await this.pegarAgreg();
  //   await this.pegar950();

  //   await this.ag2.totalizador();

  //   this.isLoading = false;
  // }

  async consulta(id) {
    let data: any[] = [];

    data = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      'ano2025'
    );
    console.log(data);
    const valoresOrdenados = this.ag2.mesesCampos.map((chaveMes) => {
      // Para cada chave na ordem correta (ex: 'jan'), busca o valor em ano2025
      // Se a chave existir em ano2025, retorna o valor.
      // Se por acaso uma chave não existir no objeto ano2025, retornará 'undefined'.
      // Você pode adicionar um valor padrão se preferir, como 0:
      // return ano2025[chaveMes] !== undefined ? ano2025[chaveMes] : 0;
      // Ou usando o operador Nullish Coalescing (??) que trata null e undefined:
      return data[chaveMes] ?? null; // Retorna o valor ou 0 se for null/undefined
    });
    const valoresFinais = valoresOrdenados.map((valor) =>
      valor === 0 ? null : valor
    );
    console.log(valoresOrdenados);
    //this.valoresordenados.set(valoresOrdenados)
    return valoresFinais;
  }

  async consultaNegativos(id) {
    let data: any[] = [];

    data = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      'ano2025'
    );
    console.log(data);
    const valoresOrdenados = this.ag2.mesesCampos.map((chaveMes) => {
      // Para cada chave na ordem correta (ex: 'jan'), busca o valor em ano2025
      // Se a chave existir em ano2025, retorna o valor.
      // Se por acaso uma chave não existir no objeto ano2025, retornará 'undefined'.
      // Você pode adicionar um valor padrão se preferir, como 0:
      // return ano2025[chaveMes] !== undefined ? ano2025[chaveMes] : 0;
      // Ou usando o operador Nullish Coalescing (??) que trata null e undefined:
      return data[chaveMes] ?? null; // Retorna o valor ou 0 se for null/undefined
    });

    const numerosMultiplicados = valoresOrdenados.map((numero) => {
      if (numero === 0 || numero === null) {
        return null; // Garante que 0 e null se tornem null
      }
      return numero * -1;
    });

    return numerosMultiplicados;
  }
}
