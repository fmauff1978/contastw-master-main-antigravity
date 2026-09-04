import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { collection, query, orderBy, limit, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { FirestoreService } from '../../../services/firestore.service';
import { TimestampService } from '../../../services/timestamp.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modalcadoutroscredores',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modalcadoutroscredores.component.html',
  styleUrl: './modalcadoutroscredores.component.css'
})
export class ModalcadoutroscredoresComponent {
   fs = inject (FirestoreService)
    ts = inject (TimestampService)
    router = inject (Router)
    ultmes: any;
    ultcod : number;

    constructor() { this.pegarUltCodOC()
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



    async pegarUltCodOC() {
      const colRef = collection(this.fs.db, 'outroscredores');
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

      let valor = this.meuForm.value.saldo;
      let cod = await this.ultcod + 1;




     const prov = {

      ativo: true,
      atualizacao : Timestamp.now(),
      cod: cod,
      data: mes,
      descricao: descricao,
      saldo: valor,

     }



      console.log(prov);

  await this.gravarOC(prov);
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

    async gravarOC(prov) {
      const colRef = collection(this.fs.db, 'outroscredores');
      addDoc(colRef, prov).then((docRef) => {
        console.log('PRovisão criado com o ID:', docRef.id);
      });
    }

    navigateToComponent() {
      this.router.navigate(['/oc']);
    }

}
