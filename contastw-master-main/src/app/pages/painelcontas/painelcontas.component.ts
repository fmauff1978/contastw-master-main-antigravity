import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { Contas2Service } from '../../services/contas2.service';

import {
  collection,
  where,
  orderBy,
  getDocs,
  query,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertComponent } from '../../shared/alert/alert.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ContasComponent } from '../contas/contas.component';

@Component({
  selector: 'app-painelcontas',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    AlertComponent,
    ModalComponent,
    ContasComponent,
  ],
  templateUrl: './painelcontas.component.html',
  styleUrl: './painelcontas.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class PainelcontasComponent implements OnInit {
  contas: any[] = [];
  p: any;
  sortKey = 'cod';
  sortAsc = true;
  filterCod = '';
  filterId = '';
  filterConta = '';
  filterNatureza = '';
  filterEnquadramento = '';
  filterModDespesa = '';
  filterAtiva = '';
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

  fonte0: any[];
  fonte1: any[];
  fonte2: any[];
  fonte3: any[] = [];

  async ngOnInit() {
    this.contas = await this.pegarContas();
    // Ordenação inicial já vem do Firestore (orderBy 'cod' asc)
  }

  termoBuscaGlobal = '';
  filtroStatus: 'todas' | 'ativas' | 'inativas' = 'todas';

  get saldoConsolidadoTotal(): number {
    return this.contas.reduce((acc, c) => acc + (Number(c.saldo) || 0), 0);
  }

  get contasAtivasCount(): number {
    return this.contas.filter((c) => c.em_uso === true).length;
  }

  get contasInativasCount(): number {
    return this.contas.filter((c) => !c.em_uso).length;
  }

  get filteredContas() {
    const filterText = (value: any, filter: string) => {
      if (!filter) {
        return true;
      }
      const normalizedValue =
        value == null ? '' : value.toString().toLowerCase();
      return normalizedValue.includes(filter.trim().toLowerCase());
    };

    const globalTerm = this.termoBuscaGlobal.toLowerCase().trim();

    return this.contas.filter((item) => {
      const emUsoText =
        item.em_uso === true
          ? 'sim'
          : item.em_uso === false
            ? 'não'
            : (item.em_uso?.toString() ?? '');

      // Filtro de status
      if (this.filtroStatus === 'ativas' && !item.em_uso) return false;
      if (this.filtroStatus === 'inativas' && item.em_uso) return false;

      // Filtro global
      if (globalTerm) {
        const matchesGlobal =
          (item.cod != null &&
            String(item.cod).toLowerCase().includes(globalTerm)) ||
          (item.id && item.id.toLowerCase().includes(globalTerm)) ||
          (item.conta && item.conta.toLowerCase().includes(globalTerm)) ||
          (item.natureza && item.natureza.toLowerCase().includes(globalTerm)) ||
          (item.enquadramento &&
            item.enquadramento.toLowerCase().includes(globalTerm)) ||
          (item.mod_despesa &&
            item.mod_despesa.toLowerCase().includes(globalTerm));
        if (!matchesGlobal) return false;
      }

      return (
        filterText(item.cod, this.filterCod) &&
        filterText(item.id, this.filterId) &&
        filterText(item.conta, this.filterConta) &&
        filterText(item.natureza, this.filterNatureza) &&
        filterText(item.enquadramento, this.filterEnquadramento) &&
        filterText(item.mod_despesa, this.filterModDespesa) &&
        filterText(emUsoText, this.filterAtiva)
      );
    });
  }

  cs = inject(Contas2Service);
  fs = inject(FirestoreService);

  sortTable(key: string) {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }

    this.contas.sort((a: any, b: any) => {
      const aValue = a?.[key];
      const bValue = b?.[key];

      const normalize = (value: any) => {
        if (value == null) return '';
        if (value instanceof Date) return value.getTime();
        if (typeof value === 'string') return value.toLowerCase();
        return value;
      };

      const aNorm = normalize(aValue);
      const bNorm = normalize(bValue);

      if (aNorm === bNorm) return 0;
      const comparison = aNorm > bNorm ? 1 : -1;
      return this.sortAsc ? comparison : -comparison;
    });
  }

  async pegarContas() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,

      orderBy('cod', 'asc'),
    );

    const qs = await getDocs(q);

    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => {
      const raw = doc.data() as any;
      const atualizacao = raw.atualizado_em?.toDate?.() ?? raw.atualizacao;
      return {
        id: doc.id,
        ...raw,
        atualizacao,
      };
    });

    return contasData; // Log the retrieved data
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
      // Atualizar a tabela
      this.contas = await this.pegarContas();
      this.sortTable(this.sortKey);
    } else if (saldo == 0 && check == false) {
      const docRef = doc(this.fs.db, 'contas2025', id);
      await updateDoc(docRef, { em_uso: true });

      this.alertTitle = 'Sucesso';
      this.alertMessage = 'Conta ativada com sucesso!';
      this.alertType = 'success';
      this.showAlert = true;
      // Atualizar a tabela
      this.contas = await this.pegarContas();
      this.sortTable(this.sortKey);
    } else {
      this.alertTitle = 'Erro';
      this.alertMessage =
        'É preciso zerar o saldo da conta antes de desativá-la';
      this.alertType = 'error';
      this.showAlert = true; // Mostra o alerta
      console.log('Saldo diferente de zero, não é possível desativar.');
    }
  }

  editarData(item) {
    console.log('editadno');
    console.log(item);
    this.selectedItem = item;
    this.showModal = true;
  }

  closeAlert() {
    this.showAlert = false;
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
      this.contas = await this.pegarContas();

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
