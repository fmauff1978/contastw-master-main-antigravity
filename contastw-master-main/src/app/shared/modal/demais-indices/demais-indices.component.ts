import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BmarkService } from '../../../services/bmark.service';
import { FirestoreService } from '../../../services/firestore.service';
import { TimestampService } from '../../../services/timestamp.service';
import { doc, updateDoc, Timestamp, collection, addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-demais-indices',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './demais-indices.component.html',
  styleUrl: './demais-indices.component.css'
})
export class DemaisIndicesComponent {

  constructor() {
    this.iniciarmeuForm();  }

     @Input() showModal2: boolean = false;
      @Input() item: any; // Item a ser editado

      @Output() close = new EventEmitter<void>();
      @Output() save = new EventEmitter<any>();

      editedItem2: any;
      meuForm: any;
      fs = inject(FirestoreService);
      ts = inject(TimestampService);
      bm = inject(BmarkService);
      bmaposent1: number = 0;

      ngOnChanges(changes: SimpleChanges): void {
        if (changes['item'] && this.item) {
          this.editedItem2= { ...this.item }; // Cria uma cópia para edição

          console.log(this.editedItem2);
        }

}
   iniciarmeuForm() {
          this.meuForm = new FormGroup({
            mes: new FormControl('', Validators.required),
            saldo: new FormControl('', Validators.required),
          });
        }

        ResetForm() {
          this.meuForm.reset();
          console.log('formulario resetado');
        }


        closeModal() {
    this.showModal2 = false;
    this.close.emit();
  }

  async saveChanges(){
      this.save.emit(this.editedItem2);
        console.log(this.editedItem2);
        let id = this.editedItem2.id;
        let saldoanterior: number = this.editedItem2.vlr_acumulado;

        console.log(this.meuForm.value);
        console.log(id)
        console.log(saldoanterior);

       let mes = this.ts.converterDataForm(this.meuForm.value.mes);

       // let mes = this.meuForm.value.mes;
        console.log(mes);

        let valor: number = this.meuForm.value.saldo;
        console.log(valor);

        if (id == "z7FuGhwBHbUdVcUOfq91"){

          let dif = (valor - saldoanterior)/ saldoanterior;
          console.log(dif);

          let projecao = 4387643 * (1 + dif);
          console.log(projecao);

          const docRef = doc(this.fs.db, 'indices_economicos', id);
                 await updateDoc(docRef, {
                            posicao: mes,
                            projecao: projecao,
                            atualizacao: Timestamp.now(),
                          });
            
             
              const subcolecaoRef = collection(
              this.fs.db,
              "indices_economicos",
              id,
              "referencia"
            );
        
        
             await addDoc(subcolecaoRef, {posicao: mes, valor: valor});
              this.ResetForm();
              
                this.closeModal();  

        }else{

        let atualizado: number = saldoanterior * valor;

        console.log(atualizado);

         const docRef = doc(this.fs.db, 'indices_economicos', id);
                 await updateDoc(docRef, {
                            posicao: mes,
                            projecao: atualizado,
                            atualizacao: Timestamp.now(),
                          });
            
             
              const subcolecaoRef = collection(
              this.fs.db,
              "indices_economicos",
              id,
              "referencia"
            );
        
        
             await addDoc(subcolecaoRef, {posicao: mes, valor: valor});
              this.ResetForm();
              
                this.closeModal();  

        }


  }
}
