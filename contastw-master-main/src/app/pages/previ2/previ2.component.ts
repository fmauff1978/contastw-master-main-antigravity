import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalcadPreviComponent } from '../../shared/modal/modalcad-previ/modalcad-previ.component';
import { ModalPreviComponent } from '../../shared/modal/modal-previ/modal-previ.component';
import { BmarkService } from '../../services/bmark.service';
import { AumService } from '../../services/aum.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-previ2',
  imports: [
    CommonModule,
    FormsModule,
    ModalcadPreviComponent,
    ModalPreviComponent,
    NgxPaginationModule,
  ],
  templateUrl: './previ2.component.html',
  styleUrl: './previ2.component.css',
})
export class Previ2Component implements OnInit {
  fs = inject(FirestoreService);
  bm = inject(BmarkService);
  as = inject(AumService);

  resgate = signal<number | null>(null);
  previ = signal<any[]>([]);
  showModal: boolean = false;
  showModal2: boolean = false;
  showModal3: boolean = false;
  selectedItem: any;
  selectedItem2: any;
  taxaano: any;
  anoatual: number = new Date().getFullYear();
  ano: number = new Date().getFullYear() - 1;
  p: number = 1;
  pageSize = 12;
  currentIndex = 0;
  startIndex = 0;
  endIndex = this.pageSize;
  lastDoc: any = null;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  tableSize: number[] = [5, 10, 12, 20];

  // Filtros e métricas computadas
  termoBusca = signal<string>('');

  ultimoSaldo = computed(() => {
    return this.previ().length > 0 ? this.previ()[0]?.saldo_final || 0 : 0;
  });

  totalContribuicoes = computed(() => {
    return this.previ().reduce(
      (acc, item) => acc + (Number(item.contribuicao) || 0),
      0,
    );
  });

  totalRendimentos = computed(() => {
    return this.previ().reduce(
      (acc, item) => acc + (Number(item.rendimento) || 0),
      0,
    );
  });

  previFiltrada = computed(() => {
    const termo = this.termoBusca().toLowerCase().trim();
    if (!termo) return this.previ();
    return this.previ().filter((item) => {
      if (!item.mes) return false;
      const dataStr = item.mes.toDate
        ? item.mes.toDate().toLocaleDateString('pt-BR')
        : '';
      return dataStr.includes(termo);
    });
  });

  constructor() {
    //his.taxaanualValue = await this.taxaAnual()
  }

  isOlderThanThreshold(number): boolean {
    return number < 0;
  }

  incluir() {
    console.log('cadastrando');
    this.showModal3 = true;
  }

  async ngOnInit() {
    this.fs.conectar();
    this.pegarUltSdoFimPrevi();
    this.pegarPrevi();

    this.taxaano = await this.taxaAnual();
  }

  editarData(item) {
    console.log('editando');
    this.selectedItem = item;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.pegarUltSdoFimPrevi();
    this.pegarPrevi();
  }

  async pegarUltSdoFimPrevi() {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(
      colRef,

      orderBy('mes', 'desc'),
      limit(1),
    );

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    console.log(items[0].saldo_final);
    this.resgate.set(items[0].saldo_final * 0.9);
    console.log(this.resgate());

    return this.resgate();
  }

  async pegarPrevi() {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(
      colRef,

      orderBy('mes', 'desc'),
    );

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    this.previ.set(items);
    console.log('Array de objetos do Firestore:', this.previ());
    //await this.criarReg();

    // let teste = await this.bm.pegarAUM();
    // console.log(teste)
    // await this.atualizarAUM();
  }

  async pegarCalcRendAnual() {
    const refdata = Timestamp.fromDate(new Date(this.ano, 11, 31));
    console.log(refdata);
    const colRef = collection(this.fs.db, 'previ');
    const q = query(colRef, where('mes', '>=', refdata));

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    console.log('Array de objetos do Firestore:', items);
    return items;

    // let teste = await this.bm.pegarAUM();
    // console.log(teste)
    // await this.atualizarAUM();
  }

  async taxaAnual() {
    const rendimentos = await (
      await this.pegarCalcRendAnual()
    ).map((item) => item.rentabilidade);
    const rendimentoAnual0 = this.calcularRendimentoAcumulado(rendimentos);
    const rendimentoAnual =
      Math.round((rendimentoAnual0 + Number.EPSILON) * 100) / 100;

    console.log(rendimentoAnual);
    //  console.log('Rendimento Anual:', rendimentoAnual.toFixed(2) + '%');
    return rendimentoAnual;
  }

  saveData() {
    this.showModal = false;

    this.pegarPrevi(); // Atualiza a lista após salvar
    this.pegarUltSdoFimPrevi();
  }

  calcularRendimentoAcumulado(rendimentos: number[]): number {
    const fatorAcumulado = rendimentos.reduce((acc, r) => acc * (1 + r), 1);
    return (fatorAcumulado - 1) * 100;
  }
}
