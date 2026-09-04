import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FirestoreService } from '../../../../services/firestore.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-patr',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-patr.component.html',
  styleUrl: './edit-patr.component.css'
})
export class EditPatrComponent {

   ultmes: any
    editedItem: any;
   meuForm: any;
   fs= inject (FirestoreService)

    constructor( ) {




    }

     @Input() showModalEdit: boolean = false;
      @Input() item: any; // Item a ser editado
     // @Input() ultmes: any
      @Output() close = new EventEmitter<void>();
      @Output() save = new EventEmitter<any>();




      ngOnChanges(changes: SimpleChanges): void {
        if (changes['item'] && this.item) {
          this.editedItem = { ...this.item }; // Cria uma cópia para edição

          console.log(this.editedItem)
        }
      }

      ngOnInit(): void {

            this.iniciarmeuForm()
    }


      closeModal() {
        this.showModalEdit = false;
        this.close.emit();
      }

     async saveChanges() {

      this.save.emit(this.editedItem);
  console.log(this.editedItem)

        let id = this.editedItem.id
        let valor_atual = this.editedItem.valor_atual

        console.log(id, valor_atual)

        const docRef = doc(this.fs.db, 'patr', id);
           await updateDoc(docRef, { valor_atual: valor_atual, atualizado_em: Timestamp.now()});

      this.closeModal();


      }

        iniciarmeuForm() {
                        this.meuForm = new FormGroup({
                          valor_atual: new FormControl('', Validators.required),



                        });
                      }



}
