import { TimestampService } from './../../../../services/timestamp.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { addDoc, collection } from 'firebase/firestore';
import { FirestoreService } from '../../../../services/firestore.service';

@Component({
  selector: 'app-cad-patr',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cad-patr.component.html',
  styleUrl: './cad-patr.component.css'
})
export class CadPatrComponent {

   @Input() showModalCadPatr: boolean = false;
    @Input() item: any; // Item a ser editado

   @Output() close = new EventEmitter<void>();
   @Output() save = new EventEmitter<any>();

    editedItem: any;
  meuForm: any;
  ts = inject (TimestampService)
  fs = inject (FirestoreService)

  constructor(){


    this.iniciarmeuForm()
    this.fs.conectar()
  }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['item'] && this.item) {
        this.editedItem = { ...this.item }; // Cria uma cópia para edição

        console.log(this.editedItem);
      }
    }

     closeModal() {
        this.showModalCadPatr = false;
        this.close.emit();
      }

      async saveChanges() {

        this.save.emit(this.editedItem);

        console.log(this.meuForm.value);

        let mes = this.ts.converterDataForm(this.meuForm.value.data);


        let bem = this.meuForm.value.bem;
        let vlr = this.meuForm.value.vlrcompra;


        const patr = {
          data_compra: mes,

          nome: bem,
          valor_aquisicao: vlr,
          valor_atual: vlr,
          ativo: true
        }

     console.log(patr);

     try {
      const colRef = collection(this.fs.db, 'patr');
      const docRef = await addDoc(colRef, patr);
      console.log('Lançamento criado com o ID:', docRef.id);

      // Emite o evento após salvar no Firestore
      this.save.emit(patr);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }




      this.closeModal();

      }

      iniciarmeuForm() {
        this.meuForm = new FormGroup({
          data: new FormControl('', Validators.required),
          bem: new FormControl('', Validators.required),
          vlrcompra: new FormControl('', Validators.required),
        });
      }

      ResetForm() {
        this.meuForm.reset();
        console.log('formulario resetado');
      }





}
