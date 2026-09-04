import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { addDoc, collection, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { FirestoreService } from '../../../services/firestore.service';
import { TimestampService } from '../../../services/timestamp.service';
import { BmarkService } from '../../../services/bmark.service';

@Component({
  selector: 'app-indice-econ',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './indice-econ.component.html',
  styleUrl: './indice-econ.component.css'
})
export class IndiceEconComponent {

constructor() {
    this.iniciarmeuForm();  }

   @Input() showModal: boolean = false;
    @Input() item: any; // Item a ser editado
  
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();
  
    editedItem: any;
    meuForm: any;
    fs = inject(FirestoreService);
    ts = inject(TimestampService);
    bm = inject(BmarkService);
    bmaposent1: number = 0;
  
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['item'] && this.item) {
        this.editedItem = { ...this.item }; // Cria uma cópia para edição
  
        console.log(this.editedItem);
      }
    }

     async saveChanges() {
        this.save.emit(this.editedItem);
        console.log(this.editedItem);
        let id = this.editedItem.id;
        let saldoanterior: number = this.editedItem.vlr_acumulado;
    
        console.log(this.meuForm.value);
        console.log(id)
    
       let mes = this.ts.converterDataForm(this.meuForm.value.mes);
    
       // let mes = this.meuForm.value.mes;
        console.log(mes);
    
        let valor: number = this.meuForm.value.saldo;
        console.log(valor);
      //      const inc = {
       
      //    posicao: mes,
      //    valor: valor
 
      // };

        let atualizado: number = parseFloat((((saldoanterior + 100) * (1 + (valor / 100))) - 100).toFixed(2));
        let bmaposent0 = await this.bm.getBmark('Mlb5v3nyBxYFS3xdWlQU');
        console.log(bmaposent0);
        this.bmaposent1 = (bmaposent0 * (1 + (valor / 100)));
        console.log(this.bmaposent1);

         const docRef0 = doc(this.fs.db, 'bmark', 'Mlb5v3nyBxYFS3xdWlQU');
         await updateDoc(docRef0, {
                    alvo: this.bmaposent1,
                  
                    atualizacao: Timestamp.now(),
                  });

                  const docRef1 = doc(this.fs.db, 'bmark', 'e1Mw8G97efqoj7fliHwY');
         await updateDoc(docRef1, {
                    alvo: ((this.bmaposent1)*0.8)/100,
                  
                    atualizacao: Timestamp.now(),
                  });

                  

        const docRef = doc(this.fs.db, 'indices_economicos', id);
         await updateDoc(docRef, {
                    posicao: mes,
                    vlr_acumulado: atualizado,
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
    this.showModal = false;
    this.close.emit();
  }
}
