import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FirestoreService } from '../../../../services/firestore.service';
import { TimestampService } from '../../../../services/timestamp.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-cad',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './cad.component.html',
  styleUrl: './cad.component.css'
})
export class CadComponent {


  meuForm: FormGroup;
  origem = [
    'despesa',
    'pmt' ,
     'fatura' ,
     'tarefa' ,
     'outros' ]


  recor = [
    "sem repeticao",

   "semanal",
   "quinzenal",
     "mensal",
     "anual"
  ];


  recorrencia: any;


   constructor( private fs: FirestoreService, private ts: TimestampService) {

        this.iniciarmeuForm()
      }

       @Input() showModal3: boolean = false;
        @Input() item: any; // Item a ser editado
       // @Input() ultmes: any
        @Output() close = new EventEmitter<void>();
        @Output() save = new EventEmitter<any>();

        editedItem: any;


        ngOnChanges(changes: SimpleChanges): void {
          if (changes['item'] && this.item) {
            this.editedItem = { ...this.item }; // Cria uma cópia para edição

            console.log(this.editedItem)
          }
        }



        closeModal() {
          this.showModal3 = false;
          this.close.emit();
        }

       async saveChanges() {
          this.save.emit(this.editedItem);

          console.log(this.meuForm.value)

          const compromissogravar = {
            agendado_para: this.ts.converterDataForm(this.meuForm.value.agendado_para),
            descricao: this.meuForm.value.descricao,
            origem: this.meuForm.value.origem,
            valor: this.meuForm.value.valor,
            recor: this.meuForm.value.recor,
            criado_em: Timestamp.now(),
            ativa: true}




         console.log(compromissogravar)


            this.gravarCompromisso(compromissogravar)
             this.save.emit(compromissogravar);

         this.closeModal();

        }

         iniciarmeuForm() {
                this.meuForm = new FormGroup({
                  agendado_para: new FormControl('', Validators.required),
                  descricao: new FormControl('', Validators.required),
                  origem: new FormControl('', Validators.required),
                  valor: new FormControl('', Validators.required),
                 recor: new FormControl('', Validators.required),



                });
              }

              ResetForm() {
                this.meuForm.reset();
                console.log('formulario resetado');
              }

              gravarCompromisso(compromissogravar) {
                const coll = collection(this.fs.db, 'agenda');
                addDoc(coll, compromissogravar)

              }


}
