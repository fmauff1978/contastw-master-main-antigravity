import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { collection, query, orderBy, limit, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { FirestoreService } from '../../../services/firestore.service';
import { TimestampService } from '../../../services/timestamp.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modalcadprov',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modalcadprov.component.html',
  styleUrl: './modalcadprov.component.css'
})
export class ModalcadprovComponent {

  fs = inject (FirestoreService)
  ts = inject (TimestampService)
  router = inject (Router)
  ultmes: any;
  ultcod : number;

  constructor() { this.pegarUltCodProv()
    this.iniciarmeuForm()
  }

  @Input() showModal3: boolean = false;
  @Input() item: any; // Item a ser editado

 @Output() close = new EventEmitter<void>();
 @Output() save = new EventEmitter<any>();

  editedItem: any;
  meuForm: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editedItem = { ...this.item }; // Cria uma cópia para edição

      console.log(this.editedItem);
    }
  }



  async pegarUltCodProv() {
    const colRef = collection(this.fs.db, 'provisoes');
    const q = query(
      colRef,
      orderBy('cod', 'desc'),
      limit(1)
    );

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    this.ultcod = items[0].cod;
    console.log(this.ultcod);

    // return this.resgate()
  }

  closeModal() {
    this.showModal3 = false;
    this.close.emit();
  }

  async saveChanges() {
    this.save.emit(this.editedItem);

    console.log(this.meuForm.value);

    let mes = this.ts.converterDataForm(this.meuForm.value.mes);


    let descricao = this.meuForm.value.descricao;
    let vinculo = this.meuForm.value.vinculo;
    let valor = this.meuForm.value.saldo;
    let cod = await this.ultcod + 1;




   const prov = {

    ativo: true,
    atualizacao : Timestamp.now(),
    cod: cod,
    data: mes,
    descricao: descricao,
    saldo: valor,
    vinculo: vinculo
   }



    console.log(prov);

await this.gravarProvisao(prov);
 await this.save.emit(prov);
  //  this.pegarUltSdoPrevi();


  this.closeModal();

  }

  iniciarmeuForm() {
    this.meuForm = new FormGroup({
      mes: new FormControl('', Validators.required),
      descricao: new FormControl('', Validators.required),
      vinculo: new FormControl('', Validators.required),
      saldo: new FormControl('', Validators.required)
    });
  }

  ResetForm() {
    this.meuForm.reset();
    console.log('formulario resetado');
  }

  async gravarProvisao(prov) {
    const colRef = collection(this.fs.db, 'provisoes');
    addDoc(colRef, prov).then((docRef) => {
      console.log('PRovisão criado com o ID:', docRef.id);
    });
  }

  navigateToComponent() {
    this.router.navigate(['/prov']);
  }

}
