import { Component, computed, inject, signal, Signal } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { CadPatrComponent } from '../../shared/modal/patr/cad-patr/cad-patr.component';
import { EditPatrComponent } from "../../shared/modal/patr/edit-patr/edit-patr.component";

@Component({
  selector: 'app-patrimonio',
  imports: [CommonModule, CadPatrComponent, EditPatrComponent],
  templateUrl: './patrimonio.component.html',
  styleUrl: './patrimonio.component.css',
})
export class PatrimonioComponent {

  showModalEdit = false;
  patr = signal<any[]>([]);
  somapatr = signal<number | null>(null);
  showModalCadPatr: boolean;
  fs = inject(FirestoreService);
  selectedItem: any;

  constructor() {
    this.fs.conectar();
    this.initializePatr();
  }

  async initializePatr() {
    this.patr.set(await this.pegarPatr());
    console.log(this.patr());
    this.somapatr.set(await this.totalizar(this.patr()));
    console.log(this.somapatr());
  }

  async pegarPatr() {
    const colRef = collection(this.fs.db, 'patr');
    const qs0 = query(
      colRef,
      where('ativo', '==', true),

      orderBy('valor_atual', 'desc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  totalizar(fonte) {
    const total = computed(() => fonte.reduce((a, b) => a + b.valor_atual, 0));
    return total();
  }

  saveData() {
    this.showModalCadPatr = false; // Fecha o modal

    this.initializePatr();
  }

  cadastrar() {
    console.log('cadastrando');
    this.showModalCadPatr = true;
  }

  closeModal() {
    this.showModalCadPatr = false;
  }

  editar(item) {
    console.log('editando');
    this.selectedItem = item;
    this.showModalEdit = true;
  }
}
