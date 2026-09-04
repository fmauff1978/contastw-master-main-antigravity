import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { FirestoreService } from './../../services/firestore.service';
import { Component, LOCALE_ID, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPreviComponent } from '../../shared/modal/modal-previ/modal-previ.component';
import { ModalcadPreviComponent } from "../../shared/modal/modalcad-previ/modalcad-previ.component";

@Component({
  selector: 'app-previ',
  imports: [CommonModule, ModalPreviComponent, ModalcadPreviComponent],
  templateUrl: './previ.component.html',
  styleUrl: './previ.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class PreviComponent implements OnInit {



indice = 0;
showModal: boolean = false;
showModal2: boolean = false;
showModal3: boolean = false;
  selectedItem: any;
  previ = signal<any[]>([]);
 ultmes : any
 ultsdo: any

 sortTable(arg0: string) {
  throw new Error('Method not implemented.');
  }



  constructor(private fs: FirestoreService) {
    this.fs.conectar();


    this.pegarUltSdoFimPrevi()


  }
  ngOnInit(): void {

    this.pegarPrevi();

  }

  async pegarPrevi() {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(
      colRef,

      orderBy('mes', 'desc')
    );

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    this.previ.set(items);
    console.log('Array de objetos do Firestore:', this.previ());
  }


  isOlderThanThreshold(number): boolean {
    return number < this.indice;
  }

  editarData(item){

    this.selectedItem = item;
    this.showModal = true;


  }

  closeModal() {
    this.showModal = false;
}

async pegarUltMesPrevi() {
  const colRef = collection(this.fs.db, 'previ');
  const q = query(
    colRef,

    orderBy('mes', 'desc'), limit(1)
  );

  const qs = await getDocs(q);
  const items: any[] = [];
  qs.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  this.ultmes = items[0].mes
  //console.log(this.ultmes)

  return this.ultmes
}

async pegarUltSdoFimPrevi() {
  const colRef = collection(this.fs.db, 'previ');
  const q = query(
    colRef,

    orderBy('mes', 'desc'), limit(1)
  );

  const qs = await getDocs(q);
  const items: any[] = [];
  qs.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  this.ultsdo = items[0].saldo_final
  console.log(this.ultsdo)

  return this.ultsdo
}


abrirForm() {
 console.log("cadastrando")
 this.showModal3 = true;
  }

  saveData() {
    this.showModal3 = false;

    this.pegarPrevi(); // Atualiza a lista após salvar
  }
}
